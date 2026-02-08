# SOC 2 Type II Report (Mock) — v2

**Scope:** This is a realistic mock artifact representing common SOC 2 Type II report content. It is not a real audit report.

## Logical Access
- **User Provisioning:** Access is granted based on role and least privilege. Requests require manager approval and are tracked in a ticketing system.
- **Joiner/Mover/Leaver (JML):** Accounts are created, modified, and deactivated according to documented procedures. Deprovisioning occurs within defined SLAs.
- **Privileged Access:** Administrative access is restricted to authorized personnel and reviewed periodically.
- **Access Reviews:** Periodic access reviews are performed for privileged roles and key systems.

## Encryption at Rest
- **Standard:** Data stored in production systems is encrypted at rest using industry-standard encryption.
- **Key Management:** Encryption keys are managed through a centralized KMS with access controls and audit logging.
- **Backups:** Backups inherit encryption-at-rest protections and are stored in secured locations.

## MFA Requirements
- **Enforcement:** MFA is required for administrator access and remote access to production systems.
- **Methods:** Supported methods include authenticator applications and security keys.
- **Exceptions:** Any exception requires documented approval and is time-bound.

## Notes for Reviewers
This mock includes the specific topics commonly requested in vendor security questionnaires:
- logical access controls
- encryption-at-rest controls
- MFA enforcement
