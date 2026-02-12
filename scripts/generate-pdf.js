// scripts/generate-pdf.js
// CRITICAL FIX (M6): generate deterministic PDFs whose key strings are recoverable by simple extraction.
// Uses jsPDF with compression disabled so `strings`/`grep` can see key terms in the binary.

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

const PUBLIC_DIR = path.join(__dirname, '../public');
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

function writePdf(outFile, title, lines) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter',
    compress: false, // IMPORTANT: keep text visible to `strings`/`grep`
  });

  const left = 56;
  let y = 72;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(title, left, y);
  y += 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Version 1.0 • Classification: Confidential • Date: ${new Date().toISOString().slice(0, 10)}`, left, y);
  y += 18;

  doc.setDrawColor(52, 211, 153);
  doc.setLineWidth(1);
  doc.line(left, y, 612 - 56, y);
  y += 18;

  doc.setFontSize(11);
  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line, 612 - 56 - 56);
    doc.text(wrapped, left, y);
    y += wrapped.length * 14 + 6;
    if (y > 740) {
      doc.addPage();
      y = 72;
    }
  }

  const outPath = path.join(PUBLIC_DIR, outFile);
  const pdfBytes = doc.output('arraybuffer');
  fs.writeFileSync(outPath, Buffer.from(pdfBytes));
  return outPath;
}

function writeCompanionText(outFile, title, lines) {
  const outPath = path.join(PUBLIC_DIR, outFile);
  const body = [
    title,
    `Version 1.0 • Classification: Confidential • Date: ${new Date().toISOString().slice(0, 10)}`,
    '',
    ...lines,
    '',
  ].join('\n');
  fs.writeFileSync(outPath, body, 'utf-8');
  return outPath;
}

// --- Mission 6 canonical contradictions (must be detected) ---
// Security Policy: RTO 4 hours, Breach Notification 72 hours
// IR Plan:        RTO 12 hours, Breach Notification 5 days

const securityPolicyLines = [
  'Section 1 — Availability and Recovery Objectives',
  'RTO: 4 hours (Tier-1 services).',
  'RPO: 1 hour (Tier-1 services).',
  '',
  'Section 2 — Incident Reporting and Breach Notification',
  'Breach Notification: 72 hours (regulatory/customer, where applicable, from confirmation).',
  'Internal escalation: notify Security within 2 hours of suspected breach identification.',
  '',
  'Section 3 — Audit Logging and Retention',
  'Audit Log Retention: 365 days minimum for authentication, authorization, admin actions, and data access.',
];

const irPlanLines = [
  'Section 1 — Incident Response Objectives',
  'RTO: 12 hours (critical production services) following Severity 1 incidents.',
  '',
  'Section 2 — Notification Timelines',
  'Breach Notification: 5 days (regulatory/customer, where applicable, from confirmation).',
  'Internal escalation: notify Security and Engineering On-Call within 1 hour of suspected breach identification.',
  '',
  'Section 3 — Evidence Preservation and Logging',
  'Audit Log Retention: 90 days minimum for baseline operations; preserve incident-specific logs for 1 year in the case file.',
];

const generated = [];
const generatedTxt = [];

generated.push(writePdf('security-policy.pdf', 'VaultFill — Security Policy (Synthetic)', securityPolicyLines));
generated.push(writePdf('IR-Plan.pdf', 'VaultFill — Incident Response Plan (Synthetic)', irPlanLines));

generatedTxt.push(writeCompanionText('security-policy.txt', 'VaultFill — Security Policy (Synthetic)', securityPolicyLines));
generatedTxt.push(writeCompanionText('IR-Plan.txt', 'VaultFill — Incident Response Plan (Synthetic)', irPlanLines));

console.log('Generated PDFs:');
for (const p of generated) console.log(`- ${p}`);
console.log('Generated companion text:');
for (const p of generatedTxt) console.log(`- ${p}`);
