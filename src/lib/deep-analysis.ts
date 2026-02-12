export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type DeepAnalysisRow = {
  finding: string;
  sourceAValue: string;
  sourceBValue: string;
  riskLevel: RiskLevel;
  status: 'VERIFIED' | 'REMEDIATION REQUIRED';
  sourceASnippet?: string;
  sourceBSnippet?: string;
  reconciledLanguage?: string;
};

function normalizeWhitespace(s: string) {
  return (s || '').replace(/\s+/g, ' ').trim();
}

function findSnippet(text: string, pattern: RegExp, window = 140): string | undefined {
  const m = pattern.exec(text);
  if (!m || m.index == null) return undefined;
  const start = Math.max(0, m.index - window);
  const end = Math.min(text.length, m.index + m[0].length + window);
  return normalizeWhitespace(text.slice(start, end));
}

function parseDuration(raw: string): { value: number; unit: 'minutes' | 'hours' | 'days' } | null {
  const s = raw.toLowerCase();
  const m = s.match(/(\d+(?:\.\d+)?)\s*(minute|minutes|min|hour|hours|hr|hrs|day|days|d)\b/);
  if (!m) return null;
  const value = Number(m[1]);
  const u = m[2];
  const unit = u.startsWith('min') ? 'minutes' : u.startsWith('h') ? 'hours' : 'days';
  if (!Number.isFinite(value)) return null;
  return { value, unit };
}

function durationToHours(d: { value: number; unit: 'minutes' | 'hours' | 'days' }): number {
  if (d.unit === 'minutes') return d.value / 60;
  if (d.unit === 'hours') return d.value;
  return d.value * 24;
}

function formatDuration(d: { value: number; unit: 'minutes' | 'hours' | 'days' } | null, fallback?: string): string {
  if (!d) return fallback || 'NOT FOUND';
  const v = d.value;
  const unitLabel = d.unit === 'minutes' ? 'minutes' : d.unit === 'hours' ? 'hours' : 'days';
  return `${v} ${unitLabel}`;
}

export function extractRto(text: string): { value: string; snippet?: string; parsedHours?: number } {
  const patterns: RegExp[] = [
    /recovery\s+time\s+objective\s*\(\s*rto\s*\)\s*[:\-–]?\s*([^\n\.]{0,120})/i,
    /\bRTO\b\s*[:\-–]?\s*([^\n\.]{0,120})/i,
  ];

  let raw = '';
  let snippet: string | undefined;

  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) {
      raw = normalizeWhitespace(m[1]);
      snippet = findSnippet(text, p, 140);
      break;
    }
  }

  const parsed = parseDuration(raw);
  return {
    value: raw ? raw.replace(/\s+\(.*\)\s*$/i, '').trim() : 'NOT FOUND',
    snippet,
    parsedHours: parsed ? durationToHours(parsed) : undefined,
  };
}

export function extractBreachTimelines(text: string): {
  internal: { value: string; snippet?: string; parsedHours?: number };
  regulatory: { value: string; snippet?: string; parsedHours?: number };
} {
  const internalPatterns: RegExp[] = [
    /internal\s+(notification|escalation)\s*[:\-–]?\s*[^\n]{0,240}/i,
  ];
  const regulatoryPatterns: RegExp[] = [
    /(regulatory|customer)\s*\/?\s*(contractual)?\s*notification\s*[:\-–]?\s*[^\n]{0,260}/i,
    /\bBreach\s+Notification\b\s*[:\-–]?\s*[^\n]{0,260}/i,
  ];

  let internalLine = '';
  for (const p of internalPatterns) {
    const m = text.match(p);
    if (m?.[0]) {
      internalLine = m[0].trim();
      break;
    }
  }

  let regulatoryLine = '';
  for (const p of regulatoryPatterns) {
    const m = text.match(p);
    if (m?.[0]) {
      regulatoryLine = m[0].trim();
      break;
    }
  }

  const internalDur = parseDuration(internalLine);
  const regDur = parseDuration(regulatoryLine);

  return {
    internal: {
      value: internalLine
        ? normalizeWhitespace(internalLine.replace(/^internal\s+(notification|escalation)\s*[:\-–]?\s*/i, ''))
        : 'NOT FOUND',
      snippet: internalLine ? normalizeWhitespace(internalLine) : undefined,
      parsedHours: internalDur ? durationToHours(internalDur) : undefined,
    },
    regulatory: {
      value: regulatoryLine
        ? normalizeWhitespace(regulatoryLine.replace(/^\bBreach\s+Notification\b\s*[:\-–]?\s*/i, ''))
        : 'NOT FOUND',
      snippet: regulatoryLine ? normalizeWhitespace(regulatoryLine) : undefined,
      parsedHours: regDur ? durationToHours(regDur) : undefined,
    },
  };
}

