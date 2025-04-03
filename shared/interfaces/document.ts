export interface Document {
  _id: string
  fileName: string
  fileUrl: string
  fileSize: number
  metaData: number
  createdAt: string
}

export interface FileState {
  loading: boolean
  error: boolean
  selectedFile: File | null
  selectedFileInfo: Record<string, any> | null
  showConfirmation: boolean
}
