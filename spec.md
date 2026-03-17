# Patient Health Predictor

## Current State
AssessmentResults component displays risk scores, overall risk banner, recommendations, and assessment details. There is no way to export or download the report.

## Requested Changes (Diff)

### Add
- A "Download PDF" button in the AssessmentResults header row (next to the "New Assessment" button)
- A `usePdfExport` hook (or inline utility) that uses `window.print()` with a print-only CSS class to render a clean printable/PDF-ready layout
- Print-specific styles (via a `<style>` tag injected at print time or a global print media query in index.css) that hide the sidebar, mobile header, nav buttons, and footer — leaving only the report content

### Modify
- `AssessmentResults.tsx`: add Download PDF button with `data-ocid="results.download_pdf.button"` and print trigger logic

### Remove
- Nothing

## Implementation Plan
1. Add `@media print` CSS rules to `index.css` to hide sidebar, mobile header, nav, footer, and action buttons; show only the results content area cleanly
2. Add a `handlePrintPDF` function in `AssessmentResults.tsx` that calls `window.print()`
3. Add a Download PDF button (with FileDown icon) next to the New Assessment button in the header
4. Validate (lint + typecheck + build)
