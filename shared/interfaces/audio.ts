export interface VoiceFilterState {
  search: string
  gender: 'all' | 'male' | 'female' | 'neutral'
  accent: 'all' | 'american' | 'canadian' | 'british' | 'indian'
  voiceEngine: 'all' | 'playht' | '11labs'
}

interface AudioProps {
  id: string
  name: string
  gender: string
  accent: string
  sample: string
}

export interface AudioBoxProps {
  audio: AudioProps
}
