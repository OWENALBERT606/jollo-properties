# Implementation Plan: Land Management CRUD

## Overview

Implement complete CRUD for all 19 Prisma models in dependency order. Shared utilities are built first, then reference data, then core entities, then financial/workflow models, then property-based tests. All forms use Dialog/Sheet + React Hook Form + Zod. All lists use TanStack Table via `CrudTable` or custom table components.

## Tasks

- [x] 1. Shared utility libraries
  - [x] 1.1 Create `lib/auth-guard.ts` — `requireRole(session, ...roles)` returning `NextResponse | null`
    - Returns 401 NextResponse if session is null or role not in allowed list, else returns null
    - _Requirements: 1.6, 2.6, 3.5, 4.5, 5.5, 6.5, 7.6, 8.5, 9.6, 10.7, 11.6, 12.5, 13.4, 14.5, 15.7, 16.7, 17.5, 18.6, 19.5_

  - [x] 1.2 Create `lib/audit.ts` — `writeAudit(params)` writing an AuditLog record via Prisma
    - Accepts actorId, action, entityType, entityId, optional propertyId/transactionId/oldValue/newValue/ip
    - _Requirements: 9.5, 10.2, 10.4, 15.2, 15.5, 16.2, 17.2, 18.3, 19.3_

  - [x] 1.3 Create `lib/slug.ts` — `toSlug(name: string): string`
    - Lowercase, replace whitespace sequences with `-`, strip non-alphanumeric non-hyphen chars
    - _Requirements: 7.2, 7.3_

  - [ ]* 1.4 Write property test for slug derivation invariant
    - **Property 4: Slug derivation invariant**
    - **Validates: Requirements 7.2, 7.3**

  - [x] 1.5 Create `lib/receipt.ts` — `generateReceiptNumber(): Promise<string>`
    - Format `RCP-YYYYMMDD-XXXX`; XXXX = zero-padded count of TaxPayments created today + 1
    - _Requirements: 14.2_

  - [ ]* 1.6 Write property test for receipt number format invariant
    - **Property 11: Receipt number format invariant**
    - **Validates: Requirements 14.2**

  - [x] 1.7 Create `lib/status-transitions.ts` — transition maps and `isValidTransition(map, from, to)`
    - Export `PROPERTY_TRANSITIONS`, `TRANSACTION_TRANSITIONS`, `DISPUTE_TRANSITIONS`, `WORKFLOW_TRANSITIONS`
    - _Requirements: 10.5, 10.6, 15.3, 15.4, 16.3, 16.4, 18.3_

  - [ ]* 1.8 Write property test for status transition enforcement
    - **Property 8: Status transition enforcement**
    - **Validates: Requirements 10.5, 15.3, 16.3, 18.3**

  - [x] 1.9 Extend `lib/r2.ts` with `deleteR2Object(key: string): Promise<void>`
    - Use `DeleteObjectCommand` from `@aws-sdk/client-s3`
    - _Requirements: 12.3, 12.4_

- [x] 2. Reference data CRUD — Regions and Districts (models 1–2)
  - [x] 2.1 Enhance `app/api/admin/regions/[id]/route.ts` — change DELETE to soft-delete (`isActive = false`), add auth via `requireRole`
    - _Requirements: 1.3, 1.4, 1.6_

  - [x] 2.2 Enhance `app/dashboard/admin/settings/regions/RegionsClient.tsx` — wire `CrudTable` with name/description/isActive columns, status badge, Skeleton loading
    - _Requirements: 1.7, 1.8, 1.9, 1.10, 20.1–20.10_

  - [x] 2.3 Create `app/api/admin/districts/route.ts` and `[id]/route.ts` — GET with `?region=` filter, POST, PATCH, soft-delete DELETE, auth guard, 409 on duplicate name+region
    - _Requirements: 2.1–2.6_

  - [x] 2.4 Create `app/dashboard/admin/settings/districts/DistrictsClient.tsx` — CrudTable with region filter dropdown, region dropdown in create/edit Dialog populated from active regions, Skeleton
    - _Requirements: 2.7–2.10_

  - [ ]* 2.5 Write property test for auth guard on admin write routes
    - **Property 1: Auth guard on all admin write routes**
    - **Validates: Requirements 1.6, 2.6, 3.5, 4.5, 5.5, 6.5, 7.6, 8.5**

  - [ ]* 2.6 Write property test for ordered GET responses
    - **Property 2: Ordered GET responses**
    - **Validates: Requirements 1.1**

  - [ ]* 2.7 Write property test for duplicate name returns 409
    - **Property 3: Duplicate name returns 409**
    - **Validates: Requirements 1.5, 2.5, 3.2, 7.5, 8.2**

