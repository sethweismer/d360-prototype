# Delegation Source-of-Truth — Functional Requirements

**Version:** 0.1 (Draft for Stakeholder Review)
**Date:** June 2026
**Status:** Pending Approval

---

## Overview

The Delegation Source-of-Truth is a web-based application that serves as a centralized system of record for delegation agreements managed by the health plan. It enables delegation oversight staff to find, review, and report on delegated entities and their associated delegation agreements across all lines of business, products, and delegation types.

The application replaces manual tracking approaches (e.g., spreadsheets) with a structured, searchable, and auditable interface that supports both day-to-day operational lookups and leadership reporting.

---

## Data Model Summary

The application is organized around a three-level hierarchy:

- **Delegated Entity** — An organization or vendor (Provider or Vendor type) that holds a delegation contract with the health plan.
- **Product** — A specific plan product (e.g., Medicare Advantage HMO) under a given Line of Business (LOB) for which the entity holds delegations.
- **Delegation** — An individual delegation agreement for a specific service type (Clinical-UM, Clinical-PHM, or Claims) under a product.

---

## User Roles

| Role | Description |
|------|-------------|
| **Read-Only User** | Can view all delegation data and generate/export reports. Cannot make changes to records. |
| **Edit User** | Has all read-only capabilities plus the ability to add and edit notes on delegate and delegation records. |

---

## Feature Areas

---

### 1. Global Search

**Description**
A persistent search bar allows users to quickly locate a specific delegated entity or delegation from anywhere in the application, without navigating through lists or reports first.

**Acceptance Criteria**
- The user can search by delegated entity name or entity tracking ID.
- The user can search by delegation tracking ID.
- Search results are displayed as a dropdown as the user types, after at least 2 characters are entered.
- Results are grouped by type: Delegated Entities and Delegations.
- Selecting a search result navigates the user directly to that entity's or delegation's detail page.
- The search bar is accessible from every page in the application.

---

### 2. Dashboard — Summary KPIs

**Description**
The home page displays high-level summary statistics that give the user an immediate snapshot of the overall delegation portfolio.

**Acceptance Criteria**
- The user can see the total number of delegated entities in the system.
- The user can see the total number of active (Approved) delegation agreements.
- Summary statistics reflect current system data without requiring any user action.

---

### 3. Dashboard — Delegate Reports Cards

**Description**
A set of quick-access report cards on the home page shows how many delegated entities fall under each LOB, product, and delegation type. Each item links to a full filterable report.

**Acceptance Criteria**
- The user can see a count of delegated entities grouped by Line of Business (LOB).
- The user can see a count of delegated entities grouped by Product.
- The user can see a count of delegated entities grouped by Delegation Type (Clinical-UM, Clinical-PHM, Claims).
- Items within each card are ordered highest-to-lowest by count.
- Clicking any item navigates to a filterable report pre-scoped to that dimension and value.
- The user can see descriptive helper text that explains what these report cards represent and how to use them.

---

### 4. Dashboard — Delegation Reports Cards

**Description**
A second set of report cards shows how many active delegation agreements fall under each LOB, product, and delegation type.

**Acceptance Criteria**
- The user can see a count of active delegations grouped by Line of Business (LOB).
- The user can see a count of active delegations grouped by Product.
- The user can see a count of active delegations grouped by Delegation Type.
- Items within each card are ordered highest-to-lowest by count.
- Clicking any item navigates to a filterable Active Delegations report pre-scoped to that dimension and value.
- The user can see descriptive helper text that explains what these report cards represent and how to use them.

---

### 5. Delegated Entity Detail

**Description**
A detail page for each delegated entity displays the entity's contract information and a full list of all its delegation agreements.

**Acceptance Criteria**
- The user can view the following entity-level fields: Contracted Entity name, Entity Type, Tracking ID, Address, Contract Effective Date, Contract Renewal Date, and Contract Term Date.
- The user can see all delegations for the entity displayed in a table, including: Delegation Tracking ID, LOB, Product, Delegation Type, Status, Effective Date, Term Date, Audited Entity, and CAP indicator.
- The user can click a delegation's Tracking ID to navigate to the Delegation Detail page for that record.
- The user can see key contacts for the entity (UM, CM, Claims, Clinical, Contracting, Technical), where available.
- The user can copy a contact's email address to the clipboard by clicking on it.
- The user can navigate back to the previous page using a clearly labeled back link.

---

### 6. Delegation Detail

