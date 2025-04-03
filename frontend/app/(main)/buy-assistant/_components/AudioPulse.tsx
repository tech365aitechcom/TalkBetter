import React, { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { AudioPulseProps } from '../../../../../shared/interfaces/buy-assistant'

const lineCount = 3

export default function AudioPulse({ active, volume, hover }: AudioPulseProps) {
  const lines = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let timeout: number | null = null
    const update = () => {
      lines.current.forEach((line, i) => {
        if (line) {
          line.style.height = `${Math.min(
            24,
            4 + volume * (i === 1 ? 400 : 60)
          )}px`
        }
      })
      timeout = window.setTimeout(update, 100)
    }

    update()

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [volume])

  return (
    <div
      className={clsx(
        'flex w-6 justify-evenly items-center transition-opacity duration-300',
        { 'opacity-100': active, 'opacity-50': !active }
      )}
    >
      {Array(lineCount)
        .fill(null)
        .map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              lines.current[i] = el
            }} // ✅ Fix: Ensures no return value
            className={clsx(
              'bg-gray-300 w-1 min-h-1 rounded-full transition-all duration-100',
              { 'bg-gray-700': active, 'hover-animation': hover }
            )}
            style={{ animationDelay: `${i * 133}ms` }}
          />
        ))}
    </div>
  )
}
