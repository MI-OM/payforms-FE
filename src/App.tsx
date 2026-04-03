import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PayformsLandingPage } from '@/pages/LandingPages'
import { UnifiedLoginScreen } from '@/pages/UnifiedLoginScreen'
import { OrganizationSignUp } from '@/pages/OrganizationSignUp'
import { EmailVerifiedSuccess, EmailVerifiedSuccessView, EmailVerificationErrorView, EmailVerificationExpired, EmailVerificationAlreadyUsed, VerifyYourEmailPrompt } from '@/pages/EmailVerification'
import { VerifyOrganizationEmail } from '@/pages/VerifyOrganizationEmail'
import { AdminDashboardContent } from '@/pages/AdminDashboard'
import { AdminProfileManagement } from '@/pages/AdminProfileManagement'
import { AllActivityLogs } from '@/pages/AllActivityLogs'
import { ActivityDetailsActions } from '@/pages/ActivityDetailsActions'
import { AllFormsManagement } from '@/pages/AllFormsManagement'
import { FormBuilder, FormBuilderRefinedFlow, FormBuilderPublishStep, FormBuilderAssignAudience } from '@/pages/FormBuilder'
import { FormSettings } from '@/pages/FormSettings'
import { useNavigate } from 'react-router-dom'
import { FormWidgetTemplatesShowcase } from '@/pages/ContactAndFormsPages'
import { AddNewContactForm } from '@/pages/AddNewContactForm'
import { EditContactView } from '@/pages/ContactAndFormsPages'
import { ContactProfileManagement } from '@/pages/ContactProfileManagement'
import { ContactsGroupsManagement } from '@/pages/GroupsManagement'
import { GroupEditorView } from '@/pages/GroupsManagement'
import { SubgroupManagementView } from '@/pages/GroupsManagement'
import { MoveContactToGroupView } from '@/pages/MoveContact'
import { MoveContactSuccessFailureStates } from '@/pages/MoveContact'
import { AllTransactionsLedger } from '@/pages/AllTransactionsLedger'
import { IndividualTransactionDetail } from '@/pages/TransactionDetail'
import { ConfirmPaymentCheckout } from '@/pages/PaymentPages'
import { PaymentSuccessState } from '@/pages/PaymentPages'
import { PaymentFailureState } from '@/pages/PaymentPages'
import { OfficialPaymentReceipt } from '@/pages/PaymentPages'
import { PublicPaymentPage } from '@/pages/PaymentPages'
import { PaymentReminderEmailTemplate } from '@/pages/PaymentPages'
import { ImportContacts } from '@/pages/ImportContacts'
import { AllImportActivities } from '@/pages/AllImportActivities'
import { InviteStaff } from '@/pages/InviteStaff'
import { InviteStaffSuccessState } from '@/pages/InviteStaff'
import { InviteStaffErrorState } from '@/pages/InviteStaff'
import { AcceptInvite, PasswordResetRequest, PasswordResetConfirm } from '@/pages/AuthPages'
import { ContactLoginPage, ContactSetPassword, ContactResetPasswordRequest, ContactResetPasswordConfirm, ContactDashboard } from '@/pages/ContactAuthPages'
import { ReportsAnalytics } from '@/pages/ReportsAnalytics'
import { OrganizationSettings } from '@/pages/OrganizationSettings'
import { FormFieldsManagement, FormDeleteConfirmation } from '@/pages/FormScreens'
import { GroupTreeView, GroupContactsManagement } from '@/pages/GroupScreens'
import { ContactExport, ContactDetailsView, AssignGroupsToContact, ImportValidationReview, ContactsList } from '@/pages/ContactScreens'
import { TransactionHistory, TransactionExport } from '@/pages/TransactionScreens'
import { WebhookManagement, WebhookLogs, WidgetConfiguration } from '@/pages/WebhookAndWidgetScreens'
import { ScheduledNotifications, NotificationHistory, AuditLogs, PaymentAuditTrail, ReportsExport } from '@/pages/NotificationAuditReportScreens'
import { FormCreationSuccessModal } from '@/pages/SuccessErrorModals'
import { FormCreationErrorModal } from '@/pages/SuccessErrorModals'
import { UserSignUpSuccessModal } from '@/pages/SuccessErrorModals'
import { UserSignUpErrorModal } from '@/pages/SuccessErrorModals'
import { DeleteContactConfirmationModal } from '@/pages/DeleteContactModals'
import { DeleteContactSuccessModal } from '@/pages/DeleteContactModals'
import { DeleteContactErrorModal } from '@/pages/DeleteContactModals'
import { DeleteContactConfirmationStates } from '@/pages/DeleteContactModals'
import { FullStatementTemplateContact } from '@/pages/ContactAndFormsPages'
import { FullTransactionHistoryContact } from '@/pages/ContactAndFormsPages'
import { ForgeProtocol } from '@/pages/LandingPages'
import { ArchitecturalLedgerAdminPaymentFlow } from '@/pages/LandingPages'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { AuthProvider, useAuth, useRequireAuth } from '@/contexts/AuthContext'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const status = useRequireAuth(['ADMIN', 'STAFF'])
  
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  if (status === 'unauthenticated' || status === 'unauthorized') {
    return <Navigate to="/login" replace />
  }
  
  return children as React.ReactElement
}

