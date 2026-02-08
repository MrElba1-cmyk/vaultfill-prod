# VaultFill FAQ

This Frequently Asked Questions (FAQ) guide addresses common inquiries from enterprise security leaders, including CTOs and CISOs, regarding VaultFill's security questionnaire automation solution.

## Getting Started

### Q: What is VaultFill, and how does it automate security questionnaires?
A: VaultFill is a platform designed to streamline the process of answering security questionnaires. It leverages your existing security evidence to automatically draft accurate, citation-backed responses, significantly reducing the time and effort typically required. Our system helps turn weeks of work into minutes.

### Q: What type of evidence do we need to provide to get started with VaultFill?
A: To initiate the process, you'll need to upload your core security evidence, such as policies, SOC 2/ISO audit artifacts, vendor documentation, and any existing standard responses. VaultFill then indexes this information into your private Knowledge Vault, forming the basis for automated answer generation.

### Q: How quickly can our team expect to see results after implementing VaultFill?
A: VaultFill is engineered for rapid deployment and value realization. If your core evidence (policies and audit artifacts) is readily available, the platform can generate a usable first draft of a comprehensive security questionnaire in under 10 minutes. This rapid turnaround is crucial for accelerating sales cycles.

### Q: Which security questionnaire formats does VaultFill support?
A: VaultFill offers extensive support for various industry-standard questionnaire formats, including SOC 2, SIG, DDQ, and CAIQ. Additionally, we accommodate custom spreadsheet-based formats and are continuously expanding our support based on evolving customer needs and market demands, ensuring broad applicability.

### Q: Is VaultFill a replacement for our existing GRC or compliance management tools like Vanta or Drata?
A: No, VaultFill is a specialized solution that complements your existing compliance infrastructure. While tools like Vanta or Drata focus on managing your overall compliance program, VaultFill specifically targets and automates the labor-intensive process of completing security questionnaires by utilizing your existing evidence with verifiable citations.

### Q: How can our enterprise start using VaultFill or evaluate its capabilities?
A: We encourage enterprises to begin with our free trial to experience the efficiency and accuracy of VaultFill firsthand. You can typically start a free trial directly from our website or contact our sales team to schedule a personalized demonstration and discuss early access options tailored to your organization's needs.

## Security & Compliance

### Q: How does VaultFill ensure the security of our sensitive evidence and data?
A: VaultFill is built with a security-first architecture designed to meet stringent enterprise requirements. All customer data and evidence are encrypted at rest using AES-256 and in transit via TLS 1.3 protocols, ensuring comprehensive protection throughout its lifecycle. This approach safeguards your most critical information.

### Q: What measures are in place for data isolation and privacy within the VaultFill platform?
A: We implement robust tenant isolation through row-level security at the database level, guaranteeing that your evidence is securely segregated from other clients' data. VaultFill operates under a strict privacy policy, ensuring your data is never used for training our models, maintaining strict confidentiality.

### Q: Is VaultFill compliant with key industry security and privacy standards?
A: Yes, VaultFill is committed to upholding critical security and privacy standards. Our platform is SOC 2 Type II audited annually, ISO 27001 certified, and GDPR compliant, providing assurance regarding our operational security and data handling practices. These certifications underscore our dedication to enterprise security.

### Q: Are audit trails available for all actions performed within VaultFill?
A: Absolutely. VaultFill maintains comprehensive and immutable audit trails for every action taken within the platform, including evidence uploads, answer drafts, and approvals. These logs are designed to support your internal governance and external audit requirements, ensuring transparency and accountability.

### Q: How are encryption keys managed for our data stored within VaultFill?
A: VaultFill utilizes a dedicated Key Management System (KMS) to securely manage all encryption keys. This ensures that cryptographic operations are performed using industry best practices, enhancing the overall security posture of your stored evidence. Our KMS policies are regularly reviewed and updated.

### Q: Does VaultFill ever train its AI models on our proprietary security data or evidence?
A: We maintain a strict policy against using customer data for model training. Your proprietary security data and evidence uploaded to VaultFill remain yours exclusively and are used solely to generate questionnaire responses for your specific organizational needs, preserving confidentiality and intellectual property.

## Features & Capabilities

### Q: How does VaultFill's Automated Questionnaire Drafting work to create consistent answers?
A: Our automated drafting feature intelligently analyzes your uploaded evidence to generate consistent, contextually relevant answers for various questionnaire types. It ensures uniformity in responses across different documents, which is crucial for maintaining brand and compliance integrity and reducing manual inconsistencies.

