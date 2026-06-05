# Data Model Gap Analysis

Comparison of field-level requirements from working sessions (5/28 and 6/2) against the current `project-requirements.md` and prototype.

**Date:** 2026-06-05

---

## High Impact (Structural Changes)

### 1. Audited Entity / MSO May Need to Move to Delegation Level
- **Current model:** Audited Entity and MSO are delegate-level (parent) fields.
- **From notes (6/2):** "Cannot assume a single audited entity at the record level — it must be interpreted at the function level." Different functions (Claims, UM, Credentialing) may be handled by different MSOs under the same contracted entity. One IPA might sub-delegate UM to MSO-A and Claims to MSO-B.
- **Impact:** If Audited Entity and MSO vary by function, they belong at the delegation level, not the delegate level. This is a fundamental structural change to the data model.
- **Decision needed:** _TBD — confirm whether MVP needs to support multi-MSO scenarios or if a single MSO per delegate is acceptable for V1_

### 2. Tracking ID Exists at Multiple Levels
- **Current model:** Single "Tracking ID" / "Archer ID" at delegate level.
- **From notes (6/2):** Archer has entity-level tracking IDs AND function/LOB-level tracking IDs. Each combination of Function + Product + State creates a separate line item with its own tracking ID.
- **Impact:** Delegations may each need their own tracking ID field (the function-level ID from Archer). The entity-level ID stays at the delegate level as the primary key.
- **Decision needed:** _TBD — should we show delegation-level tracking IDs in the table, or is the entity-level ID sufficient for MVP?_

### 3. PHM vs CM Naming Inconsistency
- **Current model:** Requirements list "Clinical-CM (Care Management)" as MVP scope. Prototype uses "Clinical-PHM" in mock data and UI.
- **From notes (6/2):** "Some function labels (e.g., PHM vs CM) may not be consistently updated in the system; certain field values should not be overly relied on for precision."
- **Impact:** Need to decide the canonical label. Are PHM and CM the same thing with inconsistent naming, or are they distinct delegation types? The prototype currently says "Clinical-PHM" everywhere.
- **Decision needed:** _TBD — clarify with team whether to use CM, PHM, or both_

---

## Medium Impact (Field Definitions / Values)

### 4. Service Area vs State — Different Purposes
- **Current model:** Both listed as delegate-level fields without distinguishing their purpose.
- **From notes (5/28):** State = where delegation applies at contract level (already in Archer). Service Area = who is responsible (Aetna vs delegate) in specific geographies — critical for operational decision-making. Currently requires external lookup in QuickBase. Especially complex in California.
- **Impact:** Service Area is more operational/granular than State. May need clearer labeling in the UI to distinguish purpose. Service Area data may not be available for MVP if it requires QuickBase integration.
- **Decision needed:** _TBD — is Service Area in scope for MVP given it requires QuickBase as a source?_

### 5. Decision Communication — Richer Definition
- **Current model:** "Electronic 278 / Manual Log" as dropdown values.
- **From notes (5/28):** Describes "how delegate decisions are received (e.g., transactions, files)" and "how data enters internal systems (e.g., MedCompass)." Not stored in existing systems; requires custom field.
- **Impact:** The value set may need expansion beyond just two options. Also flagged as a custom/tool-native field (not sourced from Archer). This affects whether it's editable by Super Users.
- **Decision needed:** _TBD — confirm full value set and whether this is a tool-native editable field_

### 6. CAP Needs More Than a Boolean
- **Current model:** "Whether an active CAP exists (boolean for MVP)"
- **From notes (5/28):** Team discussed needing timeline/details tracking. Open question about where CAP data is stored. Use cases include leadership inquiries and compliance monitoring.
- **Impact:** Even for MVP, a boolean may be insufficient. At minimum, users may need: CAP status (open/closed), date opened, brief description. The "Delegates with Alerts" report currently just checks the boolean.
- **Decision needed:** _TBD — is boolean sufficient for MVP, or do we need at minimum a status + date?_

### 7. Contacts Vary by Function
- **Current model:** Contacts are delegate-level (one set of contacts per entity).
- **From notes (6/2):** "Contacts can vary by function and audit type." Operational contacts (e.g., for audits) may differ from admin contacts and may be stored elsewhere.
- **Impact:** For MVP, delegate-level contacts may be acceptable as a starting point, but the UI should not imply these are the only contacts. May need a note that operational/audit contacts could differ.
- **Decision needed:** _TBD — accept delegate-level contacts for MVP with a note, or model contacts at delegation level?_

