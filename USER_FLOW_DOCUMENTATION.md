# The Ledger (Payforms) - Project Documentation

## Overview

"The Ledger" is a payment management SaaS application built with React + Vite. It integrates with a backend API at `https://payforms.onrender.com/api` to help organizations manage payments, contacts, and form submissions.

---

## What Was Done

### Phase 1: API Infrastructure
- Created `.env` with `VITE_API_URL=https://payforms.onrender.com/api`
- Created `apiClient.ts` - Axios-based API client with error handling
- Created `auth.ts` - JWT token management (access/refresh tokens)
- Created `contactAuth.ts` - Separate token storage for Contact/Student flow
- Created `toast.tsx` - Toast notification system

### Phase 2: Auth Flow
- `UnifiedLoginScreen.tsx` - Toggle between Admin/Staff (`POST /auth/login`) vs Contact/Student (`POST /contact-auth/login`)
- `AcceptInvite.tsx` - Connected to `POST /auth/accept-invite`
- `EmailVerification.tsx` - Resend email button connected
- `VerifyOrganizationEmail.tsx` - New route for org email verification
- `OrganizationSignUp.tsx` - Sign up flow connected

### Phase 3: Organization Settings
- `OrganizationSettings.tsx` - Connected to GET/PATCH /organization
- Logo upload - Connected to `POST /organization/logo`
- Paystack keys - Connected to `PATCH /organization/keys`
- Notifications settings - Connected to org endpoints
- Team tab links to invite staff page

### Phase 4: Profile & TopNav
- `DashboardLayout.tsx` - User dropdown menu with profile link
- Organization name displayed in sidebar
- `AdminProfileManagement.tsx` - Connected to GET/PATCH /auth/profile
- Sign out - Connected to POST /auth/logout
- Session timeout with warning modal

### Phase 5: Forms
- `formService.ts` - Fully implemented (21 methods)
- `AllFormsManagement.tsx` - Connected to GET/POST/DELETE /forms
- `FormBuilder.tsx` - Connected to POST /forms
- `FormSettings.tsx` - Connected to GET/PATCH /forms/:id
- `FormFieldsManagement.tsx` - Connected to field CRUD endpoints
- `PublicPaymentPage.tsx` - Connected to GET /public/forms/:slug
- Form submission and Paystack redirect implemented

### Phase 6: Contacts
- `contactService.ts` - Fully implemented
- `ContactsList.tsx` - Connected to GET /contacts
- `AddNewContactForm.tsx` - Connected to POST /contacts
- `ContactProfileManagement.tsx` - Connected
- `ImportContacts.tsx` - CSV template download
- `ContactExport.tsx` - Connected
- Bulk Import button added

### Phase 7: Transactions
- `paymentService.ts` - Fully implemented
- `AllTransactionsLedger.tsx` - Connected
- `TransactionDetail.tsx` - Connected to GET /transactions/:id
- `TransactionScreens.tsx` - Connected
- Export functionality connected

### Phase 8: Audit Logs
- `auditService.ts` - Fully implemented
- `AllActivityLogs.tsx` - Connected to auditService.getAuditLogs()
- Export functionality connected

### Phase 9: Dashboard Fixes (Recent)
- `AdminDashboard.tsx` - Now connected to:
  - `reportService.getSummary()` for KPI metrics
  - `paymentService.getTransactions()` for recent transactions
  - `reportService.getFormsPerformance()` for top forms ranking
  - `formService.getForms()` for form names
- Fixed TypeScript error with topForms.slice()

### Phase 10: Import & Contact Management (Recent)
- `AllImportActivities.tsx` - Connected to `contactService.getImports()`
- `AssignGroupsToContact` - Connected to:
  - `groupService.getGroups()` for group list
  - `contactService.getContactDetails()` for current groups
  - `contactService.assignGroups()` for saving
