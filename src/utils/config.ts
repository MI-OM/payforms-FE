const getAppUrl = (): string => {
  return import.meta.env.VITE_APP_URL || window.location.origin
}

export const getCallbackUrl = (): string => {
  const appUrl = getAppUrl()
  return `${appUrl}/paystack/callback`
}

export const getPaymentSuccessUrl = (): string => {
  const appUrl = getAppUrl()
  return `${appUrl}/payment/success`
}

export const appConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://payforms.onrender.com',
  appUrl: getAppUrl(),
  callbackUrl: getCallbackUrl(),
  paymentSuccessUrl: getPaymentSuccessUrl(),
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
}

export default appConfig
