# Admin User Flow: Contact Creation to Form Assignment

## Overview

This document describes the complete workflow for admins to manage contacts, groups, and forms in Payforms.

---

## Step 1: Create a Contact

### Route
`/contacts/new`

### Flow
1. Navigate to **Contacts** in the sidebar
2. Click **New Contact** button
3. Fill in the contact details:
   - **Student Information**
     - Student ID (optional)
     - First Name, Middle Name, Last Name
     - Email (required)
     - Phone (optional)
     - Gender (optional)
   - **Guardian Information** (optional)
     - Guardian Name
     - Guardian Email
     - Guardian Phone
   - **Login Settings**
     - ☑ **Require portal login** (default: ON)
       - Contact will receive password setup email
     - ☐ **Force password reset on first login**
       - Contact must change password immediately

### API Integration
```
POST /contacts
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "require_login": true,
  "must_reset_password": false
}
```

### What Happens
- Backend creates contact in database
- If `require_login: true`, backend sends **password setup email** to contact
- Contact receives email with link to `/contact/set-password`

---

## Step 2: Add Contact to a Group

### Route
`/contacts/:id/groups`

### Flow
1. Navigate to **Contacts**
2. Click on a contact to view their profile
3. Click **Groups** tab
4. Select groups from the list
5. Click **Save Changes**

### Alternative: Bulk Move Contacts
1. Navigate to **Contacts**
2. Select multiple contacts using checkboxes
3. Click **Move to Group** in toolbar
4. Select target group
5. Click **Move**

### API Integration
```
POST /contacts/:id/groups
{
  "group_ids": ["group-uuid-1", "group-uuid-2"]
}
```

### Route
`/contacts/move?ids=id1,id2,id3`

---

## Step 3: Create a Form

### Route
`/forms/new` or `/forms/builder/refined`

### Flow
1. Navigate to **Forms** in the sidebar
2. Click **New Form** button
3. Fill in form details:
   - **Basic Info**
     - Form Title
     - Category (optional)
     - Description (optional)
   - **Payment Settings**
     - Payment Type: Fixed or Variable
     - Amount (if Fixed)
     - ☑ Allow partial payments
   - **Form Fields**
     - Add fields (Text, Email, Number, Select, etc.)
     - Mark fields as required
4. Save form

### API Integration
```
POST /forms
{
  "title": "Tuition Payment",
  "slug": "tuition-payment",
  "payment_type": "FIXED",
  "amount": 5000,
  "allow_partial": true
}

POST /forms/:id/fields
{
  "label": "Email",
  "type": "EMAIL",
  "required": true
}
```

---

## Step 4: Assign Form to Groups

### Route
`/forms/:id/groups`

### Flow
1. Navigate to **Forms**
2. Click on a form to view details
3. Click **Groups** tab
4. Select groups from the tree view
5. Click **Save Changes**

### What This Does
- Only contacts in the selected groups can access this form
- If no groups are selected, the form is available to **all contacts**

### API Integration
```
POST /forms/:id/groups
{
  "group_ids": ["group-uuid-1", "group-uuid-2"]
}

GET /forms/:id/groups
```

---

## Complete User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN ACTIONS                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Create Form    │    │  Create Group   │    │ Create Contact  │
│  /forms/new     │    │  /groups/new    │    │ /contacts/new   │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         ▼                      ▼                      │
┌─────────────────┐    ┌─────────────────┐              │
│  Assign Form    │    │ Add Contact    │              │
│  to Groups     │    │ to Group       │              │
│ /forms/:id/    │    │ /contacts/:id/ │◄─────────────┘
│   groups        │    │   groups        │
└─────────────────┘    └─────────────────┘
         │                      │
         │                      │
         ▼                      ▼
┌─────────────────────────────────────────┐
│              RESULTS                     │
├─────────────────────────────────────────┤
│                                         │
│  • Contact receives password email       │
│  • Contact is member of group(s)        │
│  • Form is accessible to group members   │
│                                         │
│  Contact Flow:                          │
│  1. Login at /contact/login             │
│  2. See forms assigned to their groups │
│  3. Submit form and make payment       │
│                                         │
└─────────────────────────────────────────┘
```

---

## Key Routes Summary

| Action | Route |
|--------|-------|
| View Contacts | `/contacts` |
| Create Contact | `/contacts/new` |
| Contact Groups | `/contacts/:id/groups` |
| Move Contacts | `/contacts/move` |
| View Groups | `/groups` |
| Create Group | `/groups/new` |
| View Forms | `/forms` |
| Create Form | `/forms/new` |
| Form Groups | `/forms/:id/groups` |

---

## Backend Notes

### Contact Creation
- `require_login: true` (default) → sends password setup email
- `must_reset_password: true` → forces password change on first login

### Form Access
- Forms can be assigned to multiple groups
- Contacts in assigned groups can see the form
- Contacts NOT in any assigned group cannot see the form
- If no groups assigned → form is public to all contacts

### Group Hierarchy
- Groups can have subgroups (nested)
- Subgroup contacts inherit parent group form access