**Description**
A detail page for each individual delegation agreement displays all known fields for that delegation and identifies the delegating entity.

**Acceptance Criteria**
- The user can view the following delegation fields: LOB, Product, Delegation Type, Status, Effective Date, Term Date, Audited Entity, Audited Entity Status, MSO, Service Area, Delegated Services, Engagement Manager, and Corrective Action Plan indicator.
- The user can see which delegated entity the delegation belongs to, with a link to navigate to that entity's detail page.
- When arriving from a report page, the user can navigate to the previous and next delegation in that report's list using Previous/Next controls, without returning to the report.
- The user can see their position within the list (e.g., "3 of 14").
- The user can navigate back to the page they came from (either a delegate detail or a report) using a clearly labeled back link that reflects the originating context.

---

### 7. Notes

**Description**
Users with edit access can add free-text notes to delegated entity and delegation records to capture context, observations, or follow-up actions.

**Acceptance Criteria**
- The user can view existing notes on a delegated entity or delegation record.
- An Edit User can add a new note to a record.
- Notes are displayed in chronological order.
- A Read-Only User can view notes but cannot add or edit them.

---

### 8. Delegated Entities Reports (by LOB / Product / Delegation Type)

**Description**
Three report pages — one each for LOB, Product, and Delegation Type — show all delegated entities associated with a given dimension value. These are accessed from the Delegate Reports cards on the dashboard.

**Acceptance Criteria**
- The user can see all delegated entities matching the pre-selected dimension (LOB, Product, or Delegation Type).
- The user can see the following columns: Delegation Tracking ID, Contracted Entity, Tracking ID, Entity Type, LOB, Product, Delegation Type, Status, Effective Date, Term Date, Audited Entity, and CAP indicator. Columns already implied by the pre-selected dimension are hidden to avoid redundancy.
- The user can filter the results further by: keyword search (entity name or tracking ID), Entity Type, LOB, Product, Delegation Type, and Open CAP toggle.
- The user can see a prominently displayed count of matching results that updates as filters are applied.
- The user can see which filters are currently active alongside the result count.
- The user can sort the table by any column.
- The user can export the filtered results to CSV or Excel.
- The user can click a Contracted Entity name to navigate to that entity's detail page.
- The user can click a Delegation Tracking ID to navigate to that delegation's detail page, with the ability to navigate prev/next within the report list.

---

### 9. Active Delegations Reports (by LOB / Product / Delegation Type)

**Description**
Three report pages — one each for LOB, Product, and Delegation Type — show all active delegation agreements for a given dimension value. These are accessed from the Delegation Reports cards on the dashboard.

**Acceptance Criteria**
- The report is pre-filtered to active (Approved) delegations matching the selected dimension value.
- The user can see the following columns: Delegation Tracking ID, Contracted Entity, LOB, Product, Delegation Type, Status, Effective Date, Term Date, Audited Entity, and CAP indicator. Columns already implied by the pre-selected dimension are hidden to avoid redundancy.
- The user can filter results further by: keyword search, LOB, Product, and Delegation Type.
- The user can see a prominently displayed count of matching results that updates as filters are applied.
- The user can see which filters are currently active alongside the result count.
- The user can sort the table by any column.
- The user can export the filtered results to CSV or Excel.
- The user can click a Contracted Entity name to navigate to that entity's detail page.
- The user can click a Delegation Tracking ID to navigate to that delegation's detail page, with the ability to navigate prev/next within the report list.

---

### 10. Export

**Description**
Users can export filtered report data for use in external tools or to share with stakeholders.

**Acceptance Criteria**
- The user can export any report to CSV format.
- The user can export any report to Excel (.xlsx) format.
- Exported files reflect the currently filtered/displayed data, not the full unfiltered dataset.
- Exported files are named descriptively based on the report type and applied filters.

---

## Out of Scope (Current Phase)

The following items were considered but are explicitly excluded from this phase:

- **Direct editing of delegation or entity records** — The application is a read-and-report tool in this phase. Record creation and editing will be handled by source systems.
- **Authentication and role management** — User roles are simulated for prototype purposes; integration with identity management is a future phase concern.
- **AI Assistant / Chatbot** — An AI chat interface is included in the prototype as an exploratory feature but is not part of the approved MVP scope.
- **Audit history / change log** — Tracking who changed what and when is deferred to a future phase.
- **Notifications and alerts** — Proactive alerting (e.g., upcoming audit due dates) is deferred.