### Q: What are RAG-Powered Citations, and how do they benefit our review process?
A: RAG (Retrieval Augmented Generation)-Powered Citations are a core feature where every generated answer is directly linked to the exact source document or section within your Evidence Vault. This allows reviewers, including auditors and security teams, to quickly verify accuracy and build trust in the responses by tracing them to their origin.

### Q: What is the "Evidence Vault," and how does it function as a centralized knowledge base?
A: The Evidence Vault centralizes all your security-related documents—such as policies, audit reports, and vendor attestations—into a searchable, intelligent knowledge base. This vault continuously compounds in value, making your evidence easily accessible and actionable for future questionnaire responses, saving significant time.

### Q: How does VaultFill handle responses where the AI's confidence level is not high?
A: VaultFill automatically flags answers with lower confidence levels for human review, ensuring that your team can refine and approve them before export. This intelligent flagging mechanism combines AI efficiency with essential human oversight, maintaining accuracy and compliance with internal standards.

### Q: Can we track changes and maintain an audit history of questionnaire responses?
A: Yes, every edit, modification, and approval within VaultFill is meticulously logged in an audit-ready trail. This comprehensive history ensures full transparency and accountability, which is vital for compliance reporting and internal governance, simplifying audit preparation.

### Q: How does VaultFill facilitate the approval and export of completed questionnaires?
A: Once draft answers are refined and reviewed, they can be approved with a single click within the platform. VaultFill then allows for the seamless export of the completed questionnaire in various formats, ready for immediate submission to your clients or partners, accelerating the closing of deals.

## Pricing & Plans

### Q: Does VaultFill offer different pricing tiers or enterprise plans?
A: VaultFill is designed for enterprise clients with varying needs and offers flexible, tailored enterprise-grade plans. While specific pricing details are customized based on usage, features, and scale, we aim to provide solutions that align with your operational requirements and budget. Please contact our sales team for a custom quote and detailed plan options.

### Q: Is a free trial available for prospective enterprise clients?
A: Yes, we provide a free trial period for enterprises interested in evaluating VaultFill's capabilities. This allows your team to experience the benefits of automated questionnaire drafting and citation generation with your own evidence before making a commitment, enabling a thorough assessment of its value.

### Q: How can we get a personalized demonstration of VaultFill?
A: To better understand how VaultFill can meet your specific organizational needs, we encourage you to request a personalized demonstration. Our experts can walk you through the platform's features, answer specific questions, and discuss how it integrates into your existing security and compliance workflows.

### Q: Are there any implementation or onboarding costs associated with VaultFill?
A: Implementation and onboarding costs can vary depending on the complexity of your integration requirements and the level of white-glove service desired. These details are typically covered during the custom plan quotation process, ensuring transparency and alignment with your enterprise's specific needs.

## Technical

### Q: What is the underlying architecture of VaultFill, particularly concerning security?
A: VaultFill's architecture is built on a modern, cloud-native stack with a focus on enterprise-grade security. It incorporates tenant isolation via row-level security, encrypted evidence storage, robust audit trails, and secure communication protocols, ensuring a resilient and compliant operating environment.

### Q: What technology powers the drafting of questionnaire answers and citation generation?
A: Our core automation relies on Retrieval Augmented Generation (RAG) technology. This advanced AI capability intelligently retrieves relevant information from your Evidence Vault and then generates accurate, contextually appropriate answers, complete with precise citations for verification.

### Q: How does VaultFill handle the indexing and search capabilities for the Evidence Vault?
A: VaultFill employs sophisticated indexing mechanisms to process and categorize all uploaded evidence, making it fully searchable. This ensures that relevant documents and data points can be quickly identified and utilized by the RAG system to generate accurate and verifiable questionnaire responses.

### Q: What are the primary data storage considerations for VaultFill's platform?
A: Data storage in VaultFill is designed for high availability, durability, and security. All data is stored in encrypted formats, with strict access controls and regular backups. Our infrastructure adheres to industry best practices for data sovereignty and resilience.

### Q: Does VaultFill offer APIs or integration capabilities with existing GRC or CRM systems?
A: VaultFill is developed with enterprise ecosystems in mind and offers robust API capabilities for integration with existing GRC, CRM, or other security and compliance management systems. These integrations can streamline workflows, automate data transfer, and enhance overall operational efficiency.