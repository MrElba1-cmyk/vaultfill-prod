/**
 * Framework & Topic Detector
 *
 * Robust keyword-to-context mapping for compliance frameworks and topics.
 * Used to augment RAG queries with targeted context when a user mentions
 * specific frameworks, controls, or buying signals.
 */

export interface DetectedContext {
  /** Canonical context label (e.g., "SOC 2", "ISO 27001") */
  label: string;
  /** Category for grouping */
  category: 'framework' | 'control' | 'privacy' | 'buying_signal';
  /** Augmented search query to boost RAG relevance */
  ragQuery: string;
  /** Keywords that triggered this detection */
  matchedKeywords: string[];
}

interface KeywordMapping {
  keywords: string[];
  label: string;
  category: DetectedContext['category'];
  ragQuery: string;
}

const KEYWORD_MAP: KeywordMapping[] = [
  // --- Frameworks ---
  {
    keywords: ['soc 2', 'soc2', 'soc-2', 'type 2', 'type ii', 'type two', 'ssae 18', 'trust services criteria'],
    label: 'SOC 2',
    category: 'framework',
    ragQuery: 'SOC 2 Type II controls logical access encryption MFA audit',
  },
  {
    keywords: ['iso', '27001', '27002', 'iso 27001', 'iso27001', 'iso-27001', 'iso 27002', 'isms'],
    label: 'ISO 27001',
    category: 'framework',
    ragQuery: 'ISO 27001 information security policy asset management roles ISMS',
  },
  {
    keywords: ['gdpr', 'data protection', 'data subject rights', 'right to erasure', 'right to be forgotten', 'dpia'],
    label: 'GDPR',
    category: 'privacy',
    ragQuery: 'GDPR data protection privacy personal data retention data subject rights',
  },
  {
    keywords: ['hipaa', 'phi', 'protected health information', 'health insurance portability'],
    label: 'HIPAA',
    category: 'framework',
    ragQuery: 'HIPAA protected health information security safeguards',
  },
  {
    keywords: ['nist', 'nist csf', 'nist 800-53', 'nist 800-171', 'cybersecurity framework'],
    label: 'NIST',
    category: 'framework',
    ragQuery: 'NIST cybersecurity framework controls security assessment',
  },
  {
    keywords: ['pci dss', 'pci-dss', 'payment card', 'cardholder data'],
    label: 'PCI DSS',
    category: 'framework',
    ragQuery: 'PCI DSS payment card data security encryption access controls',
  },
  {
    keywords: ['fedramp', 'federal risk', 'fed ramp'],
    label: 'FedRAMP',
    category: 'framework',
    ragQuery: 'FedRAMP federal risk authorization security controls',
  },
  {
    keywords: ['cmmc', 'cybersecurity maturity'],
    label: 'CMMC',
    category: 'framework',
    ragQuery: 'CMMC cybersecurity maturity model certification controls',
  },

  // --- Controls / Topics ---
  {
    keywords: ['encryption', 'aes', 'at rest', 'in transit', 'tls', 'ssl', 'key management', 'kms', 'encrypt'],
    label: 'Encryption',
    category: 'control',
    ragQuery: 'encryption at rest in transit key management KMS AES TLS',
  },
  {
    keywords: ['mfa', 'multi-factor', '2fa', 'two-factor', 'authenticator', 'security key', 'yubikey'],
    label: 'MFA / Access Controls',
    category: 'control',
    ragQuery: 'MFA multi-factor authentication access control privileged access',
  },
  {
    keywords: ['access control', 'rbac', 'least privilege', 'provisioning', 'deprovisioning', 'joiner mover leaver', 'jml'],
    label: 'Access Controls',
    category: 'control',
    ragQuery: 'access control least privilege provisioning deprovisioning RBAC JML',
  },
  {
    keywords: ['audit', 'logging', 'monitoring', 'siem', 'audit trail', 'audit log'],
    label: 'Audit & Logging',
    category: 'control',
    ragQuery: 'audit logging monitoring SIEM audit trail evidence',
  },
  {
    keywords: ['backup', 'disaster recovery', 'business continuity', 'dr plan', 'rpo', 'rto'],
    label: 'Backup & DR',
    category: 'control',
    ragQuery: 'backup disaster recovery business continuity RPO RTO',
  },
  {
    keywords: ['incident response', 'breach', 'security incident', 'incident management'],
    label: 'Incident Response',
    category: 'control',
    ragQuery: 'incident response security incident breach management',
  },
  {
    keywords: ['vulnerability', 'penetration test', 'pen test', 'vuln scan', 'vulnerability management'],
    label: 'Vulnerability Management',
    category: 'control',
    ragQuery: 'vulnerability management penetration testing scanning remediation',
  },
  {
    keywords: ['vendor management', 'third party', 'third-party', 'supply chain', 'vendor risk'],
    label: 'Vendor Management',
    category: 'control',
    ragQuery: 'vendor management third party risk assessment supply chain',
  },
  {
    keywords: ['data retention', 'data deletion', 'data classification', 'data lifecycle'],
    label: 'Data Management',
    category: 'privacy',
    ragQuery: 'data retention deletion classification lifecycle privacy',
  },

  // --- Buying Signals ---
  {
    keywords: ['cost', 'price', 'pricing', 'how much', 'subscription', 'free trial', 'free tier', 'enterprise plan', 'plans', 'budget', 'affordable', 'expensive', 'pay', 'roi', 'return on investment'],
    label: 'Pricing / Buying Signal',
    category: 'buying_signal',
    ragQuery: '', // No RAG needed for pricing
  },
];

/**
 * Detect all matching framework/topic contexts from user input.
 * Returns matches sorted by relevance (number of keyword hits).
 */
export function detectFrameworksAndTopics(userMessage: string): DetectedContext[] {
  const lower = userMessage.toLowerCase();
  const results: (DetectedContext & { hitCount: number })[] = [];

  for (const mapping of KEYWORD_MAP) {
    const matchedKeywords: string[] = [];
    for (const kw of mapping.keywords) {
      // Use word boundary matching for short keywords to avoid false positives
      if (kw.length <= 3) {
        // For very short keywords like 'iso', 'aes', 'mfa', use word boundaries
        const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(lower)) {
          matchedKeywords.push(kw);
        }
      } else {
        if (lower.includes(kw)) {
          matchedKeywords.push(kw);
        }
      }
    }

    if (matchedKeywords.length > 0) {
      results.push({
        label: mapping.label,
        category: mapping.category,
        ragQuery: mapping.ragQuery,
        matchedKeywords,
        hitCount: matchedKeywords.length,
      });
    }
  }

  // Sort by number of keyword hits (most specific first)
  results.sort((a, b) => b.hitCount - a.hitCount);

  return results.map(({ hitCount: _hitCount, ...rest }) => rest);
}

/**
 * Build an augmented RAG query from the user message + detected contexts.
 * Combines the user's original query with targeted framework-specific terms.
 */
export function buildAugmentedQuery(userMessage: string, detectedContexts: DetectedContext[]): string {
  const ragQueries = detectedContexts
    .filter(c => c.ragQuery) // skip buying signals
    .map(c => c.ragQuery);

  if (ragQueries.length === 0) return userMessage;

  // Combine: original query + framework-specific terms (deduplicated via set)
  const augmented = [userMessage, ...ragQueries].join(' ');
  return augmented;
}

/**
 * Check if any detected context is a buying signal.
 */
export function hasBuyingSignal(contexts: DetectedContext[]): boolean {
  return contexts.some(c => c.category === 'buying_signal');
}
