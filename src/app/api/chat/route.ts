import { NextResponse } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import fs from "fs";
import path from "path";
import { semanticSearch, type SearchResult } from "@/lib/vector-search";

interface KnowledgeSection {
  title: string;
  content: string;
  filename: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function loadKnowledgeBase(): KnowledgeSection[] {
  const vaultPath = path.join(process.cwd(), "data", "sample-vault");
  const sections: KnowledgeSection[] = [];

  try {
    const files = fs.readdirSync(vaultPath);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      const content = fs.readFileSync(path.join(vaultPath, file), "utf-8");
      const lines = content.split("\n");
      let current: KnowledgeSection | null = null;

      for (const line of lines) {
        if (line.startsWith("# ") || line.startsWith("## ") || line.startsWith("### ")) {
          if (current) sections.push(current);
          current = {
            title: line.replace(/^#+\s+/, "").trim(),
            content: "",
            filename: file,
          };
        } else if (current && line.trim()) {
          current.content += (current.content ? "\n" : "") + line.trim();
        }
      }
      if (current) sections.push(current);
    }
  } catch (error) {
    console.error("Error loading knowledge base:", error);
  }
  return sections;
}

function searchKnowledge(query: string, sections: KnowledgeSection[]): KnowledgeSection[] {
  const q = query.toLowerCase();
  const keywords = q.split(/\s+/).filter((w) => w.length > 2);

  const scored = sections
    .map((s) => {
      const text = `${s.title} ${s.content}`.toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (text.includes(kw)) score++;
        if (s.title.toLowerCase().includes(kw)) score += 2;
      }
      return { section: s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return scored.map((x) => x.section);
}

/** Check if vector search is available (pgvector DB or local JSON index) */
function hasVectorIndex(): boolean {
  if (process.env.DATABASE_URL) return true;
  try {
    return fs.existsSync(path.join(process.cwd(), "data", "vector-index.json"));
  } catch { return false; }
}

const SYSTEM_PROMPT = `You are the VaultFill Technical Support AI Assistant, an expert in GRC (Governance, Risk, and Compliance) and security questionnaires.

CORE IDENTITY:
- You represent VaultFill Technical Support (never reference individuals or founders by name)
- You specialize in SOC 2, ISO 27001, GDPR, HIPAA, and other compliance frameworks
- You help organizations understand and implement security controls
- You provide expert guidance on security questionnaires and compliance automation

KNOWLEDGE BASE ACCESS:
You have access to VaultFill's internal Knowledge Vault containing detailed compliance documentation. When users ask questions, search this knowledge base and provide accurate, detailed answers based on the available information.

RESPONSE GUIDELINES:
1. **Professional and Helpful**: Always maintain a professional, supportive tone
2. **Knowledge-Based**: Prioritize information from the Knowledge Vault when available
3. **Practical Focus**: Provide actionable guidance and practical insights
4. **Compliance Expertise**: Demonstrate deep understanding of security frameworks
5. **Concise but Complete**: Be thorough yet concise in your responses
6. **Source Attribution**: When using Knowledge Vault information, subtly reference the relevant documentation

EVIDENCE AWARENESS:
- The Knowledge Vault may contain content extracted from Vanta-style evidence files (screenshots, PDFs, compliance reports)
- When referencing evidence, cite the source file name and type (e.g., "Based on evidence from [screenshot: access-review.png]...")
- Evidence from screenshots may have been OCR-extracted; acknowledge if content seems approximate

LIMITATIONS:
- If information isn't in the Knowledge Vault, acknowledge this and provide general guidance
- Never make up specific technical details or compliance requirements
- For complex implementation questions, suggest consulting with VaultFill's compliance experts
- Maintain anonymity constraints - never reference specific individuals

Remember: You are here to help organizations navigate the complex world of compliance and security with confidence and expertise.`;

// Structured extraction mode: return questionnaire field answers for a document
function extractFieldAnswers(docId: string): Record<string, string> {
  const sections = loadKnowledgeBase();
  const docSections = sections.filter(
    (s) => s.filename.replace(".md", "").toLowerCase().replace(/[^a-z0-9]/g, "") === docId
  );

  const answers: Record<string, string> = {};
  for (const section of docSections) {
    const t = section.title.toLowerCase();
    const c = section.content.toLowerCase();
    const snippet = section.content.split("\n")[0] || section.content.substring(0, 120) + "...";

    if (t.includes("role") || c.includes("role") || c.includes("responsibility")) {
      answers.roles = answers.roles || snippet;
    }
    if (t.includes("asset") || c.includes("asset") || c.includes("inventory")) {
      answers.asset = answers.asset || snippet;
    }
    if (t.includes("access") || c.includes("access control") || c.includes("privilege")) {
      answers.access = answers.access || snippet;
    }
    if (t.includes("audit") || t.includes("evidence") || c.includes("audit") || c.includes("evidence")) {
      answers.audit = answers.audit || snippet;
    }
  }
  return answers;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, messages = [], mode, docId } = body;

    // Structured extraction mode for LivePreview
    if (mode === "extract" && docId) {
      const answers = extractFieldAnswers(docId);
      return NextResponse.json({ answers });
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Load and search knowledge base — prefer semantic (vector) search, fall back to keyword
    let matches: KnowledgeSection[] = [];
    let searchMode = "keyword";
    
    if (hasVectorIndex() && process.env.OPENAI_API_KEY) {
      try {
        const vectorResults = await semanticSearch(message, 6);
        matches = vectorResults.map((r) => ({
          title: r.title,
          content: r.content,
          filename: r.filename,
        }));
        searchMode = "semantic";
      } catch (err) {
        console.error("Semantic search failed, falling back to keyword:", err);
        const sections = loadKnowledgeBase();
        matches = searchKnowledge(message, sections);
      }
    } else {
      const sections = loadKnowledgeBase();
      matches = searchKnowledge(message, sections);
    }
    
    // Prepare context from knowledge base
    let knowledgeContext = "";
    if (matches.length > 0) {
      knowledgeContext = `RELEVANT KNOWLEDGE VAULT INFORMATION (via ${searchMode} search):\n\n`;
      for (const match of matches) {
        knowledgeContext += `**${match.title}** (from ${match.filename}):\n${match.content}\n\n`;
      }
      knowledgeContext += "---\n\n";
    }

    // Prepare messages for the AI
    const conversationMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add knowledge context as a system message if we have matches
    if (knowledgeContext) {
      conversationMessages.push({
        role: 'system',
        content: knowledgeContext + "Use this information to provide accurate, helpful responses to the user's question."
      });
    }

    // Add conversation history
    if (Array.isArray(messages) && messages.length > 0) {
      conversationMessages.push(...messages.slice(-8)); // Keep last 8 messages for context
    }

    // Add current user message
    conversationMessages.push({ role: 'user', content: message });

    // Check if OpenAI API key is properly configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-placeholder-key-needs-to-be-set') {
      // Fallback to the original simple response system
      const fallbackAnswer = formulateSimpleAnswer(message, matches);
      return NextResponse.json({
        reply: fallbackAnswer,
        persona: "VaultFill Technical Support",
        sources: matches.map((m) => ({ title: m.title, file: m.filename })),
      });
    }

    // Use Vercel AI SDK for streaming response
    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: conversationMessages,
      temperature: 0.3,
      maxOutputTokens: 800,
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error("Chat API error:", error);
    
    // Fallback error handling
    return NextResponse.json({ 
      error: "I'm experiencing some technical difficulties. Please try again in a moment." 
    }, { status: 500 });
  }
}

// Fallback function for when AI is not available
function formulateSimpleAnswer(query: string, matches: KnowledgeSection[]): string {
  if (matches.length === 0) {
    return "I don't have specific information about that in our Knowledge Vault yet. For detailed questions about VaultFill's compliance capabilities, please reach out to our team — we'd love to help!";
  }

  const citations = matches.map((m) => m.filename.replace(".md", "").replace(/_/g, " "));
  const uniqueCitations = [...new Set(citations)];

  let answer = "Based on our compliance documentation:\n\n";

  for (const match of matches.slice(0, 3)) {
    const snippet =
      match.content.length > 200 ? match.content.substring(0, 200) + "..." : match.content;
    answer += `**${match.title}:** ${snippet}\n\n`;
  }

  answer += `📎 *Sources: ${uniqueCitations.join(", ")}*`;
  return answer;
}