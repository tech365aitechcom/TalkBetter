'use client'
import { BACKEND_BASE_URL } from '@/constant/URL'
import { useSidebarStore } from '@/store/sidebarStore'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Select from 'react-select'

interface Assistant {
  _id: string
  assistantId: string
  name: string
  twilioNumber: string
  createdAt: string
  updatedAt: string
}

interface SelectOption {
  value: string
  label: string
}

const AssistantsPage = () => {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [activeAssistant, setActiveAssistant] = useState<string>('')
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>('')
  const router = useRouter()
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen)

  useEffect(() => {
    const token = localStorage.getItem('Token')

    if (!token) {
      router.push('/login')
    }

    const axiosInstance = axios.create({
      baseURL: `${BACKEND_BASE_URL}/api`,
      headers: {
        Authorization: ` ${token}`,
      },
    })

    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('Token')
          router.push('/login')
        }
        return Promise.reject(error)
      }
    )

    const fetchAssistants = async () => {
      try {
        const response = await axiosInstance.get<{ data: Assistant[] }>(
          '/configs/findAllAssistants'
        )
        setAssistants(response.data.data)
      } catch (error) {
        console.error('Error fetching assistants', error)
      }
    }

    fetchAssistants()
  }, [router])

  const options: SelectOption[] = assistants.map((voice) => ({
    value: voice._id,
    label: voice.name,
  }))

  const handleSelectChange = async (selectedOption: SelectOption | null) => {
    if (!selectedOption) return

    setActiveAssistant(selectedOption.label)
    setSelectedAssistantId(selectedOption.value)

    const token = localStorage.getItem('Token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await axios.put(
        `${BACKEND_BASE_URL}/api/configs/setDefaultAssistant`,
        {
          assistantId: selectedOption.value,
        },
        {
          headers: {
            Authorization: ` ${token}`,
          },
        }
      )
      console.log('Enabled:', response)
    } catch (error) {
      console.error('Error setting default assistant', error)
    }
  }

  return (
    <div
      className={`${
        isSidebarOpen
          ? 'lg:w-[65%]  lg:left-[30%] left-[10rem] w-[60%] sm:left-[15rem] md:w-[70%] sm:w-[62%] xl:w-[79%] xl:left-[20%] xm:w-[68%] mt-6'
          : 'lg:w-[93%] lg:right-[3%] lg:left-[6%] w-[70%] left-[25%]'
      } absolute   flex-col gap-[24px] lg:top-[4.6rem] xl:top-[5rem] bg-black h-[85vh] rounded-3xl text-white flex justify-start py-4 items-center sm:top-[4.9rem] top-[6.9rem]  overflow-hidden`}
    >
      <div className='w-full px-8'>
        <Select
          options={options}
          onChange={handleSelectChange}
          className='w-full py-1 bg-[#1F1B29] rounded mb-1'
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: '#1F1B29',
              border: 'none',
              boxShadow: 'none',
              '&:hover': {
                border: 'none',
              },
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: '#1F1B29',
            }),
            singleValue: (base) => ({
              ...base,
              color: 'white',
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? '#3E2F5B' : '#1F1B29',
              color: 'white',
            }),
          }}
        />
        <p className='text-green-500 mb-5'>
          Active Assistant: {activeAssistant || 'None'}
        </p>
        {assistants.length !== 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-8 overflow-y-auto h-[70vh]'>
            {assistants.map((assistant) => (
              <div
                key={assistant._id}
                className='bg-gray-700 rounded-lg p-6 shadow-md relative cursor-pointer hover:shadow-xl transition-shadow duration-300 h-52 overflow-hidden flex flex-col'
              >
                <div className='flex-grow overflow-y-auto'>
                  <h2
                    className='text-2xl font-semibold mb-4'
                    onClick={() =>
                      router.push(`/configurationdummyy/${assistant._id}`)
                    }
                  >
                    {assistant.name}
                  </h2>

                  <div className='text-sm'>
                    <p className='mb-2'>
                      <strong>Assistant ID:</strong> {assistant.assistantId}
                    </p>
                    <p className='mb-2'>
                      <strong>Twilio Number:</strong> {assistant.twilioNumber}
                    </p>
                    <p className='mb-2'>
                      <strong>Created At:</strong>{' '}
                      {new Date(assistant.createdAt).toLocaleString()}
                    </p>
                    <p className='mb-2'>
                      <strong>Updated At:</strong>{' '}
                      {new Date(assistant.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <h1 className='text-3xl text-center mt-32'>No Assistant Found</h1>
        )}
      </div>
    </div>
  )
}

export default AssistantsPage
