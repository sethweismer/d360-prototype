# SAIL/Appian Compatibility Analysis

Analysis of the D360 prototype against Appian's SAIL design system to identify patterns that may need adjustment for production implementation.

**Date:** 2026-06-03

---

## High Impact (Likely Requires Redesign)

### 1. Custom Grouped Table (Homepage — Grouped View)
- **Issue:** The grouped table uses custom header rows with expand/collapse and nested child rows. SAIL's `GridLayout` and `ReadOnlyGrid` don't support tree-grid or grouped-row patterns natively.
- **Recommendation:** Replace with a flat table + column-based grouping (LOB as a sortable/filterable column), or use SAIL's `TreeBrowserField` if hierarchical navigation is acceptable.
- **Decision:** _TBD_

### 2. Segmented Control (Grouped/Ungrouped toggle)
- **Issue:** Ant Design's `Segmented` component has no SAIL equivalent. SAIL doesn't have a native toggle/segmented control.
- **Recommendation:** Replace with SAIL's `RadioButtonField` (horizontal radio group) or `DropdownField` to switch views.
- **Decision:** _TBD_

### 3. Role Toggle in Header (Edit Mode switch)
- **Issue:** The prototype uses a header-level toggle to switch between Super User and Standard User. In Appian, roles are server-side — there's no client-side role switching UI.
- **Recommendation:** Remove the toggle from the prototype. Conditionally render edit actions based on the logged-in user's group membership (handled automatically by Appian's security model). For demo purposes, could use a query parameter or settings page.
- **Decision:** _TBD_

---

## Medium Impact (Needs Adjustment)

### 4. Popconfirm (Delete Confirmation)
- **Issue:** Ant Design's `Popconfirm` is a popover-style inline confirmation. SAIL doesn't have popovers — confirmations use modal dialogs (`showWhen` + `ConfirmationDialog`).
- **Recommendation:** Switch delete confirmations to a modal dialog pattern. Functionally equivalent, just different presentation.
- **Decision:** _TBD_

### 5. Filter "Select All" Pattern (Report Pages)
- **Issue:** The multi-select with a "Select All" sentinel value (`__all__`) is custom logic. SAIL's `MultipleDropdownField` supports multi-select but doesn't have a native "Select All" option.
- **Recommendation:** Can be implemented with a checkbox above the dropdown or a "Select All" choice added to the list. Appian supports this via expression logic, but the UX will feel slightly different. Flag for Appian developer input.
- **Decision:** _TBD_

### 6. Clipboard Copy on Contact Emails
- **Issue:** The copy-to-clipboard action uses browser's Clipboard API. SAIL has no access to browser APIs or custom JavaScript.
- **Recommendation:** Remove the copy icon. Display the email as a `LinkField` with `mailto:` — users can right-click to copy. Alternatively, accept this as a platform limitation.
- **Decision:** _TBD_

### 7. Color-Coded Status Tags
- **Issue:** The prototype uses colored tags (green for Active, red for Terminated, etc.). SAIL's `TagField` has a limited color palette: `ACCENT`, `POSITIVE`, `NEGATIVE`, `WARN`, and a few others.
- **Recommendation:** Map prototype colors to SAIL's fixed palette: Active→POSITIVE (green), Terminated→NEGATIVE (red), Pending→WARN (yellow). Should work, but can't use arbitrary hex colors.
- **Decision:** _TBD_

### 8. Contact Cards (Horizontal Layout)
- **Issue:** Custom-styled contact cards with specific flex layout. SAIL uses `CardLayout` but positioning is constrained to grid-based layouts.
- **Recommendation:** Use SAIL's `CardLayout` inside a `ColumnsLayout` — maps reasonably well. Just can't fine-tune padding/margins to pixel level.
- **Decision:** _TBD_

---

## Low Impact (Minor Adjustments)

### 9. Custom Header/Logo Styling
- **Issue:** Custom flex alignment for logo + title. SAIL headers use `HeaderContentLayout` with fixed structure.
- **Recommendation:** Use Appian's built-in application header. Custom logo placement is possible but follows Appian's branding patterns, not arbitrary CSS.
- **Decision:** _TBD_

### 10. Notes Inline Editing (TextArea + Save/Cancel)
- **Issue:** The inline add/edit pattern with TextArea works conceptually in SAIL using `showWhen` visibility toggling and `ParagraphField`.
- **Recommendation:** This translates well. Use `ParagraphField` with `readOnly` toggling and `ButtonWidget` for Save/Cancel.
- **Decision:** _TBD_

### 11. Table Sorting & Export
- **Issue:** Ant Design's table sort and CSV export. SAIL grids support sorting natively. Export requires a separate process (Appian has built-in export-to-CSV on grids).
- **Recommendation:** No design change needed — SAIL supports both patterns out of the box.
- **Decision:** _TBD_

### 12. Breadcrumb Navigation / Back Button
- **Issue:** Report pages use a back button. SAIL supports `LinkField` for navigation, and Appian has built-in breadcrumb support via Site navigation.
- **Recommendation:** Replace back buttons with Appian's site breadcrumb pattern. Minor UX difference.
- **Decision:** _TBD_

---

## Quick Reference

| # | Pattern | Difficulty | Recommendation |
|---|---------|-----------|----------------|
| 1 | Grouped table with header rows | Hard | Redesign to flat table |
| 2 | Segmented control (view toggle) | Hard | Use radio buttons |
| 3 | Role toggle in header | N/A in Appian | Remove (server-side roles) |
| 4 | Popconfirm | Medium | Switch to modal dialog |
| 5 | Select All filter | Medium | Custom expression logic |
| 6 | Clipboard copy | Not possible | Remove or accept limitation |
| 7 | Color tags | Easy | Map to SAIL palette |
| 8 | Contact cards | Easy | Use ColumnsLayout |
| 9 | Header/logo styling | Easy | Use built-in header |
| 10 | Inline notes editing | Easy | showWhen + ParagraphField |
| 11 | Table sort/export | Native | No change needed |
| 12 | Back button / breadcrumbs | Easy | Use site breadcrumbs |
