'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('Token')
    if (token) {
      router.push('/overview')
    }
  }, [router])

  return <div className='w-full bg-[#242323]'>{children}</div>
}

export default AuthLayout