- `MoveContact.tsx` - Connected to:
  - `contactService.getContacts()` for contact list
  - `groupService.getGroups()` for group list
  - `contactService.assignGroups()` for moving contacts
- `ContactDashboard` - Connected to `contactService.getContactTransactions()`

---

## User Flows

### Admin/Staff Flow

1. **Login**
   - Navigate to `/login`
   - Select "Admin/Staff" tab
   - Enter email and password
   - Click "Sign In"
   - Redirected to `/dashboard`

2. **Dashboard**
   - View KPI metrics (Total Revenue, Transactions, Active Forms, Pending Collections)
   - View recent transactions table
   - View top performing forms ranking
   - Toggle between Live Dashboard and Empty State

3. **Create Form**
   - Navigate to `/forms/new`
   - Enter form details (title, slug, category, description)
   - Set payment type (Fixed/Variable) and amount
   - Configure allow partial payments
   - Publish form
   - Redirected to form fields management

4. **Manage Form Fields**
   - Navigate to form's fields page
   - Add fields (TEXT, EMAIL, SELECT, NUMBER, TEXTAREA)
   - Set field as required/optional
   - Add validation rules
   - Reorder fields via drag-and-drop

5. **Invite Staff**
   - Navigate to `/settings/team` or `/invite-staff`
   - Enter staff email
   - Select role (Admin/Staff)
   - Click "Send Invite"
   - Staff receives email with acceptance link

6. **Add Contacts**
   - Navigate to `/contacts`
   - Click "Add Contact"
   - Fill in contact details
   - Save contact
   - Or use "Bulk Import" for multiple contacts

7. **Import Contacts**
   - Navigate to `/import`
   - Download CSV template
   - Upload filled CSV
   - Review validation results
   - Commit import

8. **Manage Contact Groups**
   - Navigate to contact profile
   - Click "Manage Groups"
   - Select/deselect groups
   - Save changes

9. **Move Contacts to Group**
   - Navigate to `/contacts/move`
   - Select contacts
   - Select destination group
   - Click "Move"

10. **View Transactions**
    - Navigate to `/transactions`
    - View all transactions with filters
    - Click transaction for details
    - View transaction history
    - Export transactions

11. **Settings**
    - Navigate to `/settings`
    - Update organization name, logo
    - Configure Paystack keys
    - Set notification preferences
    - Manage team/invite staff

12. **Audit Logs**
    - Navigate to `/activity`
    - View all activity logs
    - Filter by date range
    - Export logs

### Contact/Student Flow (No Login Required)

1. **Access Payment Form**
   - Receive payment link: `/pay/:formId`
   - Open link in browser
   - View form details and amount

2. **Fill Information**
   - Enter required fields (name, email, etc.)
   - Submit form

3. **Make Payment**
   - Redirected to Paystack checkout
   - Enter card details
   - Complete payment

4. **Payment Result**
   - Success: View confirmation
   - Failure: View error with retry option

### Contact/Student Flow (With Login)

1. **Login**
   - Navigate to `/contact/login`
   - Enter email and password
   - Redirected to `/contact/dashboard`

2. **View Dashboard**
   - View total paid
   - View pending payments
   - View payment history

3. **Make Payment**
   - View available forms/payments
   - Click to pay
   - Complete via Paystack

---

## Services Implemented

| Service | Status | Methods |
|---------|--------|---------|
| `authService.ts` | ✅ Complete | login, logout, register, invite, accept-invite, refresh, reset-password, verify-email |
| `organizationService.ts` | ✅ Complete | getOrganization, updateOrganization, uploadLogo, updateKeys, getSettings, updateSettings |
| `formService.ts` | ✅ Complete | CRUD forms, CRUD fields, reorder, targets, groups |
| `contactService.ts` | ✅ Complete | CRUD contacts, import/export, transactions, groups |
| `groupService.ts` | ✅ Complete | CRUD groups, tree view, add/remove contacts |
| `paymentService.ts` | ✅ Complete | CRUD payments, transactions, verify, export |
| `reportService.ts` | ✅ Complete | summary, analytics, forms performance, export |
| `auditService.ts` | ✅ Complete | getAuditLogs, export |
| `notificationService.ts` | ✅ Complete | getNotifications, mark read, preferences |
| `contactAuthService.ts` | ✅ Complete | login, set-password, password-reset flows |

