# Validation
- Production build passed before final styling/timezone updates; final build runs during packaging.
- TypeScript check passed after correcting API response options and client JSON types; final rerun pending packaging.
- Browser: opt-in demo initialization produced 20 fictional artworks; dashboard computed 18 available and 10 in gallery.
- Browser: title search narrowed 20 records to one; artwork detail displayed matching identifier and metadata.
- Browser: transfer from External exhibition to Gallery Wall A saved and appeared in the permanent movement register.
- Browser: new incomplete artwork saved and inventory count increased to 21.
- Visual desktop inspection passed for ivory/charcoal/gold shell and movement table.
- Original file upload, CSV download contents, mobile interaction, staff authorization and restore tests NOT completed.
- tests/smoke.py is a proposed local API integration test, not a passed test: initial invocation lacked Python requests and local supervisor networking was unavailable to the shell.