- [ ] 3. Reference data CRUD — Counties, Subcounties, Streets, MainRoads (models 3–6)
  - [ ] 3.1 Enhance `app/api/admin/counties/route.ts` and `[id]/route.ts` — add `?district=` filter, enforce `[name, district]` unique → 409, soft-delete, auth guard
    - _Requirements: 3.1–3.5_

  - [ ] 3.2 Create `app/dashboard/admin/settings/counties/CountiesClient.tsx` — CrudTable with district filter, district/region dropdowns in Dialog, Skeleton
    - _Requirements: 3.6–3.9_

  - [ ] 3.3 Enhance `app/api/admin/subcounties/route.ts` and `[id]/route.ts` — add `?county=` and `?district=` filters, enforce `[name, county, district]` unique → 409, soft-delete, auth guard
    - _Requirements: 4.1–4.5_

  - [ ] 3.4 Create `app/dashboard/admin/settings/subcounties/SubcountiesClient.tsx` — CrudTable with county/district filters, dropdowns in Dialog, Skeleton
    - _Requirements: 4.6–4.9_

  - [ ] 3.5 Enhance `app/api/admin/streets/route.ts` and `[id]/route.ts` — add `?district=` and `?subcounty=` filters, soft-delete, auth guard
    - _Requirements: 5.1–5.5_

  - [ ] 3.6 Create `app/dashboard/admin/settings/streets/StreetsClient.tsx` — CrudTable with district/subcounty filter dropdowns, subcounty/district/region dropdowns in Dialog, Skeleton
    - _Requirements: 5.6–5.8_

  - [ ] 3.7 Enhance `app/api/admin/roads/route.ts` and `[id]/route.ts` — add `?district=` and `?region=` filters, soft-delete, auth guard
    - _Requirements: 6.1–6.5_

  - [ ] 3.8 Create `app/dashboard/admin/settings/roads/RoadsClient.tsx` — CrudTable with district/region filter dropdowns, district/region dropdowns in Dialog, Skeleton
    - _Requirements: 6.6–6.8_

- [ ] 4. Reference data CRUD — PropertyCategories and TenureTypes (models 7–8)
  - [ ] 4.1 Enhance `app/api/admin/categories/route.ts` and `[id]/route.ts` — auto-generate slug via `toSlug`, regenerate on PATCH name change, enforce name+slug uniqueness → 409, soft-delete, auth guard
    - _Requirements: 7.1–7.6_

  - [ ] 4.2 Enhance `app/dashboard/admin/settings/categories/CategoriesClient.tsx` — add slug column, live slug preview in Dialog that updates as user types name, Skeleton
    - _Requirements: 7.7–7.9_

  - [ ] 4.3 Enhance `app/api/admin/tenures/route.ts` and `[id]/route.ts` — enforce name+code uniqueness → 409, soft-delete, auth guard
    - _Requirements: 8.1–8.5_

  - [ ] 4.4 Enhance `app/dashboard/admin/settings/tenures/TenuresClient.tsx` — add code column, code field in Dialog, Skeleton
    - _Requirements: 8.6–8.8_

