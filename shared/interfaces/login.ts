export interface LoginFormValues {
  email: string
  password: string
  error: string
  isSubmitting: boolean
  showPassword: boolean
}

export interface LoginResponse {
  profile: Record<string, unknown>
  authToken: string
}
