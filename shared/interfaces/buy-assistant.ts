interface Assistant {
  _id: string
  name: string
  description: string
  purchaseCount: number
  price: number
}

export interface BuyAssistantState {
  loading: boolean
  page: number
  totalPage: number
  search: string
  buyLoading: string | null
  selectedCall: Assistant | null
  assistants: Assistant[]
}

interface Assistant {
  _id: string
  name: string
}

export interface CallDialogProps {
  assistant: Assistant | null
  onClose: () => void
}

export interface AudioPulseProps {
  active: boolean
  volume: number
  hover?: boolean
}
