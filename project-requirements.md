 	q# D360 - Delegation Source-of-Truth Tool
## Product Requirements

---

## 1. Product Overview

**Project Name:** D360 - Delegation Source-of-Truth
**Platform:** Appian (CVS enterprise portal, alongside P360)
**Organization:** Aetna / CVS Health

### What D360 Is

D360 is a **centralized aggregation and reference layer** for delegation data. It consolidates information from multiple non-integrated source systems into a single, searchable view so that users can self-serve answers to cross-system questions without manually compiling data from disparate tools.

D360 is designed to answer:
- Cross-system questions ("Who is delegated for what?")
- Leadership inquiries ("How many UM delegates do we have?")
- Eventually, compliance-related questions ("Which delegates are in scope for the CMS Final Rule?")

### What D360 Is Not

- **Not a workflow execution system** — it does not manage tasks, approvals, or process steps
- **Not a task management tool** — it does not assign or track work items
- **Not a monitoring dashboard** — it does not provide real-time KPIs, alerts, or operational dashboards
- **Not a system of record** — it does not own or author delegation data; it aggregates from source systems

### Primary Value

Replace fragmented, manual data gathering with a single reference point. Enable faster, self-service insights within the constraints of source system data quality and freshness.

---

## 2. Core Problem

### Current State

Delegation data is stored across multiple non-integrated systems:
- **Archer** (primary source for Clinical delegation data)
- **EPDB** (Enterprise Provider Database)
- **SCM** (Supply Chain Management)
- **CTR** (Contract Repository)
- **Procurement**
- **GRITT** (QuickBase — Credentialing delegation tracking)
- Various **Access databases, spreadsheets, and LOB-specific tools**

### Pain Points

- No single, reliable list of delegate partners and their delegations
- Data is fragmented, inconsistent, and difficult to navigate across systems
- Primary business users (e.g., Delegations Business Owner) have **no direct access to source systems** and rely on manually compiled Excel trackers assembled from data provided by other teams
- Teams spend significant effort stitching together data from ~12 separate sources to answer a single question
- Clinical (UM, CM) and Claims delegations are especially hard to consolidate
- Naming inconsistencies across systems make entity reconciliation extremely difficult

### Impacts

- Data inconsistencies and duplication
- Compliance and regulatory risk (e.g., difficulty identifying all UM delegates for CMS Final Rule updates)
- Slow decision-making and manual rework
- Erosion of trust in data quality

---

## 3. MVP Scope

### Included

- Delegate + delegation data aggregation across source systems
- Centralized visibility layer (search, filter, view)
- Basic reporting and data export
- Limited editing of **tool-native fields only** (fields that exist solely within D360, not sourced from external systems)
- Small initial user group (delegation team + select stakeholders)

### Excluded (MVP / Iteration 1)

- Compliance workflows or tracking
- Monitoring dashboards or operational KPI views
- Bi-directional data sync (no write-back to source systems)
- Broad enterprise rollout
- Credentialing delegation type (tracked separately in GRITT/QuickBase)
- All non-Clinical, non-Claims delegation types as primary data objects (visible as reference values but not primary focus)

### Delegation Types

**MVP focus:**
- Clinical-UM (Utilization Management)
- Clinical-CM (Care Management)
- Claims

**Post-MVP (visible as field values but not primary workflow):**
- Clinical-DM, Credentialing, Customer Service, Vendor-Medicare FDR, Vendor Credentialing, Vendor Offshore

---

## 4. Data Model

### Conceptual Hierarchy

```
Delegate (Parent)
│
│   General attributes:
│   - Identity (name, TIN, Archer ID, entity type)
│   - Geography (address, state, service area)
│   - Contacts (UM, CM, Claims, Clinical, Contracting, Technical)
│   - Organizational (network contractor, engagement manager)
│
└── Delegation 1 (Child)
│     - Product-specific (LOB, product, membership)
│     - Function-specific (delegation type, model, delegated services)
│     - Contract-specific (effective/renewal/term dates, status)
│     - Audit-specific (timeline, last completed, next due, CAP)
│     - Type-conditional fields (Decision Auth for UM, Accumulators for Claims)
│
└── Delegation 2 (Child)
│     ...
│
└── Delegation N (Child)
      ...
```

### Key Rules

1. A **Delegate** is an external entity (provider or vendor) receiving delegated responsibilities from Aetna. It exists at a parent level.