### 8. Status Interpretation Across Levels
- **Current model:** Status at delegation level (Approved / Terminated / Under Review / etc.)
- **From notes (6/2):** "Entities can have active and termed records simultaneously at different levels." Also: "Termed" may indicate initiatives that never went live, not just ended relationships.
- **Impact:** Our current model already has status at delegation level (correct). But the prototype shows an "Audited Entity Status" at the delegate level — this may be confusing if different delegations have different statuses. Also, we may want to add a status value for "Never Active" or similar.
- **Decision needed:** _TBD — should "Audited Entity Status" remain, and should we add status values beyond the current set?_

### 9. Model Type Extensibility
- **Current model:** Standard / Standard w/ Exception / Custom
- **From notes (5/28):** "Future consideration for multiple 'standard' model variations by LOB. Likely a dropdown field with extensibility."
- **Impact:** Current values are fine for MVP. But the field should be implemented as an extensible dropdown, not hardcoded to three values.
- **Decision needed:** _None for now — note for Appian implementation_

### 10. Delegated Services as a Structured Grid
- **Current model:** Text field listing services (Medical, Behavioral Health, Transplant).
- **From notes (5/28):** Actually defined by a "contract-level service responsibility grid" that determines whether Aetna or delegate is responsible for specific services. More applicable to UM/PHM.
- **Impact:** In the future, this may need to be a structured checklist or matrix rather than free text. For MVP prototype, current approach is likely fine, but the Appian team should know this may evolve.
- **Decision needed:** _TBD — is free text acceptable for MVP, or should it be a multi-select?_

---

## Low Impact (Documentation / Labeling)

### 11. Custom vs System-Sourced Field Flagging
- **From notes (5/28):** "Need to clearly flag custom vs. sourced fields; will support future UI/UX clarity."
- **Current state:** Requirements describe the concept (read-only vs editable), but individual fields aren't explicitly tagged as custom vs sourced.
- **Impact:** Should annotate the data model to indicate which fields come from Archer/other systems vs. which are tool-native. Helps Appian team understand what's editable.
- **Decision needed:** _TBD — add a "Source" column to the field tables in requirements_

### 12. Encounter Submission — Custom Field
- **From notes (5/28):** "Not stored systematically; requires custom field."
- **Impact:** Like Decision Communication, this may be a tool-native editable field rather than sourced from Archer. Should be flagged accordingly.
- **Decision needed:** _TBD — confirm if this is sourced or tool-native_

### 13. Data Quality Expectations
- **From notes (6/2):** "Data is only as reliable as what is entered. Fields may not always match expected standards."
- **Current requirements:** Section 13 (Trust & Adoption) covers this conceptually.
- **Impact:** No structural change, but the Appian team should build in tolerance for inconsistent/incomplete data. The prototype already uses "—" for missing values, which is good.
- **Decision needed:** _None — already addressed conceptually_

---

## Summary: Changes to Prototype

| # | Change | Priority |
|---|--------|----------|
| 1 | Consider moving Audited Entity / MSO to delegation level | High — needs team decision |
| 2 | Add delegation-level tracking ID field | High — needs team decision |
| 3 | Resolve PHM vs CM naming | High — impacts all reports |
| 4 | Clarify Service Area purpose and MVP scope | Medium |
| 5 | Expand Decision Communication values | Medium |
| 6 | Enrich CAP beyond boolean | Medium |
| 7 | Document that contacts may vary by function | Low |
| 8 | Review status value set | Low |
| 9 | No change (note for implementation) | None |
| 10 | No change for now (note for implementation) | None |
| 11 | Add source annotations to field tables | Low |
| 12 | Flag Encounter Submission as potentially custom | Low |
| 13 | No change needed | None |

---

## Recommended Next Steps

1. **Confirm with team:** Items 1-3 are structural and need a decision before making prototype changes
2. **Quick wins:** Items 11-12 can be added to requirements doc now as annotations
3. **Prototype updates:** Once decisions are made on 1-3, update mock data and detail page accordingly
