'use client'
import { BACKEND_BASE_URL } from '@/constant/URL'
import { useSidebarStore } from '@/store/sidebarStore'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import BlankTemplatePopup from './_components/BlankTemplatePopup'
import { Template } from '../../../../shared/interfaces/createassistant'

const CreateAssistant: React.FC = () => {
  const [configs, setConfigs] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [showPopup, setShowPopup] = useState<boolean>(true)
  const router = useRouter()
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen)

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const token = localStorage.getItem('Token')
        if (!token) {
          console.error('No token found')
          return
        }
        const response = await axios.get(
          `${BACKEND_BASE_URL}/api/configs/getConfigs`,
          {
            headers: {
              Authorization: token,
            },
          }
        )
        setConfigs(response.data.data)
      } catch (error) {
        console.error('Error fetching configs:', error)
      }
    }
    fetchConfigs()
  }, [])

  const handleCreateAssistant = async (
    name: string,
    description: string,
    language: string,
    price: number
  ) => {
    const token = localStorage.getItem('Token')
    if (!token) {
      console.error('No token found')
      return
    }
    try {
      const responseConfig = await axios.post(
        `${BACKEND_BASE_URL}/api/configs/createAndEditConfig`,
        {
          fillers: ['Great'],
          voiceId:
            's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json',
          firstFiller: 'Hello there Alex this side from Blue Lotus.',
          audioSpeed: '0.9',
          informationNeeded: '',
        },
        {
          headers: {
            Authorization: token,
          },
        }
      )

      if (responseConfig?.data?.data?._id) {
        const response = await axios.post(
          `${BACKEND_BASE_URL}/api/configs/createAssistant`,
          {
            name,
            instructions: 'You are a good assistant.',
            configId: responseConfig.data.data._id,
            description,
            language,
            type: 'service',
            price,
          },
          {
            headers: {
              Authorization: token,
            },
          }
        )

        router.push(`/configurationdummyy/${response.data.data._id}`)
      }
    } catch (error) {
      console.error('Error creating assistant:', error)
    }
  }

  const templates: Template[] = [
    {
      title: 'Appointment Setter',
      description:
        'For dental practices to demonstrate appointment setting. 13 utterances and examples showing emerging components.',
    },
    {
      title: 'Customer Support',
      description:
        'For retail websites to demonstrate appointment setting. 15 utterances and examples showing emerging components.',
    },
    {
      title: 'Inbound Q/A',
      description:
        'For dental practices to demonstrate appointment setting. 15 examples against schedules, showing emerging components.',
    },
    {
      title: 'Game NPC',
      description:
        'For novel practices to demonstrate appointment setting. 13 utterances and examples showing emerging components.',
    },
    {
      title: 'Create Template',
      description:
        'For dental practices to demonstrate appointment setting. 15 examples against schedules, showing emerging components.',
    },
  ]

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template.title)
    setShowPopup(true)
  }

  return (
    <>
      <div
        className={`${
          isSidebarOpen
            ? 'lg:w-[65%] lg:left-[30%] left-[10rem] w-[60%] sm:left-[15rem] md:w-[70%] sm:w-[62%] xl:w-[82%] xl:left-[18%] xm:w-[68%]'
            : 'lg:w-[90%] lg:left-[10%] w-[70%] left-[25%]'
        } absolute lg:top-[4.6rem] xl:top-[5rem] h-[85vh] rounded-3xl text-white w-64 top-[6.9rem] sm:top-[4.9rem] hidden`}
      >
        <div className='max-w-4xl h-full overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-gray-400 rounded-xl pt-9 pl-9 pr-9 pb-9 bg-black mx-auto md:ml-60 md:mr-72'>
          <h1 className='text-2xl text-center font-semibold mb-6'>
            Let's create your first assistant!
          </h1>
          <p className='text-zinc-400 text-center mb-4'>
            Here's a few templates to get you started:
          </p>
          <div className='md:p-4 text-white'>
            <div className='space-y-4 w-fit'>
              {templates.map((template, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between bg-[#25263F] p-4 rounded-lg cursor-pointer'
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className='rounded h-24 w-24 border border-blue-800'></div>
                  <div className='flex-1 ml-4'>
                    <h2 className='text-lg font-bold'>{template.title}</h2>
                    <p className='text-sm text-zinc-400'>
                      {template.description}
                    </p>
                  </div>
                  <svg
                    className='w-6 h-6 text-zinc-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M9 5l7 7-7 7'
                    ></path>
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {showPopup && (
        <BlankTemplatePopup
          onClose={() => setShowPopup(false)}
          selectedTemplate={selectedTemplate}
          handleCreateAssistant={handleCreateAssistant}
        />
      )}
    </>
  )
}

export default CreateAssistant