- [ ] 5. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [ ] 6. User CRUD (model 9)
  - [ ] 6.1 Create `app/api/users/route.ts` — GET all users (exclude passwordHash, include ownership count), POST with bcrypt hash (cost 12), ADMIN-only auth guard
    - _Requirements: 9.1, 9.2, 9.6_

  - [ ] 6.2 Enhance `app/api/users/[id]/route.ts` — PATCH hashes new password if provided, writes AuditLog on role/ninVerified change, ADMIN-only auth guard; no DELETE endpoint
    - _Requirements: 9.3, 9.4, 9.5, 9.6_

  - [ ] 6.3 Create `components/dashboard/dialogs/UserDialog.tsx` — Dialog with name, email, phone, NIN, role select, optional password field; Zod schema; calls POST or PATCH
    - _Requirements: 9.9, 20.6, 20.7, 20.9_

  - [ ] 6.4 Create `app/dashboard/admin/users/UsersClient.tsx` — CrudTable with role filter dropdown, name/email/phone/NIN/ninVerified/role/createdAt columns, UserDialog, Skeleton
    - _Requirements: 9.7, 9.8, 9.10, 20.1–20.5_

  - [ ]* 6.5 Write property test for password never exposed
    - **Property 5: Password never exposed**
    - **Validates: Requirements 9.1**

  - [ ]* 6.6 Write property test for password storage round-trip
    - **Property 6: Password storage round-trip**
    - **Validates: Requirements 9.2**

- [ ] 7. Property CRUD (model 10)
  - [ ] 7.1 Enhance `app/api/properties/route.ts` — POST creates WorkflowStep (status=PENDING) and AuditLog entry; GET filters to `isPublicListing=true` for PUBLIC_USER; auth guard
    - _Requirements: 10.1, 10.2, 10.3, 10.7_

  - [ ] 7.2 Enhance `app/api/properties/[id]/route.ts` — PATCH writes AuditLog with oldValue/newValue; auth guard
    - _Requirements: 10.4, 10.7_

  - [ ] 7.3 Enhance `app/api/properties/[id]/status/route.ts` — validate transition via `isValidTransition(PROPERTY_TRANSITIONS, from, to)`, return 422 on invalid, write AuditLog on success
    - _Requirements: 10.5, 10.6_

  - [ ] 7.4 Update `components/dashboard/PropertyRegistrationDialog.tsx` — replace hardcoded district list with dropdown populated from active District records fetched from `/api/admin/districts`; replace hardcoded tenure list with TenureType records from `/api/admin/tenures`; replace hardcoded property type with PropertyCategory records from `/api/admin/categories`
    - _Requirements: 10.10, 10.11_

  - [ ] 7.5 Update `components/dashboard/AdminPropertiesTable.tsx` — replace direct status dropdown with status change going through `/api/properties/[id]/status` endpoint to enforce transitions; add type/tenure/district filter dropdowns
    - _Requirements: 10.8, 10.9_

  - [ ]* 7.6 Write property test for creation side effects invariant
    - **Property 7: Creation side effects invariant (Property)**
    - **Validates: Requirements 10.2**

  - [ ]* 7.7 Write property test for status transition enforcement (Property)
    - **Property 8: Status transition enforcement — Property**
    - **Validates: Requirements 10.5, 10.6**

