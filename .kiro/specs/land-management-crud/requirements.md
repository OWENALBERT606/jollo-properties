# Requirements Document

## Introduction

This feature delivers complete CRUD operations for all 19 models in the Demo Properties land management system — a Uganda real estate and land registry platform built on Next.js 14 App Router, Prisma ORM, and PostgreSQL (Neon). The implementation covers reference/lookup models (Region, District, County, Subcounty, Street, MainRoad, PropertyCategory, TenureType), core entities (User, Property, PropertyOwner, Document), financial models (Valuation, TaxPayment), workflow models (Transaction, Dispute, DisputeNote, WorkflowStep), and the system-generated AuditLog. All list views use TanStack Table with search, filter, sort, and pagination. All create/edit forms use Dialog or Sheet popups. Access is role-gated: ADMIN has full access, LAND_OFFICER manages properties/transactions/valuations/disputes, PUBLIC_USER has read-only access to their own data.

## Glossary

- **System**: The Demo Properties Next.js 14 application
- **API_Route**: A Next.js App Router route handler under `app/api/`
- **Dashboard_Page**: A Next.js server component page under `app/dashboard/`
- **Client_Component**: A React client component rendered inside a Dashboard_Page
- **CrudTable**: The shared TanStack Table component at `components/dashboard/CrudTable.tsx` used for all list views
- **Dialog**: A shadcn/ui Dialog or Sheet popup used for all create/edit forms — no separate pages for forms
- **ADMIN**: A user with role `ADMIN` — full system access
- **LAND_OFFICER**: A user with role `LAND_OFFICER` — manages properties, transactions, valuations, disputes
- **PUBLIC_USER**: A user with role `PUBLIC_USER` — read-only access to own data
- **Soft_Delete**: Setting `isActive = false` rather than removing the database record
- **AuditLog**: An immutable system-generated record of every create/update/delete action on audited entities
- **R2**: Cloudflare R2 object storage used for document and photo file storage
- **Zod_Schema**: A Zod validation schema used with React Hook Form for client-side and server-side validation
- **Receipt_Number**: A human-readable unique identifier auto-generated for each TaxPayment in format `RCP-YYYYMMDD-XXXX`
- **Slug**: A URL-safe lowercase hyphenated string derived from a name field
- **Status_Transition**: A controlled change from one enum status value to another following a defined workflow
- **Skeleton**: A shadcn/ui Skeleton placeholder shown while data is loading — no spinner components are used
- **Brand_Blue**: Hex color `#1B3FA0` used as the primary brand color
- **Brand_Red**: Hex color `#DC2626` used as the secondary/danger brand color


## Requirements

### Requirement 1: Region CRUD

