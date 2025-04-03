import { BACKEND_BASE_URL } from '@/constant/URL'
import axios from 'axios'
import React, { useState } from 'react'
import { createPortal } from 'react-dom'

const FormPopup = ({ onClose, onSubmit }: any) => {
  const [formData, setFormData] = useState({
    llmName: '',
    gender: '',
    audioFile: null,
  })

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      audioFile: e.target.files[0],
    }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    console.log(formData)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('llmName', formData.llmName || '')
      formDataToSend.append('gender', formData.gender || '')

      if (formData.audioFile) {
        formDataToSend.append('audioFile', formData.audioFile)
      } else {
        console.warn('No audio file selected')
      }

      const response = await axios.post(
        `${BACKEND_BASE_URL}/api/voice/saveAudio`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      console.log('post', response.data)
      onSubmit(response.data)
    } catch (error) {
      console.error('Error posting audio file:', error)
    }
  }

  return createPortal(
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white p-6 rounded-lg w-1/3'>
        <h2 className='text-xl font-bold mb-4'>Save Voice</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label
              className='block text-gray-700 text-sm font-bold mb-2'
              htmlFor='llmName'
            >
              llmName
            </label>
            <input
              type='text'
              id='llmName'
              name='llmName'
              value={formData.llmName}
              onChange={handleChange}
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              required
            />
          </div>
          <div className='mb-4'>
            <label
              className='block text-gray-700 text-sm font-bold mb-2'
              htmlFor='gender'
            >
              Gender
            </label>
            <select
              id='gender'
              name='gender'
              value={formData.gender}
              onChange={handleChange}
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              required
            >
              <option value=''>Select Gender</option>
              <option value='male'>Male</option>
              <option value='female'>Female</option>
              <option value='other'>Other</option>
            </select>
          </div>
          <div className='mb-4'>
            <label
              className='block text-gray-700 text-sm font-bold mb-2'
              htmlFor='audioFile'
            >
              Upload MP3
            </label>
            <input
              type='file'
              id='audioFile'
              name='audioFile'
              accept='audio/mp3'
              onChange={handleFileChange}
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              required
            />
          </div>
          <div className='flex justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default FormPopup
