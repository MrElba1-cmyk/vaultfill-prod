import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface KnowledgeSection {
  title: string;
  content: string;
  citations?: string[];
}

interface ParsedDocument {
  id: string;
  filename: string;
  sections: KnowledgeSection[];
  answers: Record<string, string>;
}

// Parse markdown content and extract sections
function parseMarkdownContent(content: string, filename: string): KnowledgeSection[] {
  const sections: KnowledgeSection[] = [];
  const lines = content.split('\n');
  let currentSection: KnowledgeSection | null = null;
  
  for (const line of lines) {
    // Look for headers
    if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) {
      // Save previous section if exists
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        title: line.replace(/^#+\s+/, '').trim(),
        content: '',
        citations: [filename]
      };
    } else if (currentSection && line.trim()) {
      // Add content to current section
      currentSection.content += (currentSection.content ? '\n' : '') + line.trim();
    }
  }
  
  // Add the last section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}

// Generate questionnaire answers based on document content
function generateAnswersFromSections(sections: KnowledgeSection[], docId: string): Record<string, string> {
  const answers: Record<string, string> = {};
  
  for (const section of sections) {
    const lowerTitle = section.title.toLowerCase();
    const lowerContent = section.content.toLowerCase();
    
    // Map sections to questionnaire fields based on content
    if (lowerTitle.includes('role') || lowerContent.includes('role') || lowerContent.includes('responsibility')) {
      answers.roles = section.content.split('\n')[0] || section.content.substring(0, 120) + '...';
    }
    
    if (lowerTitle.includes('asset') || lowerContent.includes('asset') || lowerContent.includes('inventory')) {
      answers.asset = section.content.split('\n')[0] || section.content.substring(0, 120) + '...';
    }
    
    if (lowerTitle.includes('access') || lowerContent.includes('access control') || lowerContent.includes('privilege')) {
      answers.access = section.content.split('\n')[0] || section.content.substring(0, 120) + '...';
    }
    
    if (lowerTitle.includes('audit') || lowerTitle.includes('evidence') || 
        lowerContent.includes('audit') || lowerContent.includes('evidence')) {
      answers.audit = section.content.split('\n')[0] || section.content.substring(0, 120) + '...';
    }
  }
  
  return answers;
}

// Parse a single document file
function parseDocument(filePath: string): ParsedDocument | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const filename = path.basename(filePath);
    const id = filename.replace('.md', '').toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const sections = parseMarkdownContent(content, filename);
    const answers = generateAnswersFromSections(sections, id);
    
    return {
      id,
      filename,
      sections,
      answers
    };
  } catch (error) {
    console.warn(`Failed to parse document: ${filePath}`, error);
    return null;
  }
}

// Parse all documents in the sample-vault directory
function parseKnowledgeVault(): ParsedDocument[] {
  const vaultPath = path.join(process.cwd(), 'data', 'sample-vault');
  const documents: ParsedDocument[] = [];
  
  try {
    const files = fs.readdirSync(vaultPath);
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(vaultPath, file);
        const doc = parseDocument(filePath);
        if (doc) {
          documents.push(doc);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to read knowledge vault directory:', error);
  }
  
  return documents;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const docId = url.searchParams.get('docId');
    
    const documents = parseKnowledgeVault();
    
    let response;
    if (docId) {
      // Return specific document answers
      const document = documents.find(doc => doc.id === docId);
      response = NextResponse.json({ answers: document?.answers || {} });
    } else {
      // Return all documents
      response = NextResponse.json({ documents });
    }
    
    // Add caching headers for performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error('Knowledge API error:', error);
    return NextResponse.json({ error: 'Failed to parse knowledge vault' }, { status: 500 });
  }
}