**User Story:** As an ADMIN, I want to create, read, update, and soft-delete regions, so that I can maintain the top-level geographic hierarchy for Uganda.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/admin/regions` returning all Region records ordered by name ascending.
2. WHEN an ADMIN submits a valid region name via `POST /api/admin/regions`, THE API_Route SHALL create a Region record and return it with HTTP 201.
3. WHEN an ADMIN submits a `PATCH /api/admin/regions/[id]` request, THE API_Route SHALL update the Region record's name, description, or isActive field and return the updated record.
4. WHEN an ADMIN submits a `DELETE /api/admin/regions/[id]` request, THE API_Route SHALL set `isActive = false` on the Region record (Soft_Delete) and return HTTP 200.
5. IF a region name already exists, THEN THE API_Route SHALL return HTTP 409 with a descriptive error message.
6. IF a session without ADMIN role attempts a write operation on `/api/admin/regions`, THEN THE API_Route SHALL return HTTP 401.
7. THE Dashboard_Page SHALL render a CrudTable listing all regions with columns: name, description, status badge, created date.
8. WHEN a user clicks "Add Region", THE Dashboard_Page SHALL open a Dialog containing a form with name (required) and description fields.
9. WHEN a user clicks the edit action on a region row, THE Dashboard_Page SHALL open a Dialog pre-populated with the Region's current name and description values.
10. THE Dashboard_Page SHALL display a Skeleton while region data is loading.

---

### Requirement 2: District CRUD

**User Story:** As an ADMIN, I want to manage districts linked to regions, so that I can maintain the second level of the geographic hierarchy.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/admin/districts` returning all District records; WHEN a `?region=` query parameter is provided, THE API_Route SHALL filter results to districts matching that region name.
2. WHEN an ADMIN submits a valid district name and region via `POST /api/admin/districts`, THE API_Route SHALL create a District record and return it with HTTP 201.
3. WHEN an ADMIN submits a `PATCH /api/admin/districts/[id]` request, THE API_Route SHALL update the District record and return the updated record.
4. WHEN an ADMIN submits a `DELETE /api/admin/districts/[id]` request, THE API_Route SHALL perform a Soft_Delete by setting `isActive = false`.
5. IF a district name already exists within the same region, THEN THE API_Route SHALL return HTTP 409 with a descriptive error message.
6. IF a session without ADMIN role attempts a write operation on `/api/admin/districts`, THEN THE API_Route SHALL return HTTP 401.
7. THE Dashboard_Page SHALL render a CrudTable with columns: name, region, status badge, created date.
8. THE Dashboard_Page SHALL provide a region filter dropdown above the CrudTable.
9. WHEN a user opens the create/edit Dialog for a district, THE Dashboard_Page SHALL populate the region field from a dropdown of active Region records.
10. THE Dashboard_Page SHALL display a Skeleton while district data is loading.

---

### Requirement 3: County CRUD

**User Story:** As an ADMIN, I want to manage counties linked to districts and regions, so that I can maintain the third level of the geographic hierarchy.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/admin/counties` returning all County records; WHEN a `?district=` query parameter is provided, THE API_Route SHALL filter results to counties matching that district.
2. WHEN an ADMIN creates a county via `POST /api/admin/counties`, THE API_Route SHALL enforce the unique constraint on `[name, district]` and return HTTP 409 if violated.
3. WHEN an ADMIN submits a `PATCH /api/admin/counties/[id]` request, THE API_Route SHALL update the County record and return the updated record.
4. WHEN an ADMIN submits a `DELETE /api/admin/counties/[id]` request, THE API_Route SHALL perform a Soft_Delete.
5. IF a session without ADMIN role attempts a write operation on `/api/admin/counties`, THEN THE API_Route SHALL return HTTP 401.
6. THE Dashboard_Page SHALL render a CrudTable with columns: name, district, region, status badge.
7. THE Dashboard_Page SHALL provide a district filter dropdown above the CrudTable.
8. WHEN a user opens the create/edit Dialog for a county, THE Dashboard_Page SHALL populate district and region dropdowns from active District and Region records.
9. THE Dashboard_Page SHALL display a Skeleton while county data is loading.

---

### Requirement 4: Subcounty CRUD

**User Story:** As an ADMIN, I want to manage subcounties linked to counties and districts, so that I can maintain the fourth level of the geographic hierarchy.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/admin/subcounties` returning all Subcounty records; WHEN `?county=` or `?district=` query parameters are provided, THE API_Route SHALL filter results accordingly.
2. WHEN an ADMIN creates a subcounty via `POST /api/admin/subcounties`, THE API_Route SHALL enforce the unique constraint on `[name, county, district]` and return HTTP 409 if violated.
3. WHEN an ADMIN submits a `PATCH /api/admin/subcounties/[id]` request, THE API_Route SHALL update the Subcounty record and return the updated record.
4. WHEN an ADMIN submits a `DELETE /api/admin/subcounties/[id]` request, THE API_Route SHALL perform a Soft_Delete.
5. IF a session without ADMIN role attempts a write operation on `/api/admin/subcounties`, THEN THE API_Route SHALL return HTTP 401.
6. THE Dashboard_Page SHALL render a CrudTable with columns: name, county, district, status badge.
7. THE Dashboard_Page SHALL provide county and district filter dropdowns above the CrudTable.
8. WHEN a user opens the create/edit Dialog for a subcounty, THE Dashboard_Page SHALL populate county and district dropdowns from active County and District records.
9. THE Dashboard_Page SHALL display a Skeleton while subcounty data is loading.

