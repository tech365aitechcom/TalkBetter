export interface RegisterFormValues {
  name: string
  email: string
  role: 'buyer' | 'seller'
  status: boolean
  password: string
  projectId: string
  isSubmitting: boolean
}
