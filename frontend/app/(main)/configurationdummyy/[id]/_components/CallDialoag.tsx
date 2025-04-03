import React, { useEffect, useRef, useState } from 'react'
import { FaPhone } from 'react-icons/fa'
import { RxCross2 } from 'react-icons/rx'
import { v4 as uuidv4 } from 'uuid'
import { audioContext, base64ToArrayBuffer } from '../../../../../utils/utils'
import { AudioStreamer } from '../../../../../services/audioStreamer'
import VolMeterWorket from '../../../../../services/workers/volMeter'
import AudioPulse from '../../../buy-assistant/_components/AudioPulse'
import { TWILLO_SERVER_URL } from '../../../../../constant/URL'
import { CallDialogProps } from '../../../../../../shared/interfaces/buy-assistant'

const CallDialog: React.FC<CallDialogProps> = ({ assistant, onClose }) => {
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const websocketRef = useRef<WebSocket | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const audioStreamerRef = useRef<AudioStreamer | null>(null)
  const [isSpeaking, setIsAISpeaking] = useState<boolean>(false)
  const [volume, setVolume] = useState<number>(0)
  const [status, setStatus] = useState<string | null>('Connecting...')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [timer, setTimer] = useState<number>(0)
  const isStartRef = useRef<boolean>(false)

  useEffect(() => {
    if (!audioStreamerRef.current) {
      audioContext({ id: 'audio-out' }).then((audioCtx) => {
        audioStreamerRef.current = new AudioStreamer(audioCtx, setIsAISpeaking)
        audioStreamerRef.current
          .addWorklet('vumeter-out', VolMeterWorket, (ev: any) => {
            setVolume(ev.data.volume)
          })
          .then(() => {
            console.log('Successfully initialized')
          })
      })
    }
  }, [])

  const startTimer = () => {
    timeoutRef.current = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)
  }

  const startCall = async () => {
    sessionIdRef.current = uuidv4()
    try {
      const response = await fetch(`${TWILLO_SERVER_URL}/incoming-call-web`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          id: assistant._id,
          sessionId: sessionIdRef.current,
        }).toString(),
      })

      const data = await response.json()
      if (data.stream_url) {
        console.log('WebSocket URL:', data.stream_url)
        startStreaming(data.stream_url)
      } else {
        console.error('Invalid response:', data)
      }
    } catch (error) {
      console.error('Error starting call:', error)
    }
  }

  const startStreaming = (webSocketUrl: string) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      console.error('getUserMedia not supported in this browser.')
      return
    }

    try {
      const wsConnection = new WebSocket(webSocketUrl)
      wsConnection.binaryType = 'arraybuffer'

      wsConnection.onopen = () => {
        console.log('Connected to WebSocket')
        setStatus(null)
        startTimer()
        websocketRef.current = wsConnection
        setIsStreaming(true)
        startSession()
        sendMedia()
      }

      wsConnection.onmessage = (message) => {
        handleOnMessage(message)
      }

      wsConnection.onclose = () => {
        console.log('WebSocket closed')
        setIsStreaming(false)
      }

      wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const startSession = () => {
    const message = {
      event: 'start',
      start: {
        callSid: sessionIdRef.current,
        streamSid: sessionIdRef.current,
      },
    }
    websocketRef.current?.send(JSON.stringify(message))
  }

  const sendMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const audioCtx = new AudioContext({ sampleRate: 8000 })
    const source = audioCtx.createMediaStreamSource(stream)
    const processor = audioCtx.createScriptProcessor(4096, 1, 1)

    source.connect(processor)
    processor.connect(audioCtx.destination)

    processor.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0)
      const outputData = new Int16Array(inputData.length)

      for (let i = 0; i < inputData.length; i++) {
        outputData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767
      }

      const uint8Array = new Uint8Array(outputData.buffer)
      const base64String = btoa(String.fromCharCode(...uint8Array))

      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(
          JSON.stringify({
            event: 'media',
            media: { payload: base64String },
          })
        )
      }
    }
  }

  const handleOnMessage = (message: MessageEvent) => {
    const data = JSON.parse(message.data)
    if (data.event === 'media') {
      const buffer = base64ToArrayBuffer(data.media.payload)
      audioStreamerRef.current?.addPCM16(new Uint8Array(buffer))
    }
  }

  const cutCall = () => {
    websocketRef.current?.close()
    if (timeoutRef.current) clearInterval(timeoutRef.current)
    onClose()
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
  }

  useEffect(() => {
    if (!isStartRef.current) {
      isStartRef.current = true
      startCall()
    }
  }, [])

  return (
    <div className='fixed inset-0 z-[100000] bg-black/30 flex items-center justify-center'>
      <div className='w-[28rem] bg-[#191818] h-[27rem] rounded-md p-3'>
        <button className='text-white text-3xl' onClick={cutCall}>
          <RxCross2 />
        </button>
        <div className='mt-8 flex items-center justify-center flex-col gap-2'>
          <AudioPulse volume={volume} active={!status} hover={false} />
          <h2 className='text-white text-3xl uppercase mt-2'>
            {assistant.name}
          </h2>
          {status && <p className='text-md text-white'>{status}</p>}
          <p className='text-red-500 text-lg'>{formatTime(timer)}</p>
          <button
            className='h-[2.5rem] w-[2.5rem] bg-red-600 rounded-full text-white grid place-items-center'
            onClick={cutCall}
          >
            <FaPhone />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CallDialog