---

## What's Left

### Priority 1: Fix Remaining Mock Data ✅ COMPLETED
- [x] `ImportValidationReview.tsx` - Connected to validation/commit endpoints
- [x] `FormBuilderAssignAudience.tsx` - Connected to groupService and contactService
- [x] `GroupsManagement.tsx` / `GroupScreens.tsx` - Already connected
- [x] `ReportsAnalytics.tsx` - Already connected
- [ ] `ImportContacts.tsx` - Complete CSV mapping and actual import flow

### Priority 2: Missing UI Components ✅ COMPLETED
- [x] Student/Contact statement view page - Connected to contactService
- [x] Contact transaction history view - Connected to contactService  
- [x] Form templates gallery page - Added Use Template buttons
- [ ] Welcome/onboarding flow for new organizations

### Priority 3: Edge Cases & Error Handling
- [ ] Network error boundaries
- [ ] Session expired handling
- [ ] Payment callback handling
- [ ] Form submission with contact login flow

### Priority 4: Polish
- [ ] Loading states for all pages
- [ ] Empty states for all lists
- [ ] Form validation feedback
- [ ] Toast notifications for all actions
- [ ] Mobile responsive layouts

---

## API Endpoints Reference

### Auth
- `POST /auth/login` - Admin/Staff login
- `POST /auth/logout` - Logout
- `POST /auth/register` - Register
- `POST /auth/invite` - Invite user
- `POST /auth/accept-invite` - Accept invitation
- `POST /auth/refresh` - Refresh token
- `POST /auth/password-reset` - Request password reset
- `POST /auth/password-reset/confirm` - Confirm password reset
- `GET /auth/verify-email/:token` - Verify email
- `GET /auth/profile` - Get profile
- `PATCH /auth/profile` - Update profile

### Contact Auth
- `POST /contact-auth/login` - Contact/Student login
- `POST /contact-auth/set-password` - Set initial password
- `POST /contact-auth/password-reset` - Request reset
- `POST /contact-auth/password-reset/confirm` - Confirm reset

### Organization
- `GET /organization` - Get org details
- `PATCH /organization` - Update org
- `POST /organization/logo` - Upload logo
- `PATCH /organization/keys` - Update Paystack keys
- `GET /organization/settings` - Get settings
- `PATCH /organization/settings` - Update settings

### Forms
- `GET /forms` - List forms
- `POST /forms` - Create form
- `GET /forms/:id` - Get form
- `PATCH /forms/:id` - Update form
- `DELETE /forms/:id` - Delete form
- `GET /forms/:id/fields` - Get fields
- `POST /forms/:id/fields` - Create field
- `PATCH /forms/fields/:id` - Update field
- `DELETE /forms/fields/:id` - Delete field
- `PATCH /forms/:id/fields/reorder` - Reorder fields
- `GET /forms/:id/targets` - Get targets
- `POST /forms/:id/targets` - Add targets
- `DELETE /forms/:id/targets/:targetId` - Remove target

### Public Form
- `GET /public/forms/:slug` - Get public form
- `POST /public/forms/:slug/submit` - Submit form

### Contacts
- `GET /contacts` - List contacts
- `POST /contacts` - Create contact
- `GET /contacts/:id` - Get contact
- `PATCH /contacts/:id` - Update contact
- `DELETE /contacts/:id` - Delete contact
- `GET /contacts/:id/details` - Get contact with groups
- `GET /contacts/:id/transactions` - Get contact transactions
- `POST /contacts/:id/groups` - Assign groups
- `GET /contacts/imports` - List imports
- `POST /contacts/import` - Import contacts
- `POST /contacts/imports/validate` - Validate import
- `POST /contacts/imports/:id/commit` - Commit import
- `GET /contacts/export` - Export contacts