export function extractAuditLogRetention(text: string): { value: string; snippet?: string; parsedDays?: number } {
  const patterns: RegExp[] = [
    /audit\s+logs?[^\n]{0,120}retained\s+for\s+([^\n\.]{0,120})/i,
    /\bAudit\s+Log\s+Retention\b\s*[:\-–]?\s*([^\n\.]{0,160})/i,
  ];

  let raw = '';
  let snippet: string | undefined;

  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) {
      raw = normalizeWhitespace(m[1]);
      snippet = findSnippet(text, p, 160);
      break;
    }
  }

  const parsed = parseDuration(raw);
  let parsedDays: number | undefined;
  if (parsed) {
    const hours = durationToHours(parsed);
    parsedDays = hours / 24;
  }

  return {
    value: raw ? raw.trim() : 'NOT FOUND',
    snippet,
    parsedDays,
  };
}

export function compareNumeric(a?: number, b?: number, epsilon = 0.001): 'match' | 'conflict' | 'unknown' {
  if (typeof a !== 'number' || typeof b !== 'number' || !Number.isFinite(a) || !Number.isFinite(b)) return 'unknown';
  return Math.abs(a - b) <= epsilon ? 'match' : 'conflict';
}

export function buildContradictionRows(args: {
  sourceAText: string;
  sourceBText: string;
  sourceAName?: string;
  sourceBName?: string;
}): { rows: DeepAnalysisRow[]; unifiedTruthScore: number } {
  const rtoA = extractRto(args.sourceAText);
  const rtoB = extractRto(args.sourceBText);
  const breachA = extractBreachTimelines(args.sourceAText);
  const breachB = extractBreachTimelines(args.sourceBText);
  const retainA = extractAuditLogRetention(args.sourceAText);
  const retainB = extractAuditLogRetention(args.sourceBText);

  const rows: DeepAnalysisRow[] = [];

  // RTO
  {
    const cmp = compareNumeric(rtoA.parsedHours, rtoB.parsedHours);
    const status = cmp === 'match' ? 'VERIFIED' : cmp === 'conflict' ? 'REMEDIATION REQUIRED' : 'REMEDIATION REQUIRED';
    rows.push({
      finding: 'Recovery Time Objective (RTO)',
      sourceAValue: rtoA.value,
      sourceBValue: rtoB.value,
      riskLevel: status === 'VERIFIED' ? 'LOW' : 'HIGH',
      status,
      sourceASnippet: rtoA.snippet,
      sourceBSnippet: rtoB.snippet,
    });
  }

  // Breach timelines — internal
  {
    const cmp = compareNumeric(breachA.internal.parsedHours, breachB.internal.parsedHours);
    const status = cmp === 'match' ? 'VERIFIED' : 'REMEDIATION REQUIRED';
    rows.push({
      finding: 'Breach Notification — Internal',
      sourceAValue: breachA.internal.value,
      sourceBValue: breachB.internal.value,
      riskLevel: status === 'VERIFIED' ? 'LOW' : 'HIGH',
      status,
      sourceASnippet: breachA.internal.snippet,
      sourceBSnippet: breachB.internal.snippet,
    });
  }

  // Breach timelines — regulatory
  {
    const cmp = compareNumeric(breachA.regulatory.parsedHours, breachB.regulatory.parsedHours);
    const status = cmp === 'match' ? 'VERIFIED' : 'REMEDIATION REQUIRED';
    rows.push({
      finding: 'Breach Notification — Regulatory / Customer',
      sourceAValue: breachA.regulatory.value,
      sourceBValue: breachB.regulatory.value,
      riskLevel: status === 'VERIFIED' ? 'LOW' : 'HIGH',
      status,
      sourceASnippet: breachA.regulatory.snippet,
      sourceBSnippet: breachB.regulatory.snippet,
    });
  }

  // Audit log retention
  {
    const cmp = compareNumeric(retainA.parsedDays, retainB.parsedDays);
    const status = cmp === 'match' ? 'VERIFIED' : 'REMEDIATION REQUIRED';
    rows.push({
      finding: 'Audit Log Retention',
      sourceAValue: retainA.value,
      sourceBValue: retainB.value,
      riskLevel: status === 'VERIFIED' ? 'LOW' : 'MEDIUM',
      status,
      sourceASnippet: retainA.snippet,
      sourceBSnippet: retainB.snippet,
    });
  }

  const verified = rows.filter((r) => r.status === 'VERIFIED').length;
  const unifiedTruthScore = Math.round((verified / rows.length) * 100);

  return { rows, unifiedTruthScore };
}
