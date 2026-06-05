# Delegation Source of Truth - User Panel

## Product Context

The Delegation Source of Truth is a centralized platform for managing healthcare delegation data — tracking which functions (credentialing, claims processing, utilization management, etc.) a health plan delegates to downstream entities (medical groups, vendors, IPAs), and the associated provider network data. It replaces multiple disconnected systems that currently fragment this information, serving as the single authoritative source.

---

## User Type 1: Super User

### Profile

| Attribute | Detail |
|---|---|
| **Role** | Delegation Compliance Analyst / Delegation Oversight Specialist |
| **Department** | Delegation Oversight & Compliance |
| **Team size** | 10-50 users |
| **Technical comfort** | Mixed — some are power users comfortable with complex tables and filters; others prefer guided, step-by-step workflows |
| **Workflow cadence** | Weekly/periodic — batch updates tied to audit cycles, contract renewals, and regulatory review periods |

### Responsibilities
- Maintain accuracy of delegation data across all delegated entities and functions
- Update delegation statuses, effective/renewal dates, and audit schedules
- Record audit findings, corrective action plans, and compliance scores
- Modify entity attributes (contact info, contract terms, organizational details)
- Ensure data reflects current regulatory and contractual obligations

### Goals
- Have a single, reliable place to view and update all delegation information
- Quickly locate and update specific fields across entities and functions
- Maintain an accurate audit trail of changes
- Reduce time spent reconciling data across disconnected systems
- Ensure downstream consumers always see current, accurate data

### Frustrations (with current state)
- Data is scattered across multiple systems with no single source of truth
- Updating one field may require touching several disconnected tools
- Difficult to know if the data others are consuming is current
- No clear audit trail of who changed what and when
- Periodic review cycles require manually pulling data together from multiple sources

### Key Workflows
1. **Periodic review cycle**: Pull up a delegated entity, review all associated functions and their current status, update fields as needed (dates, compliance scores, findings)
2. **Audit-driven updates**: After an audit, update findings, corrective action plans, and compliance status for the audited entity
3. **Contract renewal**: Update contract terms, effective dates, and delegation scope when agreements are renewed
4. **Ad hoc corrections**: Fix data quality issues as they're discovered (contact info, entity attributes, misclassified functions)

### Synthetic Persona: Karen Malloy

> **Karen**, 47, has been in delegation oversight at Aetna for 12 years. She manages a portfolio of ~30 delegated entities across multiple markets. Every quarter, she works through her review cycle — pulling up each entity, checking that credentialing, claims, and UM delegation details are current, and updating anything that's changed since the last cycle. She's comfortable with spreadsheets and has built her own tracking tools in Excel over the years, but she's tired of maintaining them. She wants a system that "just has everything in one place" so she can stop cross-referencing three different tools to answer a simple question. She's methodical, detail-oriented, and protective of data accuracy — if the system makes it easy to accidentally overwrite something, she'll lose trust in it fast.

---

## User Type 2: Read-Only User

### Profile

| Attribute | Detail |
|---|---|
| **Role** | Varies — spans downstream data consumers, auditors/reviewers, and leadership/executives |
| **Department** | Operations, Compliance, Network Management, Finance, Executive Leadership |
| **Team size** | 10-50 users |
| **Technical comfort** | Ranges from moderate (operational staff) to low (executives who want quick answers) |
| **Workflow cadence** | On-demand — accesses data when a question comes up, a report is needed, or a decision requires delegation context |

### Sub-segments

**A. Downstream Consumer (Operations, Network Management)**
- Uses delegation data to inform their own work — e.g., knowing which entity handles credentialing for a given market affects how they route provider inquiries
- Needs reliable, current data without having to ask the compliance team "is this still accurate?"
- Typically views data at entity and function level

**B. Auditor / Reviewer**
- Verifies delegation data for internal or regulatory audits
- Needs to see detailed field-level data plus change history
- Should not be able to modify data — separation of duties is important
- May need to view data across many entities at once for audit sampling

**C. Leadership / Executive**
- Checks high-level delegation status for decision-making and oversight
- Wants summary views — how many delegated entities, what's the compliance posture, where are the risks
- Drills into detail only when something looks off
- Values dashboards and at-a-glance indicators over dense tables

### Goals
- Access current, trustworthy delegation data without asking someone to pull it
- View data at the level of granularity appropriate to their role — from high-level summaries to field-level detail
- Understand delegation relationships and status quickly
- Trust that what they're seeing is the authoritative version

### Frustrations (with current state)
- Never sure which spreadsheet or system has the latest version of the data
- Have to ask the compliance team for information instead of self-serving
- No way to see a high-level picture without manually aggregating data
- Difficulty understanding delegation relationships across markets and entities

### Key Workflows
1. **Lookup**: "Which entity handles credentialing for this market, and is the delegation current?"
2. **Audit preparation**: Pull a sample of delegated entities and review their compliance status, dates, and findings
3. **Executive check-in**: View a summary of delegation health — how many entities, any overdue audits, any open corrective action plans
4. **Report generation**: Extract delegation data for a downstream report or presentation

### Synthetic Persona: Marcus Chen

> **Marcus**, 34, is a Network Operations Analyst who frequently needs to know which functions are delegated to which entities so he can route provider issues correctly. He doesn't care about the audit history or compliance scores — he just needs to quickly find out "who handles credentialing for this medical group?" and trust that the answer is current. He accesses the system a few times a week, usually in response to a specific question. He wants fast lookups and doesn't want to wade through fields that aren't relevant to him.

### Synthetic Persona: Diane Osei

> **Diane**, 52, is a VP of Delegation Oversight. She checks in monthly to understand the overall delegation landscape — how many entities are delegated, which audits are coming due, where corrective action plans are still open. She wants a dashboard that tells her where to focus attention without having to dig through entity-by-entity details. When something looks off, she drills in to understand it, then asks her team (Karen's team) to investigate or update. She values clarity and brevity — if the system makes her click through five levels to find a number, she'll stop using it and ask someone to pull her a spreadsheet instead.

---

## Shared Characteristics (Both User Types)

- **Domain**: Healthcare insurance — delegation oversight and compliance
- **Data navigation**: Both need to move between high-level views (summary/aggregate) and low-level views (entity, function, field detail)
- **Trust in data**: Critical — the whole point of the product is to be the authoritative source, so both user types need confidence that what they see is accurate and current
- **Organization**: Aetna / CVS Health
- **Current pain**: Multiple disconnected systems with no single source of truth for delegation data
