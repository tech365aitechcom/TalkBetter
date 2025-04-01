import {
    createWorketFromSrc,
    registeredWorklets
} from "./audioWorkletRegister"

export class AudioStreamer {
    audioQueue = []
    isPlaying = false
    sampleRate = 8000
    bufferSize = 7680
    processingBuffer = new Float32Array(0)
    scheduledTime = 0
    isStreamComplete = false
    checkInterval = null
    initialBufferTime = 0.1 //0.1 // 100ms initial buffer
    endOfQueueAudioSource = null

    onComplete = () => { }

    constructor(context,setIsAISpeaking) {
        this.context = context
        this.gainNode = this.context.createGain()
        this.source = this.context.createBufferSource()
        this.gainNode.connect(this.context.destination)
        this.addPCM16 = this.addPCM16.bind(this)
        this.setIsAISpeaking = setIsAISpeaking;
    }

    async addWorklet(workletName, workletSrc, handler) {
        let workletsRecord = registeredWorklets.get(this.context)
        if (workletsRecord && workletsRecord[workletName]) {
            // the worklet already exists on this context
            // add the new handler to it
            workletsRecord[workletName].handlers.push(handler)
            return Promise.resolve(this)
            //throw new Error(`Worklet ${workletName} already exists on context`);
        }

        if (!workletsRecord) {
            registeredWorklets.set(this.context, {})
            workletsRecord = registeredWorklets.get(this.context)
        }

        // create new record to fill in as becomes available
        workletsRecord[workletName] = { handlers: [handler] }

        const src = createWorketFromSrc(workletName, workletSrc)
        await this.context.audioWorklet.addModule(src)
        const worklet = new AudioWorkletNode(this.context, workletName)

        //add the node into the map
        workletsRecord[workletName].node = worklet

        return this
    }

    addPCM16(chunk) {
        const float32Array = new Float32Array(chunk.length / 2)
        const dataView = new DataView(chunk.buffer)

        for (let i = 0; i < chunk.length / 2; i++) {
            try {
                const int16 = dataView.getInt16(i * 2, true)
                float32Array[i] = int16 / 32768
            } catch (e) {
                console.error(e)
                // console.log(
                //   `dataView.length: ${dataView.byteLength},  i * 2: ${i * 2}`,
                // );
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
            // Initialize scheduledTime only when we start playing
            this.scheduledTime = this.context.currentTime + this.initialBufferTime
            this.scheduleNextBuffer()
        }
    }

    createAudioBuffer(audioData) {
        const audioBuffer = this.context.createBuffer(
            1,
            audioData.length,
            this.sampleRate
        )
        audioBuffer.getChannelData(0).set(audioData)
        return audioBuffer
    }


    

    scheduleNextBuffer() {
        const SCHEDULE_AHEAD_TIME = 0.2

        while (
            this.audioQueue.length > 0 &&
            this.scheduledTime < this.context.currentTime + SCHEDULE_AHEAD_TIME
        ) {
            const audioData = this.audioQueue.shift()
            const audioBuffer = this.createAudioBuffer(audioData)
            const source = this.context.createBufferSource()           

            if (this.audioQueue.length === 0) {
                if (this.endOfQueueAudioSource) {
                    this.endOfQueueAudioSource.onended = null
                }
                this.endOfQueueAudioSource = source
                source.onended = () => {
                    if (
                        !this.audioQueue.length &&
                        this.endOfQueueAudioSource === source
                    ) {
                        this.endOfQueueAudioSource = null
                        this.onComplete()
                    }
                }
            }

            source.buffer = audioBuffer
            source.connect(this.gainNode)

            const worklets = registeredWorklets.get(this.context)

            if (worklets) {
                Object.entries(worklets).forEach(([workletName, graph]) => {
                    const { node, handlers } = graph
                    if (node) {
                        source.connect(node)
                        node.port.onmessage = function (ev) {
                            handlers.forEach(handler => {
                                handler.call(node.port, ev)
                            })
                        }
                        node.connect(this.context.destination)
                    }
                })
            }

            // i added this trying to fix clicks
            // this.gainNode.gain.setValueAtTime(0, 0);
            // this.gainNode.gain.linearRampToValueAtTime(1, 1);

            // Ensure we never schedule in the past
            const startTime = Math.max(this.scheduledTime, this.context.currentTime)
            source.start(startTime)

            this.scheduledTime = startTime + audioBuffer.duration
        }

        if (this.audioQueue.length === 0 && this.processingBuffer.length === 0) {
            if (this.isStreamComplete) {
                this.isPlaying = false
                this.setIsAISpeaking(false)
                if (this.checkInterval) {
                    clearInterval(this.checkInterval)
                    this.checkInterval = null
                }
            } else {
                if (!this.checkInterval) {
                    this.checkInterval = window.setInterval(() => {
                        if (
                            this.audioQueue.length > 0 ||
                            this.processingBuffer.length >= this.bufferSize
                        ) {
                            this.scheduleNextBuffer()
                        }
                    }, 100)
                }
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

    stop() {
        this.isPlaying = false
        this.setIsAISpeaking(false)
        this.isStreamComplete = true
        this.audioQueue = []
        this.processingBuffer = new Float32Array(0)
        this.scheduledTime = this.context.currentTime

        if (this.checkInterval) {
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

    async resume() {
        if (this.context.state === "suspended") {
            await this.context.resume()
        }
        this.isStreamComplete = false
        this.scheduledTime = this.context.currentTime + this.initialBufferTime
        this.gainNode.gain.setValueAtTime(1, this.context.currentTime)
    }

    complete() {
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