---

### Requirement 5: Street CRUD

**User Story:** As an ADMIN, I want to manage streets linked to subcounties, districts, and regions, so that I can maintain fine-grained address reference data.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/admin/streets` returning all Street records; WHEN `?district=` or `?subcounty=` query parameters are provided, THE API_Route SHALL filter results accordingly.
2. WHEN an ADMIN creates a street via `POST /api/admin/streets`, THE API_Route SHALL create a Street record with name, subcounty, district, and optional region.
3. WHEN an ADMIN submits a `PATCH /api/admin/streets/[id]` request, THE API_Route SHALL update the Street record and return the updated record.
4. WHEN an ADMIN submits a `DELETE /api/admin/streets/[id]` request, THE API_Route SHALL perform a Soft_Delete.
5. IF a session without ADMIN role attempts a write operation on `/api/admin/streets`, THEN THE API_Route SHALL return HTTP 401.
6. THE Dashboard_Page SHALL render a CrudTable with columns: name, subcounty, district, region, status badge.
7. WHEN a user opens the create/edit Dialog for a street, THE Dashboard_Page SHALL populate subcounty, district, and region dropdowns from active records.
8. THE Dashboard_Page SHALL display a Skeleton while street data is loading.

---

### Requirement 6: MainRoad CRUD

**User Story:** As an ADMIN, I want to manage main roads linked to districts and regions, so that I can associate properties with road access reference data.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/admin/roads` returning all MainRoad records; WHEN `?district=` or `?region=` query parameters are provided, THE API_Route SHALL filter results accordingly.
2. WHEN an ADMIN creates a main road via `POST /api/admin/roads`, THE API_Route SHALL create a MainRoad record with name, district, and optional region.
3. WHEN an ADMIN submits a `PATCH /api/admin/roads/[id]` request, THE API_Route SHALL update the MainRoad record and return the updated record.
4. WHEN an ADMIN submits a `DELETE /api/admin/roads/[id]` request, THE API_Route SHALL perform a Soft_Delete.
5. IF a session without ADMIN role attempts a write operation on `/api/admin/roads`, THEN THE API_Route SHALL return HTTP 401.
6. THE Dashboard_Page SHALL render a CrudTable with columns: name, district, region, status badge.
7. WHEN a user opens the create/edit Dialog for a main road, THE Dashboard_Page SHALL populate district and region dropdowns from active District and Region records.
8. THE Dashboard_Page SHALL display a Skeleton while road data is loading.

---

### Requirement 7: PropertyCategory CRUD

**User Story:** As an ADMIN, I want to manage property categories with auto-generated slugs, so that I can classify properties for filtering and public listings.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/admin/categories` returning all PropertyCategory records ordered by name.
2. WHEN an ADMIN creates a category via `POST /api/admin/categories`, THE API_Route SHALL auto-generate a Slug from the name by converting to lowercase and replacing spaces with hyphens, then enforce uniqueness on both name and slug.
3. WHEN an ADMIN updates a category name via `PATCH /api/admin/categories/[id]`, THE API_Route SHALL regenerate the Slug to match the updated name.
4. WHEN an ADMIN submits a `DELETE /api/admin/categories/[id]` request, THE API_Route SHALL perform a Soft_Delete.
5. IF a category name or slug already exists, THEN THE API_Route SHALL return HTTP 409 with a descriptive error message.
6. IF a session without ADMIN role attempts a write operation on `/api/admin/categories`, THEN THE API_Route SHALL return HTTP 401.
7. THE Dashboard_Page SHALL render a CrudTable with columns: name, slug, description, status badge.
8. WHEN a user opens the create/edit Dialog for a category, THE Dashboard_Page SHALL display the auto-generated Slug as a read-only preview field that updates as the user types the name.
9. THE Dashboard_Page SHALL display a Skeleton while category data is loading.

---

### Requirement 8: TenureType CRUD

**User Story:** As an ADMIN, I want to manage tenure types with unique codes, so that I can define the legal land tenure options available in Uganda.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/admin/tenures` returning all TenureType records ordered by name.
2. WHEN an ADMIN creates a tenure type via `POST /api/admin/tenures`, THE API_Route SHALL enforce uniqueness on both name and code, returning HTTP 409 if either is violated.
3. WHEN an ADMIN submits a `PATCH /api/admin/tenures/[id]` request, THE API_Route SHALL update the TenureType record and return the updated record.
4. WHEN an ADMIN submits a `DELETE /api/admin/tenures/[id]` request, THE API_Route SHALL perform a Soft_Delete.
5. IF a session without ADMIN role attempts a write operation on `/api/admin/tenures`, THEN THE API_Route SHALL return HTTP 401.
6. THE Dashboard_Page SHALL render a CrudTable with columns: name, code, description, status badge.
7. WHEN a user opens the create/edit Dialog for a tenure type, THE Dashboard_Page SHALL show name (required), code (required), and description fields.
8. THE Dashboard_Page SHALL display a Skeleton while tenure type data is loading.

