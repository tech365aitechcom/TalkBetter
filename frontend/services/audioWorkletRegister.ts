// Define the shape of each worklet entry
export interface WorkletHandler {
  (event: MessageEvent<any>): void
}

export interface WorkletRecord {
  node?: AudioWorkletNode
  handlers: WorkletHandler[]
}

// Strongly type the Map with AudioContext as the key and a record of worklets
export const registeredWorklets = new Map<
  AudioContext,
  Record<string, WorkletRecord>
>()

// Type the parameters and return value
export const createWorketFromSrc = (
  workletName: string,
  workletSrc: string
): string => {
  const script = new Blob(
    [`registerProcessor("${workletName}", ${workletSrc})`],
    {
      type: 'application/javascript',
    }
  )

  return URL.createObjectURL(script)
}
