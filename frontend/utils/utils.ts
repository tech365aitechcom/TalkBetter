'use client'

const map = new Map<string, AudioContext>()

type AudioContextOptionsWithId = AudioContextOptions & {
  id?: string
}

export const audioContext = (() => {
  const didInteract = new Promise<void>((res) => {
    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', () => res(), { once: true })
      window.addEventListener('keydown', () => res(), { once: true })
    }
  })

  return async (options?: AudioContextOptionsWithId): Promise<AudioContext> => {
    try {
      const a = new Audio()
      a.src =
        'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'
      await a.play()

      if (options?.id && map.has(options.id)) {
        const ctx = map.get(options.id)
        if (ctx) {
          return ctx
        }
      }

      const ctx = new AudioContext(options)
      if (options?.id) {
        map.set(options.id, ctx)
      }
      return ctx
    } catch (e) {
      await didInteract

      if (options?.id && map.has(options.id)) {
        const ctx = map.get(options.id)
        if (ctx) {
          return ctx
        }
      }

      const ctx = new AudioContext(options)
      if (options?.id) {
        map.set(options.id, ctx)
      }
      return ctx
    }
  }
})()

export const blobToJSON = <T = any>(blob: Blob): Promise<T> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result) {
        try {
          const json = JSON.parse(reader.result as string)
          resolve(json)
        } catch (error) {
          reject('Invalid JSON')
        }
      } else {
        reject('oops')
      }
    }
    reader.readAsText(blob)
  })

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}