---

### Requirement 9: User CRUD

**User Story:** As an ADMIN, I want to create, read, update, and deactivate user accounts, so that I can manage who has access to the system and at what role.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/users` returning all User records with ownership count, and THE API_Route SHALL exclude the `passwordHash` field from all response payloads.
2. WHEN an ADMIN creates a user with a password via `POST /api/users`, THE API_Route SHALL hash the password using bcrypt with a cost factor of 12 before storing it.
3. WHEN an ADMIN updates a user's password via `PATCH /api/users/[id]`, THE API_Route SHALL hash the new password before storing it.
4. WHEN an ADMIN deactivates a user via `PATCH /api/users/[id]`, THE API_Route SHALL set the user's role to `PUBLIC_USER` rather than deleting the record.
5. WHEN an ADMIN changes a user's role or `ninVerified` status, THE API_Route SHALL write an AuditLog entry capturing the old and new values.
6. IF a session without ADMIN role attempts to read or write user records via `/api/users`, THEN THE API_Route SHALL return HTTP 401.
7. THE Dashboard_Page SHALL render a CrudTable with columns: name, email, phone, NIN, NIN verified badge, role badge, created date.
8. THE Dashboard_Page SHALL provide a role filter dropdown above the CrudTable.
9. WHEN a user opens the create/edit Dialog for a user account, THE Dashboard_Page SHALL show fields for name, email, phone, NIN, role, and an optional password field.
10. THE Dashboard_Page SHALL display a Skeleton while user data is loading.

---

### Requirement 10: Property CRUD

**User Story:** As a LAND_OFFICER or ADMIN, I want to register and manage properties through a multi-step form, so that I can capture all required land registry information including location, ownership, and documents.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/properties` returning paginated Property records; WHILE the session role is `PUBLIC_USER`, THE API_Route SHALL filter results to only records where `isPublicListing = true`.
2. WHEN a LAND_OFFICER or ADMIN submits a new property via `POST /api/properties`, THE API_Route SHALL create the Property record with `status = PENDING_APPROVAL`, create an initial WorkflowStep with `status = PENDING`, and write an AuditLog entry.
3. THE API_Route SHALL enforce uniqueness on `plotNumber` and return HTTP 409 if violated.
4. WHEN a LAND_OFFICER or ADMIN submits a `PATCH /api/properties/[id]` request, THE API_Route SHALL update the Property record and write an AuditLog entry capturing `oldValue` and `newValue` as JSON.
5. WHEN a LAND_OFFICER or ADMIN submits a status change via `POST /api/properties/[id]/status`, THE API_Route SHALL validate the Status_Transition follows: `DRAFT → PENDING_APPROVAL → ACTIVE`, with `TRANSFERRED`, `DISPUTED`, and `ARCHIVED` reachable from `ACTIVE`.
6. IF an invalid Status_Transition is submitted, THEN THE API_Route SHALL return HTTP 422 with a descriptive error message.
7. IF a session without LAND_OFFICER or ADMIN role attempts a write operation on `/api/properties`, THEN THE API_Route SHALL return HTTP 401.
8. THE Dashboard_Page SHALL render a CrudTable with columns: plot number, title, district, tenure badge, type badge, status badge, price, featured toggle.
9. THE Dashboard_Page SHALL provide filter dropdowns for status, type, tenure, and district above the CrudTable.
10. WHEN a user clicks "Register Property", THE Dashboard_Page SHALL open a multi-step Dialog with steps: (1) Basic Info, (2) Location with map picker, (3) Ownership, (4) Photos and Documents, (5) Review.
11. WHEN a user advances between steps in the multi-step Dialog, THE Dashboard_Page SHALL validate the current step's fields using a Zod_Schema before proceeding.
12. THE Dashboard_Page SHALL accept up to 6 property photos; WHEN a user attempts to upload a 7th photo, THE Dashboard_Page SHALL display an error message.
13. THE Dashboard_Page SHALL display a Skeleton while property data is loading.

