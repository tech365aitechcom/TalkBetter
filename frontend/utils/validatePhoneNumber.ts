export function validatePhoneNumber(phoneNumber: string): boolean {
  // Regular expression to validate phone number with country code (e.g., +1, +44, etc.)
  const phoneRegex = /^\+(\d{1,4})\d{7,14}$/

  return phoneRegex.test(phoneNumber)
}
