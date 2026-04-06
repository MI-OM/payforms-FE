# Payforms

Payforms is a modern payment management SaaS application designed for organizations to collect payments from contacts, manage forms, and track financial transactions.

## Features

### Contact Management
- Create, edit, and manage contacts
- Organize contacts into groups and subgroups
- Bulk import contacts via CSV
- Export contact data
- Contact profile with transaction history

### Payment Forms
- Create customizable payment forms
- Support for fixed and partial payments
- Set payment amounts and categories
- Preview forms before publishing
- Activate/deactivate forms

### Groups & Organization
- Hierarchical group structure with tree view
- Move contacts between groups
- Assign forms to specific groups
- Subgroup management

### Transactions & Payments
- Complete transaction ledger
- View individual transaction details
- Payment verification with Paystack integration
- Export transaction data
- Payment audit trail

### Reports & Analytics
- Forms performance reports
- Group contributions tracking
- Export reports in various formats

### Team Management
- Invite staff members with role-based access
- Admin and Staff roles
- Staff invitation flow with password setup

### Notifications
- Scheduled email notifications
- Notification history tracking
- Payment audit notifications

### Settings
- Organization profile management
- Webhook configuration
- Widget setup for embedded forms

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: Custom components with Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **Payment Processing**: Paystack API integration

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd payforms-app

# Install dependencies
npm install
```

### Configuration

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_URL=<your-api-url>
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── layouts/      # Layout components (Sidebar, Dashboard)
│   └── ui/           # Base UI components (Button, Input, etc.)
├── contexts/          # React Context providers
├── lib/              # Utilities and API client
├── pages/            # Page components
├── services/         # API service modules
└── types/            # TypeScript type definitions
```

## API Integration

The application integrates with a backend API for:
- Authentication and authorization
- Contact management
- Form management
- Transaction processing
- Group operations
- Reporting and analytics
- Notification management

## Security

- JWT-based authentication
- Role-based access control (Admin, Staff, Contact)
- Password requirements enforcement
- Secure token management

## License

Private - All rights reserved
