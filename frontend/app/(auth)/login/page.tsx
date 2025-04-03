'use client'
import React, { useState, FormEvent } from 'react'
import axios from 'axios'
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from '@react-oauth/google'
import { BACKEND_BASE_URL } from '@/constant/URL'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LoginFormValues,
  LoginResponse,
} from '../../../../shared/interfaces/login'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { AiOutlineLoading } from 'react-icons/ai'

const Login: React.FC = () => {
  const router = useRouter()
  const [loginState, setLoginState] = useState<LoginFormValues>({
    email: '',
    password: '',
    error: '',
    isSubmitting: false,
    showPassword: false,
  })

  const togglePasswordVisibility = () => {
    setLoginState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginState((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoginState((prev) => ({ ...prev, isSubmitting: true, error: '' }))

    try {
      const response = await axios.post<LoginResponse>(
        `${BACKEND_BASE_URL}/api/users/login`,
        {
          email: loginState.email,
          password: loginState.password,
          projectId: '664ece853e17537b70918cde',
        }
      )
      console.log('Login successful', response.data)

      localStorage.setItem('UserDetails', JSON.stringify(response.data.profile))
      localStorage.setItem('Token', response.data.authToken)
      router.push('/overview')
    } catch (err) {
      console.error('Login error', err)
      setLoginState((prev) => ({
        ...prev,
        error: 'Login failed. Please check your email and password.',
      }))
    } finally {
      setLoginState((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleGoogleLoginSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setLoginState((prev) => ({
        ...prev,
        error: 'Google login failed. Please try again.',
      }))
      return
    }

    try {
      const googleResponse = await axios.post<LoginResponse>(
        `${BACKEND_BASE_URL}/api/users/google-login`,
        {
          token: response.credential,
          projectId: '664ece853e17537b70918cde',
        }
      )
      console.log('Google login successful', googleResponse.data)

      localStorage.setItem(
        'UserDetails',
        JSON.stringify(googleResponse.data.profile)
      )
      localStorage.setItem('Token', googleResponse.data.authToken)
      router.push('/overview')
    } catch (err) {
      console.error('Google login error', err)
      setLoginState((prev) => ({
        ...prev,
        error: 'Google login failed. Please try again.',
      }))
    }
  }

  return (
    <GoogleOAuthProvider clientId='126939604567-fb0s64i0qssep1g10g9qma9e4sek8iqv.apps.googleusercontent.com'>
      <div className='bg-black text-white min-h-screen flex items-center justify-center w-full absolute px-4 md:px-0'>
        <div className='absolute top-20'>
          <h1 className='text-2xl md:text-3xl font-semibold text-center'>
            <span className='text-white'>Talk</span>
            <span className='text-blue-500'>Better</span>
          </h1>
        </div>
        <div className='w-full max-w-md md:max-w-lg p-4 md:p-8 space-y-6'>
          <div className='text-center'>
            <h2 className='text-xl md:text-2xl font-semibold mt-2'>
              Sign into your account
            </h2>
            <p className='text-zinc-400 font-medium'>
              Manage your autonomous voice assistants in one dashboard
            </p>
          </div>

          <form className='space-y-4' onSubmit={handleSubmit}>
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
                value={loginState.email}
                onChange={handleInputChange}
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
                type={loginState.showPassword ? 'text' : 'password'}
                id='password'
                name='password'
                className='w-full py-2 px-3 bg-[#1F1B29] rounded-md text-white'
                placeholder='Enter your password'
                value={loginState.password}
                onChange={handleInputChange}
              />
              <button
                type='button'
                onClick={togglePasswordVisibility}
                className='absolute right-2 top-8 focus:outline-none cursor-pointer'
              >
                {loginState.showPassword ? (
                  <FaEyeSlash color='#fff' />
                ) : (
                  <FaEye color='#fff' />
                )}
              </button>
            </div>
            {loginState.error && (
              <p className='text-red-500 text-sm'>{loginState.error}</p>
            )}
            <button
              type='submit'
              className='w-full p-3 bg-[#5D5FEF] rounded-md cursor-pointer flex items-center justify-center gap-2 text-white disabled:opacity-70'
              disabled={loginState.isSubmitting}
            >
              {loginState.isSubmitting ? (
                <>
                  <AiOutlineLoading className='animate-spin text-lg text-white' />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className='flex items-center justify-center bg-zinc-800 p-2 py-3'>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => {
                console.error('Login Failed')
                setLoginState((prev) => ({
                  ...prev,
                  error: 'Google login failed. Please try again.',
                }))
              }}
            />
          </div>

          <div className='text-center text-sm text-zinc-400'>
            <p>
              Don't have an account?{' '}
              <Link href='/register' className='text-[#6062F8] text-lg'>
                Sign up
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
    </GoogleOAuthProvider>
  )
}

export default Login