- [ ] 8. PropertyOwner CRUD (model 11)
  - [ ] 8.1 Create `app/api/properties/[id]/owners/route.ts` — GET active owners with user name/email; POST validates total sharePercentage ≤ 100 → 422, enforces unique [propertyId, userId, isActive] → 409; auth guard
    - _Requirements: 11.1–11.6_

  - [ ] 8.2 Create `app/api/properties/[id]/owners/[ownerId]/route.ts` — DELETE soft-deletes (isActive=false, endDate=now()); auth guard
    - _Requirements: 11.4, 11.6_

  - [ ] 8.3 Create `components/dashboard/dialogs/OwnerDialog.tsx` — Dialog with user search input (calls `/api/users/search`), share percentage input, Zod validation
    - _Requirements: 11.8, 20.6, 20.7_

  - [ ] 8.4 Create `components/dashboard/PropertyOwnersTable.tsx` — nested table inside property detail showing owner name, email, share%, primary badge, start date; Add Owner button opens OwnerDialog; soft-delete action; Skeleton
    - _Requirements: 11.7, 11.9_

  - [ ]* 8.5 Write property test for share percentage invariant
    - **Property 9: Share percentage invariant**
    - **Validates: Requirements 11.2, 11.3**

- [ ] 9. Document CRUD (model 12)
  - [ ] 9.1 Enhance `app/api/documents/upload-url/route.ts` — ensure it stores uploadedById from session, returns r2Key and publicUrl; auth guard
    - _Requirements: 12.1, 12.2, 12.5_

  - [ ] 9.2 Enhance `app/api/documents/[id]/route.ts` — DELETE calls `deleteR2Object(doc.r2Key)`, logs R2 errors to console but always deletes DB record; auth guard
    - _Requirements: 12.3, 12.4, 12.5_

  - [ ] 9.3 Create `components/dashboard/dialogs/DocumentUploadDialog.tsx` — Dialog with file picker, document type selector (TITLE_DEED, SURVEY_MAP, AGREEMENT, PHOTO, OTHER), name field; shows upload progress; calls upload-url then creates document record
    - _Requirements: 12.7, 12.8, 20.6_

  - [ ] 9.4 Create `components/dashboard/PropertyDocumentsGrid.tsx` — card grid inside property detail showing file name, type badge, size in KB, upload date; Upload Document button opens DocumentUploadDialog; delete action; Skeleton
    - _Requirements: 12.6, 12.9_

- [ ] 10. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Valuation CRUD (model 13)
  - [ ] 11.1 Enhance `app/api/valuations/route.ts` — POST auto-calculates `taxAmount = valuedAmount × taxRate`, stores result; GET returns property title and officer name; auth guard
    - _Requirements: 13.1, 13.2, 13.4_

  - [ ] 11.2 Create `app/api/valuations/[id]/route.ts` — PATCH recalculates taxAmount when valuedAmount or taxRate changes; auth guard
    - _Requirements: 13.3, 13.4_

  - [ ] 11.3 Create `components/dashboard/dialogs/ValuationDialog.tsx` — Dialog with property search, valuedAmount, taxRate, notes; live read-only taxAmount preview that updates as user types; Zod validation
    - _Requirements: 13.6, 13.7, 20.6, 20.7_

  - [ ] 11.4 Create `app/dashboard/valuations/ValuationsClient.tsx` — CrudTable with property title, officer name, valued amount, tax rate, tax amount, valuation date columns; ValuationDialog; Skeleton
    - _Requirements: 13.5, 13.8_

  - [ ]* 11.5 Write property test for tax amount calculation invariant
    - **Property 10: Tax amount calculation invariant**
    - **Validates: Requirements 13.2, 13.3**

- [ ] 12. TaxPayment CRUD (model 14)
  - [ ] 12.1 Enhance `app/api/valuations/[id]/payments/route.ts` — POST calls `generateReceiptNumber()`, stores immutable amount+receiptNumber; GET returns payments ordered by paidAt desc; auth guard
    - _Requirements: 14.1, 14.2, 14.3, 14.5_

  - [ ] 12.2 Create `app/api/valuations/[id]/payments/[paymentId]/route.ts` — PATCH returns 422 if request body contains `amount` or `receiptNumber` fields; auth guard
    - _Requirements: 14.4, 14.5_

  - [ ] 12.3 Create `components/dashboard/dialogs/TaxPaymentDialog.tsx` — Dialog with amount, payment method select, notes; Zod validation; on success shows receipt number in a confirmation view
    - _Requirements: 14.7, 20.6, 20.7_

  - [ ] 12.4 Create `components/dashboard/ValuationPaymentsTable.tsx` — nested table inside valuation detail showing receipt number, amount, method, paid date; Record Payment button opens TaxPaymentDialog; Skeleton
    - _Requirements: 14.6, 14.8_

  - [ ]* 12.5 Write property test for TaxPayment immutability
    - **Property 12: TaxPayment immutability**
    - **Validates: Requirements 14.4**