2. A **Delegation** is a formal, contractual agreement between Aetna and a delegate. Delegations are **independent objects** — not attributes of a delegate.

3. A single delegate can have **multiple delegations**, typically split by:
   - **Product** (Medicare, Medicaid, Commercial, etc.)
   - **Function** (Utilization Management, Care Management, Claims)

4. **Delegations must remain separate and distinct.** They cannot be grouped, merged, or collapsed across products or LOBs.

5. Each delegation has a **layered contract structure**:
   - A base agreement exists at the delegate level
   - Each delegation is a product-specific, independently signed component
   - Each delegation has its own effective/termination dates, regulatory requirements, and audit obligations

### UX Implications

- The primary entry point is the **delegate level** — user questions often start with "Who is the delegate?"
- Users must be able to **drill down** from delegate to individual delegations
- However, users also need **delegation-level entry points** — e.g., "Show me all UM delegations" regardless of parent delegate. Navigation should not always require the delegate as the starting point.
- The 1:N relationship must be visually clear and navigable in both directions

---

## 5. Key Data Attributes (MVP)

### Delegate-Level Fields

| Field | Description |
|---|---|
| Archer ID | Unique identifier from Archer |
| Contracted Entity | Legal name of the entity on the contract / W-9 |
| Audited Entity | The entity that is actually audited. Same as Contracted Entity unless work is sub-delegated to an MSO, in which case the MSO becomes the Audited Entity. |
| MSO (Management Services Organization) | If the delegate sub-delegates work to an MSO, this field identifies the MSO. When populated, the MSO is also the Audited Entity. Null when no sub-delegation exists. |
| Type of Delegated Entity | Provider or Vendor |
| TIN | Tax Identification Number |
| Address | Entity address(es) |
| State | State of operation |
| Service Area | County, zip, mileage-based service area |
| Network Contractor | Associated Aetna network contractor |
| Engagement Manager | Assigned engagement manager |
| Contacts | UM, CM, Claims, Clinical, Contracting, Technical (as applicable) |

### Delegation-Level Fields

| Field | Description |
|---|---|
| Delegation Type | Clinical-UM / Clinical-CM / Claims (MVP) |
| Model | Standard / Standard w/ Exception / Custom |
| Delegated Services | Specific services delegated (for exception/custom models) |
| Services Delegated | Medical, Behavioral Health, Transplant |
| Line of Business (LOB) | Medicare / Medicaid / Commercial / IFP / DSNP / MMP / FIDE |
| Product | HMO/POS, PPO/EPO, IFP HMO/EPO/PPO, Part D, BH, Other |
| Membership by LOB | Member count per line of business |
| Status | Approved / Terminated / Under Review / Pend Entity / Draft |
| Effective Date | Start date of the specific delegation agreement |
| Term Date | Expiration/termination date of the delegation (null for evergreen or not-yet-determined contracts) |
| Contract Renewal Date | Next renewal date |
| Oversight Audit Timeline | Frequency (Yearly / Bi-annual / Quarterly) |
| Last Audit Completed | Date of most recent audit |
| Next Audit Due | Date of next scheduled audit |
| Corrective Action Plan | Whether an active CAP exists (boolean for MVP) |

### Type-Conditional Fields

| Field | Applies To | Description |
|---|---|---|
| Decision Auth Communication | Clinical-UM only | Electronic 278 / Manual Log |
| Encounter Submission | Claims only | Electronic 837 / Manual |
| Accumulators | Claims only | Yes / No |

---

## 6. User Roles & Permissions

### Standard User (Primary MVP Audience)

- **Who:** Delegation team members (primary), with potential light usage from network and clinical operations staff
- **Team size:** 10–50 users
- **Usage pattern:** Ad hoc, question-driven — not continuous
- **Typical questions:**
  - "Who is the delegate?"
  - "What delegations exist for this entity?"
  - "Who are the contacts?"
  - "How many UM delegates do we have?"
- **Capabilities:**
  - Search, filter, view all delegation data
  - Export data / run reports
  - Strictly read-only — no editing

### Super User (Primary Owner Persona)

- **Who:** Delegations Business Owner and designated team members responsible for responding to leadership and compliance inquiries
- **Team size:** Small subset (estimated 5–15 users)
- **Usage pattern:** More frequent, driven by leadership requests, audit cycles, and compliance reviews
- **Responsibilities:**
  - Aggregate and validate data across source systems
  - Respond to leadership and compliance inquiries
  - Extract reports and filtered lists
  - Supplement records with tool-native annotations
