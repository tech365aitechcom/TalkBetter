'use client'
import Sidebar from '@/components/Sidebar'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('Token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className='flex bg-[#242323] w-full h-screen' suppressHydrationWarning>
      <Sidebar />
      <div className='flex-1'>{children}</div>
    </div>
  )
}
