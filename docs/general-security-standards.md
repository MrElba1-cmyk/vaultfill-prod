# General Security Standards (Tier C)

This document provides **general, industry-standard definitions and explanations** of common security and compliance concepts.

**Important:** This content is **not** your organization’s policy and does **not** represent a guarantee of VaultFill’s current certifications or contractual commitments. Use it as a baseline reference.

---

## SOC 2 (Service Organization Control 2)

**What it is:** SOC 2 is an assurance framework developed by the AICPA for evaluating controls at a service organization related to the **Trust Services Criteria (TSC)**.

**Trust Services Criteria (high level):**
- **Security** — protection against unauthorized access (logical and physical)
- **Availability** — system availability as committed/needed
- **Processing Integrity** — processing is complete, valid, accurate, timely, and authorized
- **Confidentiality** — information designated as confidential is protected
- **Privacy** — personal information is collected/used/retained/disclosed/disposed per commitments

**SOC 2 Type I vs Type II:**
- **Type I:** design of controls at a point in time
- **Type II:** operating effectiveness of controls over a period of time

**How to use SOC 2 in questionnaires:**
- Describe your control objective (what you’re trying to achieve)
- Describe the control activity (how you achieve it)
- Provide evidence (logs, screenshots, policies, tickets)
- Clarify scope (systems, environments, time period)

---

## ISO/IEC 27001

**What it is:** ISO/IEC 27001 is an international standard for establishing, implementing, maintaining, and continually improving an **Information Security Management System (ISMS)**.

**Key ideas:**
- Define the **scope** of your ISMS
- Perform **risk assessment** and **risk treatment**
- Implement controls (often mapped via **Annex A**)
- Maintain documentation, internal audits, management review, and continual improvement

**Common Annex A control themes (plain English):**
- Access control and identity
- Cryptography
- Secure development
- Incident management
- Supplier/security in third parties
- Logging/monitoring
- Physical security

---

## Multi-Factor Authentication (MFA)

**What it is:** MFA is an authentication method requiring **two or more** verification factors, typically from different categories:
- **Something you know** (password, passphrase)
- **Something you have** (authenticator app, hardware key)
- **Something you are** (biometrics)

**Why it matters:** MFA reduces the risk of account takeover from credential phishing, password reuse, and brute force.

**Strong MFA options (common best practice):**
- FIDO2/WebAuthn hardware keys (phishing-resistant)
- Authenticator apps (TOTP)

**Weaker options (often allowed but less preferred):**
- SMS-based OTP (susceptible to SIM swap and interception)

**Typical policy guidance:**
- Require MFA for admin access and privileged systems
- Require MFA for SSO/VPN and remote access
- Enforce phishing-resistant MFA for high-risk roles where possible

---

## Encryption

### Encryption in transit
**What it is:** Protects data while it moves across networks.

**Common baseline:** TLS (e.g., TLS 1.2+), with modern cipher suites.

### Encryption at rest
**What it is:** Protects stored data on disks/databases/backups.

**Common baseline:** AES-256 (or equivalent) at rest.

### Key management (why it matters)
Encryption is only as strong as the protection of the keys. Common best-practice elements:
- Key rotation and lifecycle management
- Separation of duties and least privilege
- Audit logging for key access
- Hardware-backed key storage where appropriate (HSM/KMS)

---

## Practical Disclaimer Language (for use when a customer has not uploaded policies)

When answering without customer-provided policy documents, use clear phrasing like:

- **“Note: You haven’t uploaded your specific policy yet, but generally speaking…”**
- **“Generally, industry standards recommend…”**
- **“If you want this to be specific to your environment, upload your policy/evidence and I’ll cite it directly.”**
