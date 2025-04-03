'use client'
import React, { useState, ChangeEvent, FormEvent } from 'react'
import axios from 'axios'
import { BACKEND_BASE_URL } from '@/constant/URL'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RegisterFormValues } from '../../../../shared/interfaces/register'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const Register: React.FC = () => {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterFormValues>({
    name: '',
    email: '',
    role: 'buyer',
    status: true,
    password: '',
    projectId: '664ece853e17537b70918cde',
    isSubmitting: false,
  })
  const [error, setError] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (Object.values(formData).some((value) => !value)) {
      setError('Please fill in all fields')
      return
    }
    setFormData((prev) => ({ ...prev, isSubmitting: true }))

    try {
      const response = await axios.post(
        `${BACKEND_BASE_URL}/api/users/signUp`,
        formData
      )
      console.log(response.data)
      alert('Sign Up Successful')
      router.push('/login')
    } catch (error: any) {
      console.error('There was an error signing up!', error)
      if (error.response) {
        alert('Sign Up Failed: ' + error.response.data.message)
      } else {
        alert('Sign Up Failed')
      }
    } finally {
      setFormData((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  return (
    <div className='bg-black text-white min-h-screen flex items-center justify-center absolute top-0 w-full'>
      <div className='absolute top-14'>
        <h1 className='text-3xl font-semibold'>
          <span className='text-white'>Talk</span>
          <span className='text-blue-500'>Better</span>
        </h1>
      </div>
      <div className='w-full max-w-lg p-8 space-y-6 rounded-lg shadow-lg'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold mt-2'>Create your account</h2>
          <p className='text-zinc-400 font-medium'>
            Easily manage your autonomous voice assistants all in one dashboard.
          </p>
        </div>
        <form className='space-y-4' onSubmit={handleSubmit}>
          <div className='w-full flex items-center gap-2'>
            <button
              type='button'
              className={`flex-1 py-2 rounded-md ${
                formData.role === 'seller' ? 'bg-[#6062F8]' : 'bg-[#1F1B29]'
              }`}
              onClick={() =>
                setFormData((prev) => ({ ...prev, role: 'seller' }))
              }
            >
              Seller
            </button>
            <button
              type='button'
              className={`flex-1 py-2 bg-[#1F1B29] rounded-md ${
                formData.role === 'buyer' ? 'bg-[#6062F8]' : 'bg-[#1F1B29]'
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
              className='absolute right-2 top-8 focus:outline-none cursor-pointer'
            >
              {showPassword ? (
                <FaEyeSlash color='#fff' />
              ) : (
                <FaEye color='#fff' />
              )}
            </button>
          </div>
          <button type='submit' className='w-full p-3 bg-[#5D5FEF] rounded-md'>
            Sign up
          </button>
          {error && <p className='text-red-500 text-xs'>{error}</p>}
        </form>
        <div className='text-center text-sm text-zinc-400'>
          <p>
            Already have an account?{' '}
            <Link href='/login' className='text-[#6062F8] text-lg'>
              Sign in
            </Link>
          </p>
        </div>
        <p className='text-xs text-center text-zinc-600'>
          By using TalkBetter you agree to our{' '}
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