### Groups
- `GET /groups` - List groups
- `GET /groups/tree` - Get group tree
- `POST /groups` - Create group
- `PATCH /groups/:id` - Update group
- `DELETE /groups/:id` - Delete group
- `GET /groups/:id/contacts` - Get group contacts
- `POST /groups/:id/contacts` - Add contacts to group
- `DELETE /groups/:id/contacts/:contactId` - Remove contact

### Transactions
- `GET /transactions` - List transactions
- `GET /transactions/:id` - Get transaction
- `GET /transactions/:id/history` - Get transaction history
- `GET /transactions/export` - Export transactions

### Payments
- `GET /payments` - List payments
- `GET /payments/:id` - Get payment
- `POST /payments` - Create payment
- `PATCH /payments/:id/status` - Update payment status
- `GET /payments/verify/:reference` - Verify payment

### Reports
- `GET /reports/summary` - Get summary stats
- `GET /reports/analytics` - Get analytics
- `GET /reports/forms/performance` - Get form performance

### Audit
- `GET /audit-logs` - Get audit logs
- `GET /audit-logs/export` - Export logs

### Notifications
- `GET /notifications` - Get notifications
- `PATCH /notifications/:id/read` - Mark as read
- `GET /notifications/preferences` - Get preferences
- `PATCH /notifications/preferences` - Update preferences

---

## File Structure

```
payforms-app/src/
├── .env                    # API URL configuration
├── App.tsx                 # Main app with routing
├── main.tsx               # Entry point
├── index.css              # Global styles
├── lib/
│   ├── apiClient.ts       # Axios client setup
│   ├── auth.ts           # Auth token management
│   ├── contactAuth.ts     # Contact token storage
│   ├── utils.ts          # Utility functions
│   └── toast.tsx         # Toast notification component
├── services/
│   ├── authService.ts     # Auth API calls
│   ├── organizationService.ts
│   ├── formService.ts
│   ├── contactService.ts
│   ├── groupService.ts
│   ├── paymentService.ts
│   ├── reportService.ts
│   ├── auditService.ts
│   ├── notificationService.ts
│   └── contactAuthService.ts
├── contexts/
│   └── AuthContext.tsx    # Auth state management
├── components/
│   ├── ui/               # Reusable UI components
│   └── layouts/          # Layout components
│       ├── DashboardLayout.tsx
│       └── PublicLayout.tsx
└── pages/
    ├── UnifiedLoginScreen.tsx
    ├── OrganizationSignUp.tsx
    ├── EmailVerification.tsx
    ├── VerifyOrganizationEmail.tsx
    ├── AdminDashboard.tsx
    ├── AdminProfileManagement.tsx
    ├── OrganizationSettings.tsx
    ├── InviteStaff.tsx
    ├── AllFormsManagement.tsx
    ├── FormBuilder.tsx
    ├── FormSettings.tsx
    ├── FormFieldsManagement.tsx
    ├── ContactScreens.tsx
    ├── AddNewContactForm.tsx
    ├── ImportContacts.tsx
    ├── ContactProfileManagement.tsx
    ├── AllImportActivities.tsx
    ├── MoveContact.tsx
    ├── AllActivityLogs.tsx
    ├── AllTransactionsLedger.tsx
    ├── TransactionDetail.tsx
    ├── TransactionScreens.tsx
    ├── PaymentPages.tsx
    ├── ContactAuthPages.tsx
    └── AuthPages.tsx
```

---

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   cd payforms-app
   npm install
   ```
3. Copy `.env.example` to `.env` and update if needed:
   ```
   VITE_API_URL=https://payforms.onrender.com/api
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
5. Build for production:
   ```bash
   npm run build
   ```