---

### Requirement 11: PropertyOwner CRUD

**User Story:** As a LAND_OFFICER or ADMIN, I want to assign and manage property owners with share percentages, so that I can accurately record co-ownership and ownership transfers.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/properties/[id]/owners` returning all active PropertyOwner records for a property, including user name and email.
2. WHEN a LAND_OFFICER or ADMIN assigns an owner via `POST /api/properties/[id]/owners`, THE API_Route SHALL validate that the total `sharePercentage` across all active owners for the property does not exceed 100.
3. IF the total share percentage would exceed 100, THEN THE API_Route SHALL return HTTP 422 with a descriptive error message.
4. WHEN a LAND_OFFICER or ADMIN removes an owner via `DELETE /api/properties/[id]/owners/[ownerId]`, THE API_Route SHALL perform a Soft_Delete by setting `isActive = false` and recording `endDate` as the current timestamp.
5. THE API_Route SHALL enforce the unique constraint on `[propertyId, userId, isActive]` and return HTTP 409 if violated.
6. IF a session without LAND_OFFICER or ADMIN role attempts a write operation on property owners, THEN THE API_Route SHALL return HTTP 401.
7. THE Dashboard_Page SHALL render ownership records as a nested table within the Property detail view, showing owner name, email, share percentage, primary badge, and start date.
8. WHEN a user clicks "Add Owner", THE Dashboard_Page SHALL open a Dialog with a user search field and share percentage input.
9. THE Dashboard_Page SHALL display a Skeleton while ownership data is loading.

---

### Requirement 12: Document Upload and Management

**User Story:** As a LAND_OFFICER or ADMIN, I want to upload property documents to Cloudflare R2 and manage them, so that I can attach title deeds, survey maps, and agreements to property records.

#### Acceptance Criteria

1. THE API_Route SHALL expose `POST /api/documents/upload-url` returning a presigned R2 upload URL, the r2Key, and the public r2Url for the file.
2. WHEN a document record is created, THE API_Route SHALL store the r2Key, r2Url, mimeType, sizeBytes, and link the record to the property and the session user as `uploadedById`.
3. WHEN a document is deleted via `DELETE /api/documents/[id]`, THE API_Route SHALL delete the file from R2 using the stored r2Key before removing the database record.
4. IF the R2 deletion fails, THEN THE API_Route SHALL still remove the database record and log the R2 error to the server console.
5. IF a session without LAND_OFFICER or ADMIN role attempts a write operation on documents, THEN THE API_Route SHALL return HTTP 401.
6. THE Dashboard_Page SHALL render documents as a card grid within the Property detail view, showing file name, type badge, size in KB, and upload date.
7. WHEN a user clicks "Upload Document", THE Dashboard_Page SHALL open a Dialog with a file picker, document type selector (TITLE_DEED, SURVEY_MAP, AGREEMENT, PHOTO, OTHER), and name field.
8. THE Dashboard_Page SHALL display upload progress during the R2 presigned URL upload.
9. THE Dashboard_Page SHALL display a Skeleton while document data is loading.

---

### Requirement 13: Valuation CRUD

**User Story:** As a LAND_OFFICER or ADMIN, I want to create and manage property valuations with auto-calculated tax amounts, so that I can record official land valuations and generate tax obligations.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/valuations` returning all Valuation records with property title and officer name.
2. WHEN a LAND_OFFICER or ADMIN creates a valuation via `POST /api/valuations`, THE API_Route SHALL auto-calculate `taxAmount = valuedAmount × taxRate` and store the result.
3. WHEN a LAND_OFFICER or ADMIN submits a `PATCH /api/valuations/[id]` request that changes `valuedAmount` or `taxRate`, THE API_Route SHALL recalculate and update `taxAmount`.
4. IF a session without LAND_OFFICER or ADMIN role attempts a write operation on valuations, THEN THE API_Route SHALL return HTTP 401.
5. THE Dashboard_Page SHALL render a CrudTable with columns: property title, officer name, valued amount, tax rate, tax amount, valuation date.
6. WHEN a user opens the create Dialog for a valuation, THE Dashboard_Page SHALL show a property search field, valued amount, tax rate, and notes fields.
7. THE Dashboard_Page SHALL display the auto-calculated tax amount as a read-only preview field that updates as the user types valued amount or tax rate.
8. THE Dashboard_Page SHALL display a Skeleton while valuation data is loading.

