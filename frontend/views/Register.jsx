import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BACKEND_BASE_URL } from '../constant/URL'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'buyer',
    status: true,
    password: '',
    projectId: '664ece853e17537b70918cde',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (Object.values(formData).some((value) => !value)) {
      setError('Please fill in all fields')
      return
    }

    try {
      const response = await axios.post(
        `${BACKEND_BASE_URL}/api/users/signUp`,
        formData
      )
      console.log(response.data)
      alert('Sign Up Successful')
      navigate('/login')
    } catch (error) {
      console.error('There was an error signing up!', error)
      if (error.response) {
        console.error('Error Response Data:', error.response.data)
        console.error('Error Response Status:', error.response.status)
        console.error('Error Response Headers:', error.response.headers)
        alert('Sign Up Failed: ' + error.response.data.message)
      } else {
        alert('Sign Up Failed')
      }
    }
  }

  return (
    <div className='bg-black text-white min-h-screen flex items-center justify-center absolute top-0 w-full'>
      <div className='absolute top-14  '>
        <h1 className='text-3xl font-semibold'>
          <span className='text-white'>Talk</span>
          <span className='text-blue-500'>Better</span>
        </h1>
      </div>
      <div className='w-full max-w-lg p-8 space-y-6  rounded-lg shadow-lg'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold mt-2'>Create your account</h2>
          <p className='text-zinc-400 font-medium '>
            Easily manage your autonomous voice assistants all in one dashboard.
          </p>
        </div>

        <form className='space-y-4' onSubmit={handleSubmit}>
          <div className='w-full flex items-center gap-2'>
            <button
              className={`flex-1 py-2  rounded-md ${
                formData.role == 'seller' ? 'bg-[#6062F8]' : 'bg-[#1F1B29]'
              }`}
              onClick={() =>
                setFormData((prev) => ({ ...prev, role: 'seller' }))
              }
            >
              Seller
            </button>
            <button
              className={`flex-1 py-2 bg-[#1F1B29] rounded-md ${
                formData.role == 'buyer' ? 'bg-[#6062F8]' : 'bg-[#1F1B29]'
              }`}
              onClick={() =>
                setFormData((prev) => ({ ...prev, role: 'buyer' }))
              }
            >
              Buyer
            </button>
          </div>
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-zinc-400'
            >
              Name
            </label>
            <input
              type='text'
              id='name'
              name='name'
              className='w-full p-2 bg-[#1F1B29] rounded-md text-white'
              placeholder='Enter your name'
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-zinc-400'
            >
              Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              className='w-full p-2 bg-[#1F1B29] rounded-md text-white'
              placeholder='Enter your email'
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className='relative'>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-zinc-400'
            >
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id='password'
              name='password'
              className='w-full p-2 bg-[#1F1B29] rounded-md text-white'
              placeholder='Enter your password'
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type='button'
              onClick={togglePasswordVisibility}
              className='absolute right-2 top-6 focus:outline-none'
            >
              {showPassword ? (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='32'
                  height='32'
                  fill='white'
                  viewBox='0 0 256 256'
                >
                  <path d='M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z'></path>
                </svg>
              ) : (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='32'
                  height='32'
                  fill='white'
                  viewBox='0 0 256 256'
                >
                  <path d='M53.92,34.62A8,8,0,1,0,42.08,45.38L61.32,66.55C25,88.84,9.38,123.2,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208a127.11,127.11,0,0,0,52.07-10.83l22,24.21a8,8,0,1,0,11.84-10.76Zm47.33,75.84,41.67,45.85a32,32,0,0,1-41.67-45.85ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.16,133.16,0,0,1,25,128c4.69-8.79,19.66-33.39,47.35-49.38l18,19.75a48,48,0,0,0,63.66,70l14.73,16.2A112,112,0,0,1,128,192Zm6-95.43a8,8,0,0,1,3-15.72,48.16,48.16,0,0,1,38.77,42.64,8,8,0,0,1-7.22,8.71,6.39,6.39,0,0,1-.75,0,8,8,0,0,1-8-7.26A32.09,32.09,0,0,0,134,96.57Zm113.28,34.69c-.42.94-10.55,23.37-33.36,43.8a8,8,0,1,1-10.67-11.92A132.77,132.77,0,0,0,231.05,128a133.15,133.15,0,0,0-23.12-30.77C185.67,75.19,158.78,64,128,64a118.37,118.37,0,0,0-19.36,1.57A8,8,0,1,1,106,49.79,134,134,0,0,1,128,48c34.88,0,66.57,13.26,91.66,38.35,18.83,18.83,27.3,37.62,27.65,38.41A8,8,0,0,1,247.31,131.26Z'></path>
                </svg>
              )}
            </button>
          </div>
          <button type='submit' className='w-full p-3 bg-[#5D5FEF] rounded-md '>
            Sign up
          </button>
          {error && <p className='text-red-500 text-xs'>{error}</p>}
        </form>

        <div className='text-center text-sm text-zinc-400'>
          <p>
            Already have an account?{' '}
            <Link to='/' className='text-[#6062F8] text-lg'>
              Sign in
            </Link>
          </p>
        </div>

        <p className='text-xs text-center text-zinc-600'>
          By using TalkBetter you agree to our {''}
          <a href='#' className='text-[#6062F8]'>
            Terms and Conditions
          </a>{' '}
          and{' '}
          <a href='#' className='text-[#6062F8]'>
            Security
          </a>{' '}
          policies and practices.
        </p>
      </div>
    </div>
  )
}

export default Register
