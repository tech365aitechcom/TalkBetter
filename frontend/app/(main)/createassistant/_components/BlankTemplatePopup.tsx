import Link from 'next/link'
import React, { useState } from 'react'
import { BlankTemplatePopupProps } from '../../../../../shared/interfaces/createassistant'
import axios from 'axios'
import { BACKEND_BASE_URL } from '@/constant/URL'
import { useRouter } from 'next/navigation'

const BlankTemplatePopup: React.FC<BlankTemplatePopupProps> = ({ onClose }) => {
  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [language, setLanguage] = useState<string>('english')
  const [price, setPrice] = useState<number>(0.1)
  const [validationError, setValidationError] = useState<string>('')
  const [descValidationError, setDescValidationError] = useState<string>('')
  const router = useRouter()

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

  const handleCreate = () => {
    if (name.trim() === '') {
      setValidationError('* Please enter a Botname')
      return
    }

    if (description.trim() === '') {
      setDescValidationError('* Please enter a description. *')
      return
    }

    setValidationError('')
    setDescValidationError('')
    handleCreateAssistant(name, description, language, price)
  }

  return (
    <div
      role='dialog'
      className='fixed inset-0 z-50 flex items-center justify-center bg-black '
      tabIndex={-1}
      style={{ pointerEvents: 'auto' }}
    >
      <div className='w-1/2 bg-white shadow-lg duration-200 sm:rounded-lg p-10 text-black border'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex flex-col gap-2 mb-2'>
            <p>Create Assistant</p>
            <p>
              Let's create Voicebot Assistant! You can start by giving it a
              unique name
            </p>
          </div>
          <Link href={'/overview'}>
            <button className='text-black text-3xl cursor-pointer'>
              &times;
            </button>
          </Link>
        </div>
        <div className='grid grid-cols-1 gap-6'>
          <div className='flex flex-col gap-2'>
            <label htmlFor='name'>Assistant Name</label>
            <input
              type='text'
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='p-2 w-full border border-black outline-none rounded-md placeholder:text-black text-black'
              placeholder='Enter the Name'
            />
            {validationError && (
              <p className='text-red-500 text-sm'>{validationError}</p>
            )}
            <p className='text-sm'>
              This is a basic AI assistant template with minimal configurations.
              It's designed to serve as a starting point for creating your
              custom voicebot.
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='description'>Description</label>
            <textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='p-2 w-full border  border-black outline-none rounded-md placeholder:text-black text-black h-[10rem]'
              placeholder='Enter the Description'
            />
            {descValidationError && (
              <p className='text-red-500 text-sm'>{descValidationError}</p>
            )}
            <p className='text-sm'>
              This is a basic AI assistant template with minimal configurations.
              It's designed to serve as a starting point for creating your
              custom voicebot.
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='language'>Language</label>
            <select
              id='language'
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className='p-2 w-full border border-black outline-none rounded-md text-black'
            >
              <option value=''>Select Language</option>
              <option value='english'>English</option>
              <option value='hindi'>Hindi</option>
              <option value='spanish'>Spanish</option>
              <option value='french'>French</option>
            </select>
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='price'>Price Per Minute</label>
            <input
              type='number'
              id='price'
              step='0.01'
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              className='p-2 w-full border border-black outline-none rounded-md placeholder:text-black text-black'
            />
            <p className='text-sm'>
              Set the price per minute for using this AI assistant. Users will
              be charged based on the duration of their interaction.
            </p>
          </div>
        </div>
        <div className='flex justify-end mt-4'>
          <Link
            className='text-white bg-[#25263F] px-4 py-2 rounded-lg'
            href={'/overview'}
          >
            Cancel
          </Link>
          <button
            className='bg-[#5D5FEF] text-black px-4 py-2 rounded-lg ml-2 cursor-pointer'
            onClick={handleCreate}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

export default BlankTemplatePopup