- **Capabilities:**
  - Everything a Standard User can do
  - Edit **tool-native fields only** — fields that exist solely within D360 and are not sourced from external systems
  - **Add, edit, and delete notes** on Delegate Detail pages (text-based, with timestamp and author attribution)
  - **Cannot** modify external system data (no system-of-record overwrite, no write-back)

### UX Requirement: Read-Only vs Editable Distinction

The interface must clearly distinguish between:
- **Read-only fields** — data sourced from external systems (Archer, EPDB, etc.). These are displayed but cannot be edited in D360.
- **Editable fields** — tool-native data that exists only in D360. Super Users can modify these.

**Note:** The specific set of tool-native (editable) fields has not yet been defined. This will be determined in a future iteration. For now, the prototype should demonstrate the edit/view mode toggle concept without committing to which specific fields are editable.

---

## 7. Jobs To Be Done

1. **Look up** a specific delegate or delegation to answer a question
2. **Scan** key attributes across many records to identify patterns or outliers
3. **Filter and search** across multiple dimensions (LOB, type, state, status, entity name, TIN)
4. **Identify gaps** — missing data, incomplete records
5. **Locate data** for audit, regulatory, or leadership requests
6. **Annotate** records with tool-native notes or corrections (Super Users only)
7. **Export** filtered data sets for external use (reports, presentations)

---

## 8. UX Principles

1. **Reference tool, not workflow tool** — optimize for lookup and exploration, not task completion
2. **Dense, scannable data** — prioritize information density appropriate for operational users
3. **Minimal screens** — 2–3 core screens covering the primary use cases
4. **Reduce clicks** — rapid filtering, clear navigation, minimal modal interruptions
5. **Hierarchical clarity** — clearly distinguish delegate-level context from delegation-level detail
6. **Support both entry points** — allow users to start from a delegate OR from a delegation-level query
7. **Data provenance** — build trust by making data origin transparent where possible
8. **Appian-native patterns** — use standard Appian components (data grids, record views, filters) to ensure buildability

---

## 9. Information Architecture

### Screen 1: Landing Page (Primary Entry Point)

**Purpose:** The single starting point for all D360 users. Combines at-a-glance summary statistics, the searchable delegate/delegation list, and an AI-assisted query interface into one unified workspace.

**Design rationale:** Many user questions — "How many UM delegates do we have?" or "Who is the contact for Pacific Health Partners?" — have direct answers that don't require navigating a data table at all. The landing page provides three complementary paths to answers, so users only drill into the list when their question genuinely requires browsing or filtering individual records.

**Three zones:**

**Zone A: Summary Statistics & Quick Reports (top)**
- **Summary bar:** Key counts displayed inline — Total Delegates and Active Delegations — always visible by default on page load
- **Quick Reports section:** A set of clickable list cards, each linking to a dedicated report page:
  - **Delegates with Alerts:** Links to report pages for alert-type conditions (e.g., Open CAPs)
  - **Delegates by LOB:** Clickable list of LOBs with delegate counts, linking to per-LOB report pages
  - **Delegates by Product:** Clickable list of products with delegate counts, linking to per-product report pages
  - **Active Delegations by Type:** Clickable list of delegation types with counts, linking to per-type report pages
- Each Quick Report page shows a filterable, exportable table (CSV/Excel) of the relevant records, with a back-to-dashboard link
- Report pages support filters (e.g., State, Product) with a "Select All" option to enable "all except X" filtering workflows
- Purpose: Answer the most frequently asked questions at a glance and provide one-click access to filtered report views
- **Note:** These are reference statistics, not operational KPIs or monitoring dashboards. They answer "what does our delegation landscape look like?" not "what needs attention today?"

**Zone B: Delegate/Delegation List (center)**
- Search bar (entity name, TIN, Archer ID)
- Faceted filter panel (Status, Delegation Type, LOB, State, Entity Type)
- **Grouped view (default):** Delegations displayed under collapsible delegate headers. Each delegate header shows the entity name and delegation count. Expanding a delegate reveals its individual delegation rows with columns: Delegation Type, Model, LOB, Product, Status, Contract Dates, Audit Status, CAP. Users can expand/collapse individual groups or all groups.
- **Ungrouped view:** A flat list where each row is a unique combination of Contracted Entity + LOB. Columns (Products, Delegation Types, Status) show aggregated values for that entity/LOB pair. Useful for delegation-level queries like "show me all UM delegations" without regard to parent delegate grouping.
- Toggle control to switch between grouped and ungrouped views
- Column sorting, active filter indicators, results count, pagination
- Clicking a delegation row navigates to the parent Delegate Detail page
- Purpose: For questions that require browsing, comparing, or drilling into specific records