---

### Requirement 14: TaxPayment CRUD

**User Story:** As a LAND_OFFICER or ADMIN, I want to record tax payments against valuations with auto-generated receipt numbers, so that I can track payment history and issue receipts.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/valuations/[id]/payments` returning all TaxPayment records for a valuation ordered by `paidAt` descending.
2. WHEN a LAND_OFFICER or ADMIN creates a tax payment via `POST /api/valuations/[id]/payments`, THE API_Route SHALL auto-generate a Receipt_Number in the format `RCP-YYYYMMDD-XXXX` where XXXX is a zero-padded sequential count of payments on that day.
3. THE API_Route SHALL enforce uniqueness on `receiptNumber` and return HTTP 409 if violated.
4. THE API_Route SHALL treat `amount` and `receiptNumber` as immutable after creation; WHEN a `PATCH` request attempts to modify either field, THE API_Route SHALL return HTTP 422.
5. IF a session without LAND_OFFICER or ADMIN role attempts a write operation on tax payments, THEN THE API_Route SHALL return HTTP 401.
6. THE Dashboard_Page SHALL render payments as a nested table within the Valuation detail view, showing receipt number, amount, method, and paid date.
7. WHEN a user clicks "Record Payment", THE Dashboard_Page SHALL open a Dialog with amount, payment method, and notes fields.
8. THE Dashboard_Page SHALL display a Skeleton while payment data is loading.

---

### Requirement 15: Transaction CRUD and Status Workflow

**User Story:** As a LAND_OFFICER or ADMIN, I want to create and manage property transactions with a controlled status workflow, so that I can track sales, leases, and transfers through the approval process.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/transactions` returning paginated Transaction records with property title, buyer name, seller name, and initiator name.
2. WHEN a LAND_OFFICER or ADMIN creates a transaction via `POST /api/transactions`, THE API_Route SHALL set `status = INITIATED`, create an initial WorkflowStep with `status = PENDING`, and write an AuditLog entry.
3. WHEN a LAND_OFFICER or ADMIN submits a status change via `POST /api/transactions/[id]/status`, THE API_Route SHALL validate the Status_Transition follows: `INITIATED → UNDER_REVIEW → APPROVED → COMPLETED`, with `REJECTED` and `CANCELLED` reachable from any non-terminal state.
4. IF an invalid Status_Transition is submitted, THEN THE API_Route SHALL return HTTP 422 with a descriptive error message.
5. WHEN a transaction reaches `COMPLETED` status, THE API_Route SHALL set `completedDate` to the current timestamp and write an AuditLog entry.
6. THE API_Route SHALL never expose a `DELETE` endpoint for Transaction records.
7. IF a session without LAND_OFFICER or ADMIN role attempts a write operation on transactions, THEN THE API_Route SHALL return HTTP 401.
8. THE Dashboard_Page SHALL render a CrudTable with columns: property title, type badge, status badge, buyer name, seller name, amount, agreement date.
9. THE Dashboard_Page SHALL provide filter dropdowns for status and type above the CrudTable.
10. WHEN a user opens the create Dialog for a transaction, THE Dashboard_Page SHALL show property search, transaction type, buyer/seller user search, amount, currency, and agreement date fields.
11. THE Dashboard_Page SHALL display a Skeleton while transaction data is loading.

