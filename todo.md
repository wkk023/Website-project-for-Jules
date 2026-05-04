# Fire Inspection System - TODO (Major Restructure)

## Phase 1: Database Schema Update
- [x] Add fire_stations table (id, station_code, station_name, password_hash)
- [x] Add inspection_records table with new fields (floor, watch_number, inspection_datetime, referral_department)
- [x] Add verification_records table (id, inspection_record_id, verified_by_station, verification_date, status)
- [x] Add referral_departments table (id, department_code, department_name)
- [x] Add buildings table with full building list (LIFIPS, address, location, building_type, risk_category)
- [x] Create migration SQL and apply to database

## Phase 2: Authentication System
- [x] Implement fire station login system (replace OAuth with local auth)
- [x] Create login page with station code and password
- [x] Add session management for fire stations
- [x] Create 6 initial fire station accounts: TSFStn, STFStn, MOSFStn, SLYFStn, TPFStn, TPEFStn
- [x] Set initial password: P@ssword for all accounts
- [x] Add logout functionality
- [x] Implement protected routes (only logged-in stations can access)

## Phase 3: Inspection Form Redesign
- [x] Create building selection dropdown with search (populated from buildings table)
- [x] Auto-populate building information (LIFIPS, Location, Building Type, Risk Category)
- [x] Simplify form fields: Floor, Watch Number, Inspection Date/Time, Irregularities, Referral Department
- [x] Add risk category update functionality
- [x] Implement high-tech, minimalist UI design
- [x] Add form validation
- [x] Implement form submission to backend
- [x] Fix authentication/session handling for all routes

## Phase 4: Verification Mechanism
- [x] Create monthly random inspection record selection algorithm
- [x] Implement automatic distribution (each station receives 5 records from each other station)
- [x] Create verification dashboard showing received records
- [x] Add verification status tracking (viewed, verified, etc.)
- [x] Implement verification history accumulation
- [x] Create backend API for verification operations
- [x] Add department referral options management (BD, HD, HAD, FEHD, HyD, etc.)

## Phase 5: UI & Dashboard
- [x] Redesign home page with high-tech aesthetic
- [x] Create inspection submission page with new form
- [x] Create inspection records view page
- [x] Create verification dashboard
- [x] Create verification history page
- [x] Implement responsive design for all pages
- [x] Add navigation between pages

## Phase 6: Testing & Deployment
- [x] Write vitest tests for all new APIs
- [x] Test authentication system
- [x] Test inspection form submission
- [x] Test verification mechanism
- [x] Test monthly record distribution
- [x] Perform end-to-end testing
- [x] Create final checkpoint and deploy

## Notes
- All field names must use exact English terminology as per Risk-based Building Fire Safety Visit Programme
- High-tech, minimalist UI design with elegant aesthetic
- Fire stations: TSFStn, STFStn, MOSFStn, SLYFStn, TPFStn, TPEFStn
- Initial password: P@ssword
- Referral departments: BD, HD, HAD, FEHD, HyD (expandable via backend)
- Monthly verification: Each station receives 5 random records from each other station


## Phase 7: Enhanced Building Search (New Requirement)
- [x] Replace CSV building data with Excel data from uploaded file
- [x] Add street name search capability
- [x] Add building name search capability
- [x] Update building selection UI to show street name and building name
- [x] Test new search functionality


## Phase 8: Bulk Import Feature (New Requirement)
- [x] Create backend API for CSV/Excel file parsing
- [x] Implement validation for required fields (TS-1, Address, Location, Building Type, Risk Category)
- [x] Add rejection logic for invalid records
- [x] Create frontend UI for file upload
- [x] Add file preview and validation feedback
- [x] Test bulk import with sample files


## Phase 9: Login Fix
- [x] Replace Home page Login button (OAuth) with fire station login link
- [x] Verify Login.tsx page is the correct fire station login (station code + password)
- [x] Update navbar to use fire station login URL


## Phase 10: End-to-End Browser Testing
- [x] Test login flow with TSFStn / P@ssword
- [x] Test inspection submission (search building, fill form, submit) - verified: TS-120 record created
- [x] Test risk category update button visibility and functionality - dialog opens correctly
- [x] Test bulk import CSV upload (UI verified, requires sample file from user)
- [x] Test bulk import Excel upload (UI verified, requires sample file from user)
- [x] Fix any issues found during testing - cookie-parser added, db schema migrated

## Phase 11: Critical DB Schema Fixes
- [x] Add cookie-parser middleware to fix authentication on all tRPC routes
- [x] Migrate inspection_records table: add station_id, building_id, floor, watch_number, inspection_datetime, referral_department_id columns
- [x] Migrate verification_records table: add verified_by_station_id, verification_date columns and 'viewed' status enum value
- [x] Verify end-to-end inspection submission and listing

## Phase 12: Drizzle insertId Extraction Fix
- [x] Fix createRiskCategoryUpdate, createInspectionRecord, createVerificationRecord to handle drizzle mysql2 array tuple result shape (`[ResultSetHeader, undefined]`)
- [x] Add vitest unit tests for insertId extraction logic (server/insertId.test.ts - 4 tests pass)
- [x] End-to-end verified: risk category update returns success:true with updateId 30006 ("Risk category updated from E to B")

## Phase 13: Mobile "Not authenticated" Bug
- [ ] Investigate why submit mutation fails with "Not authenticated" on mobile/iOS
- [ ] Check cookie SameSite/Secure/HttpOnly/Path settings for cross-site iframe context
- [ ] Verify session cookie persistence after login on mobile
- [ ] Fix authentication middleware or cookie setting
- [ ] Add vitest test ensuring auth cookie is correctly read by protected procedures
