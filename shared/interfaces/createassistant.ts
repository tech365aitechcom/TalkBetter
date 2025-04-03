export interface Template {
  title: string
  description: string
}

export interface BlankTemplatePopupProps {
  onClose: () => void
  selectedTemplate: string
  handleCreateAssistant: (
    name: string,
    description: string,
    language: string,
    price: number
  ) => void
}