- [ ] 13. Transaction CRUD (model 15)
  - [ ] 13.1 Enhance `app/api/transactions/route.ts` — POST sets status=INITIATED, creates WorkflowStep (status=PENDING), writes AuditLog; GET returns paginated records with property title, buyer/seller/initiator names; auth guard; no DELETE endpoint
    - _Requirements: 15.1, 15.2, 15.6, 15.7_

  - [ ] 13.2 Enhance `app/api/transactions/[id]/status/route.ts` — validate transition via `isValidTransition(TRANSACTION_TRANSITIONS, from, to)` → 422 on invalid; set completedDate=now() on COMPLETED; write AuditLog; auth guard
    - _Requirements: 15.3, 15.4, 15.5, 15.7_

  - [ ] 13.3 Create `components/dashboard/dialogs/TransactionDialog.tsx` — Dialog with property search, transaction type select, buyer/seller user search, amount, currency, agreement date, notes; Zod validation
    - _Requirements: 15.10, 20.6, 20.7_

  - [ ] 13.4 Create `app/dashboard/transactions/TransactionsClient.tsx` — CrudTable with property title, type badge, status badge, buyer/seller names, amount, agreement date columns; status/type filter dropdowns; TransactionDialog; Skeleton
    - _Requirements: 15.8, 15.9, 15.11_

  - [ ]* 13.5 Write property test for creation side effects invariant (Transaction)
    - **Property 7: Creation side effects invariant (Transaction)**
    - **Validates: Requirements 15.2**

  - [ ]* 13.6 Write property test for terminal state timestamps (Transaction)
    - **Property 16: Terminal state timestamps — completedDate**
    - **Validates: Requirements 15.5**

- [ ] 14. Dispute CRUD (model 16) and DisputeNote threading (model 17)
  - [ ] 14.1 Enhance `app/api/disputes/route.ts` — POST creates Dispute (status=FILED), sets linked Property status to DISPUTED, writes AuditLog; GET returns records with property title, complainant name, note count; auth guard
    - _Requirements: 16.1, 16.2, 16.7_

  - [ ] 14.2 Enhance `app/api/disputes/[id]/route.ts` — PATCH validates status transition via `isValidTransition(DISPUTE_TRANSITIONS, from, to)` → 422; on RESOLVED requires non-empty resolution field → 422, sets resolvedAt=now(); writes AuditLog; auth guard
    - _Requirements: 16.3, 16.4, 16.5, 16.6, 16.7_

  - [ ] 14.3 Enhance `app/api/disputes/[id]/notes/route.ts` — GET returns notes ordered by createdAt asc; POST rejects blank/whitespace-only note → 400, sets addedById from session; DELETE by noteId for ADMIN or note author; auth guard
    - _Requirements: 17.1–17.5_

  - [ ] 14.4 Create `components/dashboard/dialogs/DisputeDialog.tsx` — Dialog with property search, complainant user search, title, description; Zod validation
    - _Requirements: 16.10, 20.6, 20.7_

  - [ ] 14.5 Create `app/dashboard/disputes/DisputesClient.tsx` — CrudTable with property title, complainant name, title, status badge, filed date columns; status filter dropdown; DisputeDialog; Skeleton
    - _Requirements: 16.8, 16.9, 16.11_

  - [ ] 14.6 Create `components/dashboard/DisputeNotesThread.tsx` — threaded list inside dispute detail showing author name, note text, timestamp; inline textarea + submit appends note without page reload; delete action for own notes; Skeleton
    - _Requirements: 17.6, 17.7, 17.8_

  - [ ]* 14.7 Write property test for dispute side effect on property status
    - **Property 13: Dispute side effect on property**
    - **Validates: Requirements 16.2**

  - [ ]* 14.8 Write property test for resolution requires non-empty text
    - **Property 14: Resolution requires non-empty text**
    - **Validates: Requirements 16.5, 16.6**

  - [ ]* 14.9 Write property test for blank note rejected
    - **Property 15: Blank note rejected**
    - **Validates: Requirements 17.3**

  - [ ]* 14.10 Write property test for terminal state timestamps (Dispute)
    - **Property 16: Terminal state timestamps — resolvedAt**
    - **Validates: Requirements 16.5**

