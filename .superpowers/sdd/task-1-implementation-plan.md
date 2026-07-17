# Task 1 implementation plan

## Scope

Create a UI-independent TypeScript domain module for the tutorial and five fixed
communication cases. It will expose types, curated data, validation, judging,
safe-relay checks, and meaning-ledger helpers.

## Test-first steps

1. Add Node tests that describe content validation, each change type, stable
   set-based judging, safe relay alternatives, and unsafe additions.
2. Run the focused TypeScript compilation and Node test command to record the
   expected RED result while the domain module is absent.
3. Add the smallest domain files needed to satisfy those tests and the section
   7 data invariants.
4. Re-run focused tests, then the existing full test command and lint.

## Data decisions

- `availableRoutes` explicitly lists each case's supported grade route.
- The tutorial is a separate `TransmissionCase`; the five fixed cases are in
  `TRANSMISSION_CASES`.
- Meaning identity, rather than literal wording or block order, determines
  meaning preservation and safe relay validity.