function AdminLayout() {
  const status = useRequireAuth(['ADMIN', 'STAFF'])
  
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  if (status === 'unauthenticated' || status === 'unauthorized') {
    return <Navigate to="/login" replace />
  }
  
  return <DashboardLayout />
}

function FormBuilderAssignAudienceWrapper() {
  const navigate = useNavigate()
  return <FormBuilderAssignAudience onBack={() => navigate('/forms/builder')} onNext={() => navigate('/forms/builder/publish')} />
}

function App() {
  return (
    <>
    <ErrorBoundary>
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PayformsLandingPage />} />
        <Route path="/login" element={<UnifiedLoginScreen />} />
        <Route path="/signup" element={<OrganizationSignUp />} />
        <Route path="/pay/:formId" element={<PublicPaymentPage />} />
        <Route path="/pay/:formId/checkout" element={<ConfirmPaymentCheckout />} />
        
        {/* Email Verification */}
        <Route path="/email/verified" element={<EmailVerifiedSuccess />} />
        <Route path="/email/verified/view" element={<EmailVerifiedSuccessView />} />
        <Route path="/email/verification/error" element={<EmailVerificationErrorView />} />
        <Route path="/email/verification/expired" element={<EmailVerificationExpired />} />
        <Route path="/email/verification/already-used" element={<EmailVerificationAlreadyUsed />} />
        <Route path="/email/verify-prompt" element={<VerifyYourEmailPrompt />} />
        <Route path="/verify-organization-email" element={<VerifyOrganizationEmail />} />
        
        {/* Modals (accessible from dashboard) */}
        <Route path="/modal/form-success" element={<FormCreationSuccessModal />} />
        <Route path="/modal/form-error" element={<FormCreationErrorModal />} />
        <Route path="/modal/signup-success" element={<UserSignUpSuccessModal />} />
        <Route path="/modal/signup-error" element={<UserSignUpErrorModal />} />
        <Route path="/modal/delete-contact" element={<DeleteContactConfirmationModal />} />
        <Route path="/modal/delete-contact/success" element={<DeleteContactSuccessModal />} />
        <Route path="/modal/delete-contact/error" element={<DeleteContactErrorModal />} />
        <Route path="/modal/delete-contact/states" element={<DeleteContactConfirmationStates />} />
        
        {/* Auth Success/Error */}
        <Route path="/invite/success" element={<InviteStaffSuccessState />} />
        <Route path="/invite/error" element={<InviteStaffErrorState />} />
        <Route path="/invite/accept/:token" element={<AcceptInvite />} />
        <Route path="/password-reset" element={<PasswordResetRequest />} />
        <Route path="/password-reset/confirm/:token" element={<PasswordResetConfirm />} />
        <Route path="/move/success" element={<MoveContactSuccessFailureStates />} />
        
        {/* Contact Auth Routes */}
        <Route path="/contact/login" element={<ContactLoginPage />} />
        <Route path="/contact/set-password" element={<ContactSetPassword />} />
        <Route path="/contact/reset-password" element={<ContactResetPasswordRequest />} />
        <Route path="/contact/reset-password/:token" element={<ContactResetPasswordConfirm />} />
        <Route path="/contact/dashboard" element={<ContactDashboard />} />
        
        {/* Payment Flows */}
        <Route path="/payment/success" element={<PaymentSuccessState />} />
        <Route path="/payment/failure" element={<PaymentFailureState />} />
        <Route path="/payment/receipt/:id" element={<OfficialPaymentReceipt />} />
        <Route path="/email-template/reminder" element={<PaymentReminderEmailTemplate />} />
        
        {/* Documentation */}
        <Route path="/protocol/forge" element={<ForgeProtocol />} />
        <Route path="/architecture/payment-flow" element={<ArchitecturalLedgerAdminPaymentFlow />} />
        
        {/* Admin Dashboard Layout with nested routes */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<AdminDashboardContent />} />
          
          {/* Forms */}
          <Route path="/forms" element={<AllFormsManagement />} />
          <Route path="/forms/templates" element={<FormWidgetTemplatesShowcase />} />
          <Route path="/forms/new" element={<FormBuilder />} />
          <Route path="/forms/builder" element={<FormBuilder />} />
          <Route path="/forms/builder/refined" element={<FormBuilderRefinedFlow />} />
          <Route path="/forms/builder/publish" element={<FormBuilderPublishStep />} />
          <Route path="/forms/builder/audience" element={<FormBuilderAssignAudienceWrapper />} />
          <Route path="/forms/:id/fields" element={<FormFieldsManagement />} />
          <Route path="/forms/:id/settings" element={<FormSettings />} />
          <Route path="/forms/:id/delete" element={<FormDeleteConfirmation />} />
          <Route path="/forms/:id/widget" element={<WidgetConfiguration />} />
          
          {/* Contacts */}
          <Route path="/contacts" element={<ContactsList />} />
          <Route path="/contacts/export" element={<ContactExport />} />
          <Route path="/contacts/new" element={<AddNewContactForm />} />
          <Route path="/contacts/:id" element={<ContactProfileManagement />} />
          <Route path="/contacts/:id/details" element={<ContactDetailsView />} />
          <Route path="/contacts/:id/edit" element={<EditContactView />} />
          <Route path="/contacts/:id/statement" element={<FullStatementTemplateContact />} />
          <Route path="/contacts/:id/transactions" element={<FullTransactionHistoryContact />} />
          <Route path="/contacts/:id/move" element={<MoveContactToGroupView />} />
          <Route path="/contacts/:id/groups" element={<AssignGroupsToContact />} />
          <Route path="/contacts/:id/delete" element={<DeleteContactConfirmationModal />} />
          
          {/* Groups */}
          <Route path="/groups" element={<GroupTreeView />} />
          <Route path="/groups/tree" element={<GroupTreeView />} />
          <Route path="/groups/new" element={<GroupEditorView />} />
          <Route path="/groups/:id" element={<GroupEditorView />} />
          <Route path="/groups/:id/subgroups" element={<SubgroupManagementView />} />
          <Route path="/groups/:id/contacts" element={<GroupContactsManagement />} />
          
          {/* Transactions */}
          <Route path="/transactions" element={<AllTransactionsLedger />} />
          <Route path="/transactions/export" element={<TransactionExport />} />
          <Route path="/transactions/:id" element={<IndividualTransactionDetail />} />
          <Route path="/transactions/:id/history" element={<TransactionHistory />} />
          
          {/* Activity */}
          <Route path="/activity" element={<AuditLogs />} />
          <Route path="/activity/:id" element={<ActivityDetailsActions />} />
          <Route path="/activity/payment/:paymentId" element={<PaymentAuditTrail />} />
          
          {/* Reports */}
          <Route path="/reports" element={<ReportsAnalytics />} />
          <Route path="/reports/export" element={<ReportsExport />} />
          
          {/* Import */}
          <Route path="/import" element={<ImportContacts />} />
          <Route path="/import/validate" element={<ImportValidationReview />} />
          <Route path="/import/activities" element={<AllImportActivities />} />
          
          {/* Settings */}
          <Route path="/settings" element={<OrganizationSettings />} />
          <Route path="/settings/webhooks" element={<WebhookManagement />} />
          <Route path="/settings/webhooks/:id/logs" element={<WebhookLogs />} />
          <Route path="/settings/notifications/scheduled" element={<ScheduledNotifications />} />
          <Route path="/settings/notifications/history" element={<NotificationHistory />} />
          <Route path="/profile" element={<AdminProfileManagement />} />
          
          {/* Team */}
          <Route path="/team/invite" element={<InviteStaff />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
    <Toaster />
    </>
  )
}

export default App