---

### Requirement 16: Dispute CRUD and Status Workflow

**User Story:** As a LAND_OFFICER or ADMIN, I want to file and manage property disputes with a controlled status workflow, so that I can track complaints through investigation and resolution.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/disputes` returning all Dispute records with property title, complainant name, and note count.
2. WHEN a user files a dispute via `POST /api/disputes`, THE API_Route SHALL create the Dispute record with `status = FILED` and update the linked Property's status to `DISPUTED`.
3. WHEN a LAND_OFFICER or ADMIN submits a status change, THE API_Route SHALL validate the Status_Transition follows: `FILED → UNDER_INVESTIGATION → HEARING → RESOLVED`, with `DISMISSED` reachable from any non-terminal state.
4. IF an invalid Status_Transition is submitted, THEN THE API_Route SHALL return HTTP 422 with a descriptive error message.
5. WHEN a dispute reaches `RESOLVED` status, THE API_Route SHALL require a non-empty `resolution` field and set `resolvedAt` to the current timestamp.
6. IF the `resolution` field is empty when resolving a dispute, THEN THE API_Route SHALL return HTTP 422 with a descriptive error message.
7. IF a session without LAND_OFFICER or ADMIN role attempts a write operation on disputes, THEN THE API_Route SHALL return HTTP 401.
8. THE Dashboard_Page SHALL render a CrudTable with columns: property title, complainant name, title, status badge, filed date.
9. THE Dashboard_Page SHALL provide a status filter dropdown above the CrudTable.
10. WHEN a user opens the create Dialog for a dispute, THE Dashboard_Page SHALL show property search, complainant user search, title, and description fields.
11. THE Dashboard_Page SHALL display a Skeleton while dispute data is loading.

---

### Requirement 17: DisputeNote Inline Threading

**User Story:** As a LAND_OFFICER or ADMIN, I want to add threaded notes to disputes, so that I can document investigation progress and communications inline on the dispute detail view.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/disputes/[id]/notes` returning all DisputeNote records for a dispute ordered by `createdAt` ascending.
2. WHEN an authenticated user submits a note via `POST /api/disputes/[id]/notes`, THE API_Route SHALL create a DisputeNote record linked to the dispute and the current session user as `addedById`.
3. IF the note text is empty or blank, THEN THE API_Route SHALL return HTTP 400 with a descriptive error message.
4. WHEN an ADMIN or the note author submits a `DELETE /api/disputes/[id]/notes/[noteId]` request, THE API_Route SHALL delete the DisputeNote record.
5. IF a non-authenticated session attempts to add or delete a note, THEN THE API_Route SHALL return HTTP 401.
6. THE Dashboard_Page SHALL render notes as a threaded list within the Dispute detail view, showing author name, note text, and timestamp.
7. WHEN a user submits a new note, THE Dashboard_Page SHALL append the note to the thread without a full page reload.
8. THE Dashboard_Page SHALL display a Skeleton while note data is loading.

---

### Requirement 18: WorkflowStep CRUD

