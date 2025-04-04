import { createWorketFromSrc, registeredWorklets } from './audioWorkletRegister'

type WorkletHandler = (ev: MessageEvent<any>) => void

interface WorkletRecord {
  node?: AudioWorkletNode
  handlers: WorkletHandler[]
}

export class AudioStreamer {
  private context: AudioContext
  private gainNode: GainNode
  private source: AudioBufferSourceNode
  private setIsAISpeaking: (speaking: boolean) => void

  private audioQueue: Float32Array[] = []
  private isPlaying = false
  private sampleRate = 8000
  private bufferSize = 7680
  private processingBuffer = new Float32Array(0)
  private scheduledTime = 0
  private isStreamComplete = false
  private checkInterval: number | null = null
  private initialBufferTime = 0.1 // 100ms initial buffer
  private endOfQueueAudioSource: AudioBufferSourceNode | null = null

  public onComplete: () => void = () => {}

  constructor(
    context: AudioContext,
    setIsAISpeaking: (speaking: boolean) => void
  ) {
    this.context = context
    this.gainNode = this.context.createGain()
    this.source = this.context.createBufferSource()
    this.gainNode.connect(this.context.destination)
    this.addPCM16 = this.addPCM16.bind(this)
    this.setIsAISpeaking = setIsAISpeaking
  }

  async addWorklet(
    workletName: string,
    workletSrc: string,
    handler: WorkletHandler
  ): Promise<this> {
    let workletsRecord = registeredWorklets.get(this.context)
    if (workletsRecord && workletsRecord[workletName]) {
      workletsRecord[workletName].handlers.push(handler)
      return this
    }

    if (!workletsRecord) {
      registeredWorklets.set(this.context, {})
      workletsRecord = registeredWorklets.get(this.context)!
    }

    workletsRecord[workletName] = { handlers: [handler] }

    const src = createWorketFromSrc(workletName, workletSrc)
    await this.context.audioWorklet.addModule(src)
    const worklet = new AudioWorkletNode(this.context, workletName)

    workletsRecord[workletName].node = worklet

    return this
  }

  addPCM16(chunk: Uint8Array): void {
    const float32Array = new Float32Array(chunk.length / 2)
    const dataView = new DataView(chunk.buffer)

    for (let i = 0; i < chunk.length / 2; i++) {
      try {
        const int16 = dataView.getInt16(i * 2, true)
        float32Array[i] = int16 / 32768
      } catch (e) {
        console.error(e)
      }
    }

    const newBuffer = new Float32Array(
      this.processingBuffer.length + float32Array.length
    )
    newBuffer.set(this.processingBuffer)
    newBuffer.set(float32Array, this.processingBuffer.length)
    this.processingBuffer = newBuffer

    while (this.processingBuffer.length >= this.bufferSize) {
      const buffer = this.processingBuffer.slice(0, this.bufferSize)
      this.audioQueue.push(buffer)
      this.processingBuffer = this.processingBuffer.slice(this.bufferSize)
    }

    if (!this.isPlaying) {
      this.isPlaying = true
      this.setIsAISpeaking(true)
      this.scheduledTime = this.context.currentTime + this.initialBufferTime
      this.scheduleNextBuffer()
    }
  }

  private createAudioBuffer(audioData: Float32Array): AudioBuffer {
    const audioBuffer = this.context.createBuffer(
      1,
      audioData.length,
      this.sampleRate
    )
    audioBuffer.getChannelData(0).set(audioData)
    return audioBuffer
  }

  private scheduleNextBuffer(): void {
    const SCHEDULE_AHEAD_TIME = 0.2

    while (
      this.audioQueue.length > 0 &&
      this.scheduledTime < this.context.currentTime + SCHEDULE_AHEAD_TIME
    ) {
      const audioData = this.audioQueue.shift()!
      const audioBuffer = this.createAudioBuffer(audioData)
      const source = this.context.createBufferSource()

      if (this.audioQueue.length === 0) {
        if (this.endOfQueueAudioSource) {
          this.endOfQueueAudioSource.onended = null
        }
        this.endOfQueueAudioSource = source
        source.onended = () => {
          if (
            this.audioQueue.length === 0 &&
            this.endOfQueueAudioSource === source
          ) {
            this.endOfQueueAudioSource = null
            this.onComplete()
          }
        }
      }

      source.buffer = audioBuffer
      source.connect(this.gainNode)

      const worklets = registeredWorklets.get(this.context) as
        | Record<string, WorkletRecord>
        | undefined

      if (worklets) {
        Object.entries(worklets).forEach(([_, graph]) => {
          const { node, handlers } = graph
          if (node) {
            source.connect(node)
            node.port.onmessage = (ev: MessageEvent<any>) => {
              handlers.forEach((handler: WorkletHandler) => {
                handler.call(node.port, ev)
              })
            }
            node.connect(this.context.destination)
          }
        })
      }

      const startTime = Math.max(this.scheduledTime, this.context.currentTime)
      source.start(startTime)
      this.scheduledTime = startTime + audioBuffer.duration
    }

    if (this.audioQueue.length === 0 && this.processingBuffer.length === 0) {
      if (this.isStreamComplete) {
        this.isPlaying = false
        this.setIsAISpeaking(false)
        if (this.checkInterval !== null) {
          clearInterval(this.checkInterval)
          this.checkInterval = null
        }
      } else if (this.checkInterval === null) {
        this.checkInterval = window.setInterval(() => {
          if (
            this.audioQueue.length > 0 ||
            this.processingBuffer.length >= this.bufferSize
          ) {
            this.scheduleNextBuffer()
          }
        }, 100)
      }
    } else {
      const nextCheckTime =
        (this.scheduledTime - this.context.currentTime) * 1000
      setTimeout(
        () => this.scheduleNextBuffer(),
        Math.max(0, nextCheckTime - 50)
      )
    }
  }

  stop(): void {
    this.isPlaying = false
    this.setIsAISpeaking(false)
    this.isStreamComplete = true
    this.audioQueue = []
    this.processingBuffer = new Float32Array(0)
    this.scheduledTime = this.context.currentTime

    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }

    this.gainNode.gain.linearRampToValueAtTime(
      0,
      this.context.currentTime + 0.1
    )

    setTimeout(() => {
      this.gainNode.disconnect()
      this.gainNode = this.context.createGain()
      this.gainNode.connect(this.context.destination)
    }, 200)
  }

  async resume(): Promise<void> {
    if (this.context.state === 'suspended') {
      await this.context.resume()
    }
    this.isStreamComplete = false
    this.scheduledTime = this.context.currentTime + this.initialBufferTime
    this.gainNode.gain.setValueAtTime(1, this.context.currentTime)
  }

  complete(): void {
    this.isStreamComplete = true
    if (this.processingBuffer.length > 0) {
      this.audioQueue.push(this.processingBuffer)
      this.processingBuffer = new Float32Array(0)
      if (this.isPlaying) {
        this.scheduleNextBuffer()
      }
    } else {
      this.onComplete()
    }
  }
}
