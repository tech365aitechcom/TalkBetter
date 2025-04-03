'use client'
import { useSidebarStore } from '@/store/sidebarStore'
import React, { useState } from 'react'
import audioData from '@/data/audioData.json'
import AudioBox from './_components/AudioBox'
import { VoiceFilterState } from '../../../../shared/interfaces/audio'

const VoicePage = () => {
  const [filters, setFilters] = useState<VoiceFilterState>({
    search: '',
    gender: 'all',
    accent: 'all',
    voiceEngine: 'all',
  })

  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen)

  const filteredData = audioData.filter((audio) => {
    return (
      (filters.gender === 'all' || audio.gender === filters.gender) &&
      (filters.accent === 'all' || audio.accent === filters.accent) &&
      (filters.voiceEngine === 'all' ||
        audio.voice_engine === filters.voiceEngine) &&
      audio.name.toLowerCase().includes(filters.search.toLowerCase())
    )
  })

  return (
    <div
      className={`${
        isSidebarOpen
          ? 'lg:w-[65%] lg:left-[30%] left-[10rem] w-[60%] sm:left-[15rem] md:w-[70%] sm:w-[62%] xl:w-[75%] xl:left-[23%] xm:w-[68%]'
          : 'lg:w-[89%] lg:left-[10%] w-[70%] left-[25%]'
      } fixed overflow-y-scroll gap-[24px] lg:top-[4.6rem] xl:top-[5rem] bg-black h-[85vh] rounded-3xl text-white w-64 top-[6.9rem] sm:top-[4.9rem]`}
    >
      <div className='p-6'>
        <div className='flex gap-4 mb-6'>
          <select
            className='p-2 bg-[#121417] border border-gray-300 rounded'
            value={filters.voiceEngine}
            onChange={(e) =>
              setFilters({
                ...filters,
                voiceEngine: e.target.value as VoiceFilterState['voiceEngine'],
              })
            }
          >
            <option value='all'>All</option>
            <option value='playht'>PlayHT</option>
            <option value='11labs'>11Labs</option>
          </select>
          <input
            type='text'
            placeholder='Search by name'
            className='p-2 bg-[#121417] border border-gray-300 rounded'
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className='p-2 bg-[#121417] border border-gray-300 rounded'
            value={filters.gender}
            onChange={(e) =>
              setFilters({
                ...filters,
                gender: e.target.value as VoiceFilterState['gender'],
              })
            }
          >
            <option value='all'>All</option>
            <option value='male'>Male</option>
            <option value='female'>Female</option>
            <option value='neutral'>Neutral</option>
          </select>
          <select
            className='p-2 bg-[#121417] border border-gray-300 rounded'
            value={filters.accent}
            onChange={(e) =>
              setFilters({
                ...filters,
                accent: e.target.value as VoiceFilterState['accent'],
              })
            }
          >
            <option value='all'>All</option>
            <option value='american'>American</option>
            <option value='canadian'>Canadian</option>
            <option value='british'>British</option>
            <option value='indian'>Indian</option>
          </select>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredData.map((audio) => (
            <AudioBox key={audio.id} audio={audio} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default VoicePage