**Zone C: AI Assistant (bottom or side panel)**
- Natural-language query interface for delegation data
- Users can type questions like "How many UM delegates do we have?" or "Who is the contact for Pacific Health Partners?"
- Returns data-driven answers from the aggregated dataset
- Suggested questions to guide discovery
- Purpose: Let users ask questions in plain language and get immediate answers — especially useful for ad hoc or one-off questions that don't warrant setting up filters

**How the three zones work together:**
- Summary stats handle the most common, recurring questions passively (always visible)
- The AI assistant handles specific or ad hoc questions conversationally (no navigation required)
- The data table handles exploratory questions that require browsing, comparing, or filtering across records
- Users only need to leave the landing page when they want the full detail view of a specific delegate

**Behavior:**
- All three zones are visible on the same page (no tabs or navigation required)
- Identical view for all user types (no edit controls on this screen)

### Screen 2: Delegate Detail

**Purpose:** Full view of a single delegate and all associated delegations. The primary workspace for understanding an entity's delegation landscape.

**Layout — two approaches (both implemented in prototype for comparison):**

**Option A: Table-First**
- Header: Delegate summary (name, TIN, type, status, state, contacts)
- Body: Table of all delegations with all fields as columns
- Pros: Dense, scannable, efficient for comparing across delegations
- Appian fit: Nested grid within record view

**Option B: Entity-Detail-First**
- Header: Delegate summary panel
- Body: Sectioned by delegation type, with card per delegation showing relevant fields
- Conditional fields shown per type (Decision Auth for UM, Accumulators for Claims)
- Pros: Clear hierarchy, easier to understand one delegation at a time
- Appian fit: Standard record view with related records

**Edit behavior (Super Users only):**
- Edit-mode toggle (View / Edit switch in header)
- Tool-native fields become editable; source system fields remain read-only
- Visual distinction between editable and read-only fields

**Notes section (below delegations table):**
- All users can view notes
- Super Users can add, edit, and delete notes
- Each note includes: text content, author, and timestamp (created or last updated)
- Notes are tool-native data (not sourced from external systems)

**Toggle between views:** Users can switch between Table-First and Entity-Detail-First layouts

---

## 10. Navigation Model

```
Landing Page ──────────────> Delegate Detail
│                                  │
├─ [Summary Stats]           [view delegations]
├─ [Search / Filter List]          │
│       └─ row click ─────>  [toggle table-first
├─ [AI Assistant]              vs entity-detail]
│       └─ entity link ──>         │
│                             [edit tool-native
│                              fields (super users)]
```

**Key navigation considerations:**
- The Landing Page is the single entry point — it contains summary stats, the delegate list, and the AI assistant
- Users can filter by delegation-level attributes (e.g., "Clinical-UM" type) to find delegates indirectly
- The AI assistant can link directly to delegate detail pages from its responses (future enhancement)
- Breadcrumb navigation: D360 > Landing > [Entity Name]

---

## 11. Primary User Flows

### Flow 1: Answering a Leadership Question

*"How many UM delegates do we have in California?"*

1. User lands on Delegate List
2. Sets filters: Delegation Type = Clinical-UM, State = CA
3. Table updates to show filtered results
4. User reads the count from the results indicator ("X delegates")
5. Optionally exports the filtered list

### Flow 2: Looking Up a Specific Delegate

*"What delegations does Pacific Health Partners have?"*

1. User searches for "Pacific Health" in the search bar
2. Clicks the matching row
3. Delegate Detail opens, showing all delegations for that entity
4. User reviews delegation details (types, LOBs, statuses, contract dates)

### Flow 3: Annotating a Record (Super User)

*Super User needs to add a note about an audit finding*

1. Super User navigates to Delegate Detail
2. Toggles to Edit Mode
3. Tool-native fields become editable (visually distinct from read-only fields)
4. Updates the relevant field
5. Saves — change is recorded with timestamp and user attribution
6. Toggles back to View Mode

---

## 12. Data Interaction Model

