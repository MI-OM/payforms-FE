import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PayformsLandingPage } from '@/pages/LandingPages'
import { UnifiedLoginScreen } from '@/pages/UnifiedLoginScreen'
import { OrganizationSignUp } from '@/pages/OrganizationSignUp'
import { EmailVerifiedSuccess, EmailVerifiedSuccessView, EmailVerificationErrorView, EmailVerificationExpired, EmailVerificationAlreadyUsed, VerifyYourEmailPrompt } from '@/pages/EmailVerification'
import { AdminDashboardContent } from '@/pages/AdminDashboard'
import { AdminProfileManagement } from '@/pages/AdminProfileManagement'
import { AllActivityLogs } from '@/pages/AllActivityLogs'
import { ActivityDetailsActions } from '@/pages/ActivityDetailsActions'
import { AllFormsManagement } from '@/pages/AllFormsManagement'
import { FormBuilder } from '@/pages/FormBuilder'
import { FormBuilderRefinedFlow } from '@/pages/FormBuilder'
import { FormBuilderPublishStep } from '@/pages/FormBuilder'
import { FormBuilderAssignAudience } from '@/pages/FormBuilderAssignAudience'
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
import { ReportsAnalytics } from '@/pages/ReportsAnalytics'
import { OrganizationSettings } from '@/pages/OrganizationSettings'
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
  const status = useRequireAuth(['admin', 'staff'])
  
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  if (status === 'unauthenticated' || status === 'unauthorized') {
    return <Navigate to="/login" replace />
  }
  
  return children as React.ReactElement
}

function AdminLayout() {
  const status = useRequireAuth(['admin', 'staff'])
  
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
        <Route path="/move/success" element={<MoveContactSuccessFailureStates />} />
        
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
          
          {/* Contacts */}
          <Route path="/contacts" element={<ContactProfileManagement />} />
          <Route path="/contacts/new" element={<AddNewContactForm />} />
          <Route path="/contacts/:id" element={<ContactProfileManagement />} />
          <Route path="/contacts/:id/edit" element={<EditContactView />} />
          <Route path="/contacts/:id/statement" element={<FullStatementTemplateContact />} />
          <Route path="/contacts/:id/transactions" element={<FullTransactionHistoryContact />} />
          <Route path="/contacts/:id/move" element={<MoveContactToGroupView />} />
          <Route path="/contacts/:id/delete" element={<DeleteContactConfirmationModal />} />
          
          {/* Groups */}
          <Route path="/groups" element={<ContactsGroupsManagement />} />
          <Route path="/groups/:id" element={<GroupEditorView />} />
          <Route path="/groups/:id/subgroups" element={<SubgroupManagementView />} />
          
          {/* Transactions */}
          <Route path="/transactions" element={<AllTransactionsLedger />} />
          <Route path="/transactions/:id" element={<IndividualTransactionDetail />} />
          
          {/* Activity */}
          <Route path="/activity" element={<AllActivityLogs />} />
          <Route path="/activity/:id" element={<ActivityDetailsActions />} />
          
          {/* Reports */}
          <Route path="/reports" element={<ReportsAnalytics />} />
          
          {/* Import */}
          <Route path="/import" element={<ImportContacts />} />
          <Route path="/import/activities" element={<AllImportActivities />} />
          
          {/* Settings */}
          <Route path="/settings" element={<OrganizationSettings />} />
          <Route path="/profile" element={<AdminProfileManagement />} />
          
          {/* Team */}
          <Route path="/team/invite" element={<InviteStaff />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