**User Story:** As a LAND_OFFICER or ADMIN, I want to manage workflow steps attached to properties and transactions, so that I can track approval stages and assign them to officers.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/workflow-steps` returning WorkflowStep records; WHEN a `?propertyId=` or `?transactionId=` query parameter is provided, THE API_Route SHALL filter results accordingly.
2. WHEN a LAND_OFFICER or ADMIN creates a workflow step, THE API_Route SHALL set `status = PENDING` and optionally assign it to a user via `assigneeId`.
3. WHEN a LAND_OFFICER or ADMIN updates a workflow step status, THE API_Route SHALL validate the Status_Transition follows: `PENDING → APPROVED | REJECTED | SKIPPED`.
4. WHEN a workflow step reaches a terminal status (`APPROVED`, `REJECTED`, or `SKIPPED`), THE API_Route SHALL set `completedAt` to the current timestamp.
5. IF an ADMIN attempts to delete a WorkflowStep that is not in `PENDING` status, THEN THE API_Route SHALL return HTTP 422 with a descriptive error message.
6. IF a session without LAND_OFFICER or ADMIN role attempts a write operation on workflow steps, THEN THE API_Route SHALL return HTTP 401.
7. THE Dashboard_Page SHALL render workflow steps as a timeline within the Property or Transaction detail view, showing step name, assignee, status badge, and completed date.
8. WHEN a user opens the create Dialog for a workflow step, THE Dashboard_Page SHALL show step name, assignee user search, and notes fields.
9. THE Dashboard_Page SHALL display a Skeleton while workflow step data is loading.

---

### Requirement 19: AuditLog Read-Only View

**User Story:** As an ADMIN, I want to view a read-only audit log of all system actions, so that I can trace who changed what and when for compliance and debugging.

#### Acceptance Criteria

1. THE API_Route SHALL expose `GET /api/audit-logs` returning paginated AuditLog records with actor name; WHEN `?entityType=`, `?propertyId=`, `?transactionId=`, or `?actorId=` query parameters are provided, THE API_Route SHALL filter results accordingly.
2. THE API_Route SHALL never expose `POST`, `PATCH`, or `DELETE` endpoints for AuditLog records.
3. THE System SHALL write an AuditLog entry on every create, update, and delete operation for Property, Transaction, Dispute, User, and WorkflowStep entities, capturing `oldValue` and `newValue` as JSON.
4. THE System SHALL capture the requester's IP address in the `ip` field of each AuditLog entry.
5. IF a session without ADMIN role attempts to read audit logs via `/api/audit-logs`, THEN THE API_Route SHALL return HTTP 401.
6. THE Dashboard_Page SHALL render a CrudTable with columns: actor name, action badge, entity type, entity ID, property link, timestamp.
7. THE Dashboard_Page SHALL provide filter dropdowns for entity type and action above the CrudTable.
8. THE Dashboard_Page SHALL not render any create, edit, or delete controls for AuditLog records.
9. THE Dashboard_Page SHALL display a Skeleton while audit log data is loading.

---

### Requirement 20: Shared UI Standards

**User Story:** As a dashboard user, I want a consistent, responsive interface across all CRUD views, so that I can navigate and operate the system efficiently.

#### Acceptance Criteria

1. THE System SHALL use TanStack Table for all list views, providing column-level sorting, global text search, and pagination on every CrudTable instance.
2. THE System SHALL use shadcn/ui Dialog or Sheet components for all create and edit forms — no separate pages for forms.
3. THE System SHALL display Skeleton placeholders while any data fetch is in progress; THE System SHALL not use spinner components anywhere in the dashboard.
4. WHEN a create, update, or delete operation succeeds, THE System SHALL display a Sonner toast notification confirming the action.
5. WHEN a create, update, or delete operation fails, THE System SHALL display a Sonner toast notification with the error message returned by the API_Route.
6. THE System SHALL validate all form inputs using a Zod_Schema on the client before submission.
7. WHEN a form field fails Zod_Schema validation, THE System SHALL display an inline error message below the field.
8. WHERE the session role is `PUBLIC_USER`, THE System SHALL hide all create, edit, and delete controls and render the dashboard in read-only mode.
9. THE System SHALL use React Hook Form for all Dialog forms to manage field state, validation, and submission.
10. THE System SHALL apply Brand_Blue (`#1B3FA0`) as the primary action color and Brand_Red (`#DC2626`) as the destructive action color across all dashboard components.