### Filtering
- **Faceted filters:** Multi-select dropdowns for LOB, Delegation Type, State, Status, Entity Type
- **Date range filters:** Contract dates, audit dates (future consideration)
- **Free-text search:** Entity name, TIN, Archer ID
- **Active filter chips:** Visual indicators of applied filters with one-click removal
- **Results count:** Always visible, updating as filters are applied

### Missing Data Handling
- Empty/null fields display "—" with subtle styling
- Optional: Data completeness indicators per record (future consideration)

### Data Freshness
- Archer updates D360 via a **daily batch feed** — data may be up to 24 hours stale
- The UI should not imply real-time data; consider a "Last updated" timestamp where appropriate

---

## 13. Trust & Adoption

Users may not initially trust centralized aggregated data, especially teams accustomed to their own source systems. The design must support trust-building:

1. **Data origin transparency** — source system attribution available via progressive disclosure (not shown by default, but accessible on demand via hover, expand, or info icon)
2. **Confidence-building mechanisms** — consistent, accurate data over time; clear labeling of data freshness
3. **Cross-check support** — users should be able to validate D360 data against source systems when needed (e.g., linking to Archer records)
4. **Clear read-only labeling** — source system data is explicitly marked as non-editable, reinforcing that D360 is not overriding authoritative sources
5. **Gradual rollout** — start with a small, engaged user group who can validate data quality before broader adoption

---

## 14. System Constraints & Assumptions

### Constraints
- D360 is **not the system of record** — it aggregates and displays data from source systems
- Archer is the primary data source via daily batch feed (data may be up to 24 hours stale)
- Data sourced from multiple systems may be inconsistent
- No write-back to source systems in MVP
- Field applicability differs by delegation type (UM vs Claims)
- Two user types with distinct permission levels
- Built within the CVS Appian portal (shared infrastructure with P360)

### Assumptions
- Data from source systems is aggregated into a unified data layer accessible by Appian
- Delegate and Delegation are the two primary data objects with a 1:N parent-child relationship
- Users authenticate via existing CVS/Aetna SSO
- Role-based access (Standard vs Super User) is managed at the application level
- Audit trail captures who changed what and when for tool-native fields
- Each delegation is independently auditable with its own contract lifecycle

---

## 15. Resolved Decisions

1. **Data provenance display:** Source system attribution should be available but not prominent. Use **voluntary progressive disclosure** — the default view shows clean data without source labels, but users can access provenance information on demand (e.g., hover, expand, or info icon). This supports trust-building without cluttering the primary interface.

2. **Reporting scope (MVP):** Enable users to **export the current filtered list** as a simple download (CSV/Excel). Structured report templates are a likely future need but the specific requirements are not yet known — defer to a later iteration.

3. **AI Assistant scope:** The AI assistant is a **concept to demonstrate**, not a confirmed MVP feature. However, the prototype should make it feel realistic and polished enough to communicate the potential value to stakeholders. Boundaries and scope to be revisited if/when it enters formal MVP planning.

4. **Delegation-level navigation:** Users need the ability to navigate delegations directly — not only through their parent delegate. The landing page list uses a **grouped/ungrouped pattern**: delegations are displayed grouped by delegate (with collapsible sections showing the delegate as a header and its delegations as rows beneath), with the ability to switch to a flat ungrouped view showing all delegations as independent rows. See Section 9, Zone B for details.

---

## 16. Open Questions

1. **Tool-native field definition:** Which specific fields will be editable by Super Users? These are fields that exist only in D360 (not sourced from external systems). Examples might include notes, internal status flags, or compliance annotations — but this needs to be explicitly defined.

2. **Landing page summary stats:** Which specific statistics and charts should appear in the summary zone of the landing page? Likely candidates include total delegates, total delegations, and breakdowns by delegation type, LOB, and status — but the exact set should be confirmed in the next stakeholder session.

3. **Audited Entity Status:** Is this a distinct field from delegation-level status (Approved/Terminated/etc.), or should they be treated as a single concept?

4. **Compliance/audit model depth:** Should MVP include any structured compliance tracking beyond the boolean CAP field? The reference docs describe a richer model (Compliance Topic > Event > Attachment) that may be needed for future iterations.


---

## 16. Design & Fidelity Notes

- **Prototype fidelity:** Low-to-medium — focus on structure, data relationships, and interaction patterns over visual polish
- **Appian-native patterns only** — no custom UI components that would be difficult to implement in Appian
- **Aetna enterprise design sensibilities:** Clean, structured, accessible
- **Color used functionally** (status indicators, data type distinctions) not decoratively
