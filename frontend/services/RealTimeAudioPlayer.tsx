type SetIsAISpeaking = (isSpeaking: boolean) => void

export class RealTimeAudioPlayer {
  private audioContext: AudioContext
  private audioQueue: AudioBuffer[] = []
  private isPlaying: boolean = false
  private setIsAISpeaking: SetIsAISpeaking

  constructor(setIsAISpeaking: SetIsAISpeaking) {
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)()
    this.setIsAISpeaking = setIsAISpeaking
  }

  // Decode Base64 to ArrayBuffer
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  // Add audio chunk to the queue and play if not already playing
  async addAudioChunk(base64Chunk: string): Promise<void> {
    const audioData = this.base64ToArrayBuffer(base64Chunk)

    const audioBuffer = await this.audioContext.decodeAudioData(audioData)
    this.audioQueue.push(audioBuffer)

    if (!this.isPlaying) {
      this.playNextChunk()
    }
  }

  async clearQueChunks(): Promise<void> {
    this.audioQueue = []
  }

  // Play the next audio chunk in the queue
  private playNextChunk(): void {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false
      this.setIsAISpeaking(false)
      return
    }

    this.isPlaying = true
    this.setIsAISpeaking(true)

    const buffer = this.audioQueue.shift()
    if (!buffer) return

    const source = this.audioContext.createBufferSource()
    source.buffer = buffer

    source.onended = () => {
      this.playNextChunk()
    }

    source.connect(this.audioContext.destination)
    source.start(0)
  }
}