- [ ] 15. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [ ] 16. WorkflowStep CRUD (model 18)
  - [ ] 16.1 Create `app/api/workflow-steps/route.ts` — GET with `?propertyId=` and `?transactionId=` filters; POST sets status=PENDING, optionally assigns to user; auth guard
    - _Requirements: 18.1, 18.2, 18.6_

  - [ ] 16.2 Create `app/api/workflow-steps/[id]/route.ts` — PATCH validates transition via `isValidTransition(WORKFLOW_TRANSITIONS, from, to)` → 422; sets completedAt=now() on terminal status; writes AuditLog; DELETE returns 422 if status ≠ PENDING; auth guard
    - _Requirements: 18.3, 18.4, 18.5, 18.6_

  - [ ] 16.3 Create `components/dashboard/dialogs/WorkflowStepDialog.tsx` — Dialog with step name, assignee user search, notes; Zod validation
    - _Requirements: 18.8, 20.6, 20.7_

  - [ ] 16.4 Create `components/dashboard/WorkflowStepsTimeline.tsx` — timeline inside property/transaction detail showing step name, assignee, status badge, completedAt; Add Step button opens WorkflowStepDialog; Skeleton
    - _Requirements: 18.7, 18.9_

  - [ ]* 16.5 Write property test for terminal state timestamps (WorkflowStep)
    - **Property 16: Terminal state timestamps — completedAt**
    - **Validates: Requirements 18.4**

  - [ ]* 16.6 Write property test for AuditLog written on all audited mutations
    - **Property 17: AuditLog written on all audited mutations**
    - **Validates: Requirements 9.5, 19.3**

- [ ] 17. AuditLog read-only view (model 19)
  - [ ] 17.1 Create `app/api/audit-logs/route.ts` — GET only; paginated; filters by `?entityType=`, `?propertyId=`, `?transactionId=`, `?actorId=`; captures IP from request headers; ADMIN-only auth guard; no POST/PATCH/DELETE
    - _Requirements: 19.1, 19.2, 19.4, 19.5_

  - [ ] 17.2 Create `app/dashboard/admin/audit-logs/AuditLogsClient.tsx` — CrudTable with actor name, action badge, entity type, entity ID, property link, timestamp columns; entityType and action filter dropdowns; no create/edit/delete controls; Skeleton
    - _Requirements: 19.6, 19.7, 19.8, 19.9_

  - [ ]* 17.3 Write property test for AuditLog filter correctness
    - **Property 18: AuditLog filter correctness**
    - **Validates: Requirements 19.1**

- [ ] 18. Property-based tests for remaining correctness properties
  - [ ]* 18.1 Write property test for Zod validation rejects invalid inputs
    - **Property 19: Zod validation rejects invalid inputs**
    - **Validates: Requirements 20.6, 20.7**

- [ ] 19. Final checkpoint — Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using `fast-check` with `numRuns: 100`
- Unit tests validate specific examples and edge cases
- `lib/auth-guard.ts` must be implemented before any API route task
- `lib/status-transitions.ts` must be implemented before any status-change route task
