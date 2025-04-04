'use client'
import { BACKEND_BASE_URL } from '@/constant/URL'
import { useSidebarStore } from '@/store/sidebarStore'
import axios from 'axios'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { FaBullseye } from 'react-icons/fa'

interface User {
  name: string
  email: string
  role?: string
}

const Sidebar: React.FC = () => {
  const { toggleSidebar } = useSidebarStore()
  const [userDetails, setUserDetails] = useState<User | null>(null)
  const [assistants, setAssistants] = useState()
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isPopupVisible, setIsPopupVisible] = useState(false)
  const popupRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const userDetailsString = localStorage.getItem('UserDetails')

    if (userDetailsString) {
      const userDetails = JSON.parse(userDetailsString)
      setUserDetails(userDetails || null)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsPopupVisible(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible)
  }

  const handleLogout = () => {
    localStorage.removeItem('UserDetails')
    localStorage.removeItem('Token')
    setUserDetails(null)
    router.push('/login')
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const hideSidebarPaths = [
    '/login',
    '/register',
    '/demo',
    '/assistantlist',
    '/configured',
    '/chatbots',
    '/voicebots',
    '/blankpopup',
    '/createassistant',
  ]

  const hideSidebarRegex = /^\/(assistant)\/.+$/

  const shouldHideSidebar =
    hideSidebarPaths.includes(pathname) || hideSidebarRegex.test(pathname)

  useEffect(() => {
    const fetchAssistants = async () => {
      const token = localStorage.getItem('Token')
      if (!token) {
        console.log('No token found')
        return
      }

      try {
        const response = await axios.get(
          `${BACKEND_BASE_URL}/api/configs/findAllAssistants`,
          {
            headers: {
              Authorization: ` ${token}`,
            },
          }
        )
        setAssistants(response.data.data)
        // console.log(response.data.data)
      } catch (error) {
        console.error('Error fetching assistants', error)
      }
    }

    fetchAssistants()
  }, [])

  return (
    <div className=''>
      {!shouldHideSidebar && (
        <div
          className={`${
            pathname === '/createassistant' && 'absolute'
          } fixed left-0 flex flex-col rounded w-full cursor-pointer`}
        >
          <div className='w-full py-3 lg:pl-10 flex justify-between items-center pl-2 flex-col sm:flex-row gap-2'>
            <img src='/TalkBetter.png' className='h-10 w-64' alt='TalkBetter' />
            <div
              className={`flex gap-2 items-center pr-5 relative ${
                userDetails?.role == 'seller' ? 'w-[25%]' : ''
              }`}
            >
              {userDetails?.role == 'seller' && (
                <button
                  className='rounded-md py-3 px-2 bg-[#5D5FEF] text-white text-xs w-full cursor-pointer'
                  onClick={() => router.push('/createassistant')}
                >
                  Create Assistant
                </button>
              )}

              <button className='rounded-md text-xs py-3 px-2 bg-[#000000] text-white w-full cursor-pointer'>
                + Add AI for help
              </button>
              <div className='gap-5 flex'>
                <button
                  className={`${
                    userDetails ? 'rounded-full text-xs' : 'rounded-md text-xs'
                  } px-5 p-3 bg-[#5D5FEF] text-white cursor-pointer`}
                  onClick={toggleDropdown}
                >
                  {userDetails?.name ? (
                    userDetails?.name?.slice(0, 1).toUpperCase()
                  ) : (
                    <span onClick={() => router.push('/login')}>Login</span>
                  )}
                </button>
                {userDetails?.name && dropdownOpen && (
                  <button
                    className='block w-full px-4 py-2 text-sm bg-[#5D5FEF] text-white text-center rounded cursor-pointer'
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
          {open ? (
            <div className='lg:bottom-[2rem] flex fixed justify-between flex-col h-[86vh] pt-12 w-42 md:top-auto top-28 bg-[#000000] text-[#989BAC] lg:mx-5 mx-2 text-xs rounded-3xl bottom-[-1.2rem] sm:text-sm lg:w-64 sm:bottom-4'>
              <div
                className='flex flex-col gap-2 font-sans px-3'
                onClick={() => {
                  setOpen(false), toggleSidebar()
                }}
              >
                <div
                  className={`flex gap-1 sm:gap-3 items-center hover:bg-[#383E5A] sm:p-2 p-1 rounded transition-all ${
                    pathname === '/overview' ? 'active-tab' : ''
                  }`}
                  onClick={() => router.push('/overview')}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='32'
                    height='32'
                    fill='white'
                    viewBox='0 0 256 256'
                  >
                    <path d='M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm71.87,53.27L136,114.14V40.37A88,88,0,0,1,199.87,77.27ZM120,40.37v83l-71.89,41.5A88,88,0,0,1,120,40.37ZM128,216a88,88,0,0,1-71.87-37.27L207.89,91.12A88,88,0,0,1,128,216Z'></path>
                  </svg>
                  <h1>Overview</h1>
                </div>
                <div
                  className={`flex gap-1 sm:gap-3 items-center hover:bg-[#383E5A] sm:p-2 p-1 rounded transition-all ${
                    pathname === '/assistants' ? 'active-tab' : ''
                  }`}
                  onClick={() => router.push('/assistants')}
                >
                  <img
                    src='/ApplePodcastsLogo.png'
                    alt='Assistants'
                    className='w-4 h-4 sm:w-9 sm:h-9'
                  />
                  <h1>Assistants</h1>
                </div>
                <div
                  className={`flex gap-1 sm:gap-3 items-center hover:bg-[#383E5A] p-1 sm:p-2 rounded ${
                    pathname === '/phone' ? 'active-tab' : ''
                  }`}
                  onClick={() => router.push('/phone')}
                >
                  <img
                    src='/Phone.png'
                    alt='Phone Numbers'
                    className='w-4 h-4 sm:w-9 sm:h-9'
                  />
                  <h1>Phone Numbers</h1>
                </div>
                <div
                  className={`flex gap-1 sm:gap-3 items-center text-white hover:bg-[#383E5A] p-1 sm:p-2 rounded ${
                    pathname === '/buy-assistant' ? 'active-tab' : ''
                  }`}
                  onClick={() => router.push('/buy-assistant')}
                >
                  <FaBullseye size={30} />
                  <h1>Buy Assistant</h1>
                </div>
                <div
                  className={`flex gap-1 sm:gap-3 items-center hover:bg-[#383E5A] p-1 sm:p-2 rounded ${
                    pathname === '/documents' ? 'active-tab' : ''
                  }`}
                  onClick={() => router.push('/documents')}
                >
                  <img
                    src='/File.png'
                    alt='Documents'
                    className='w-4 h-4 sm:w-9 sm:h-9'
                  />
                  <h1>Documents</h1>
                </div>
                <div
                  className={`flex gap-1 sm:gap-3 items-center hover:bg-[#383E5A] p-1 sm:p-2 rounded ${
                    pathname === '/squads' ? 'active-tab' : ''
                  }`}
                  onClick={() => router.push('/squads')}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='32'
                    height='32'
                    fill='white'
                    viewBox='0 0 256 256'
                  >
                    <path d='M116,128a12,12,0,1,1,12,12A12,12,0,0,1,116,128ZM84,140a12,12,0,1,0-12-12A12,12,0,0,0,84,140Zm88,0a12,12,0,1,0-12-12A12,12,0,0,0,172,140Zm60-76V192a16,16,0,0,1-16,16H83l-32.6,28.16-.09.07A15.89,15.89,0,0,1,40,240a16.13,16.13,0,0,1-6.8-1.52A15.85,15.85,0,0,1,24,224V64A16,16,0,0,1,40,48H216A16,16,0,0,1,232,64ZM40,224h0ZM216,64H40V224l34.77-30A8,8,0,0,1,80,192H216Z'></path>
                  </svg>
                  <h1>Squads</h1>
                </div>
                <div
                  className={`flex gap-1 sm:gap-3 items-center hover:bg-[#383E5A] p-1 sm:p-2 rounded ${
                    pathname === '/voice' ? 'active-tab' : ''
                  }`}
                  onClick={() => router.push('/voice')}
                >
                  <img
                    src='/SpeakerHigh.png'
                    alt='Voice Library'
                    className='w-4 h-4 sm:w-9 sm:h-9'
                  />
                  <h1>Voice Library</h1>
                </div>
                <div
                  className={`flex gap-1 sm:gap-3 items-center hover:bg-[#383E5A] p-1 sm:p-2 rounded ${
                    pathname === '/call' ? 'active-tab' : ''
                  }`}
                  onClick={() => router.push('/call')}
                >
                  <img
                    src='/PhoneCall.png'
                    alt='Call Logs'
                    className='w-4 h-4 sm:w-10 sm:h-10'
                  />
                  <h1>Call Logs</h1>
                </div>
                {/* <div
                  className={`flex gap-1 sm:gap-3 items-center hover:bg-[#383E5A] p-1 sm:p-2 rounded ${
                    pathname === "/api" ? "active-tab" : ""
                  }`}
                  onClick={() => router.push("/api")}
                >
                  <img
                    src={WebhooksLogo}
                    alt="Provider APIs"
                    className="w-4 h-4 sm:w-10 sm:h-10"
                  />
                  <h1>Provider APIs</h1>
                </div> */}
              </div>

              <div
                className={`flex gap-1 md:mt-32 md:ml-2 sm:gap-3 items-center hover:bg-[#383E5A] p-1 sm:p-2 rounded ${
                  pathname === '/profile' ? 'active-tab' : ''
                }`}
                onClick={() => router.push('/profile')}
              >
                <svg
                  className='w-8 h-8 text-white'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
                </svg>
                <h1>Profile</h1>
              </div>
              <div className='relative'>
                <button
                  className='bg-zinc-900 md:ml-3 hover:bg-zinc-800 text-white flex items-center p-2 rounded-lg space-x-2 max-w-lg'
                  onClick={togglePopup}
                  ref={buttonRef}
                >
                  <div className='flex  items-center justify-center bg-teal-600 rounded-full w-8 h-8'>
                    <svg
                      className='w-6 h-6 text-teal-200'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-5l4.5 2.5-4.5 2.5zm0-8L16 12 10 14.01v-5L10 8.5z' />
                    </svg>
                  </div>
                  <span className='flex-grow truncate'>
                    {userDetails?.email}
                  </span>
                  <a className='flex items-center justify-center text-zinc-400'></a>
                </button>

                {isPopupVisible && (
                  <div
                    ref={popupRef}
                    className='absolute md:-top-80 w-60  backdrop-filter backdrop-blur-lg text-white p-4 rounded-lg shadow-md  dark:text-white'
                  >
                    <div className='flex items-center justify-between pb-3 border-b border-zinc-700 dark:border-zinc-700'>
                      <span className='font-semibold'>
                        {userDetails?.email}'s Org
                      </span>
                      <svg
                        className='w-4 h-4 text-zinc-500 dark:text-zinc-500'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M9 18l6-6-6-6'></path>
                      </svg>
                    </div>
                    <div className='pt-3'>
                      <p className='text-zinc-400 text-sm mb-3 dark:text-zinc-400'>
                        Actions
                      </p>
                      <ul className='space-y-2'>
                        <li className='flex items-center hover:bg-zinc-700 p-2 rounded dark:hover:bg-zinc-700'>
                          <span>Billing</span>
                        </li>
                        <li
                          onClick={() => router.push('/members')}
                          className='flex items-center hover:bg-zinc-700 p-2 rounded dark:hover:bg-zinc-700'
                        >
                          <span>Members</span>
                        </li>
                        <li
                          onClick={() => router.push('/settings')}
                          className='flex items-center hover:bg-zinc-700 p-2 rounded dark:hover:bg-zinc-700'
                        >
                          <span>Settings</span>
                        </li>
                        <li
                          onClick={() => router.push('/apikeys')}
                          className='flex items-center hover:bg-zinc-700 p-2 rounded dark:hover:bg-zinc-700'
                        >
                          <span>API Keys</span>
                        </li>
                        <li className='flex items-center hover:bg-zinc-700 p-2 rounded dark:hover:bg-zinc-700'>
                          <span>Provider Credentials</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className='flex flex-col rounded w-[101px] justify-between'
              onClick={() => {
                setOpen(true), toggleSidebar()
              }}
            >
              <div className='flex fixed flex-col bg-black h-[84vh] w-[72px] justify-between items-center mx-2 rounded-3xl pt-8 py-5 lg:bottom-12 transition-all top-[5rem] lg:top-[4.8rem] xxs:top-[7rem] sm:top-[5rem]'>
                <div className='flex flex-col gap-4 items-center'>
                  <div
                    onClick={() => router.push('/overview')}
                    className={`flex gap-1 sm:gap-3 items-center hover:bg-[#383E5A] p-2 rounded ${
                      pathname === '/overview' ? 'active-tab' : ''
                    }`}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='32'
                      height='32'
                      fill='white'
                      viewBox='0 0 256 256'
                    >
                      <path d='M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm71.87,53.27L136,114.14V40.37A88,88,0,0,1,199.87,77.27ZM120,40.37v83l-71.89,41.5A88,88,0,0,1,120,40.37ZM128,216a88,88,0,0,1-71.87-37.27L207.89,91.12A88,88,0,0,1,128,216Z'></path>
                    </svg>
                  </div>
                  <div
                    onClick={() => router.push('/assistants')}
                    className={`flex gap-1 sm:gap-3 items-center hover:bg-[#383E5A] p-2 rounded ${
                      pathname === '/assistants' ? 'active-tab' : ''
                    }`}
                  >
                    <img src='/ApplePodcastsLogo.png' alt='Assistants' />
                  </div>
                  <div
                    onClick={() => router.push('/phone')}
                    className={`flex gap-3 items-center hover:bg-[#383E5A] p-2 rounded ${
                      pathname === '/phone' ? 'active-tab' : ''
                    }`}
                  >
                    <img src='/Phone.png' alt='Phone Numbers' />
                  </div>
                  <div
                    onClick={() => router.push('/buy-assistant')}
                    className={`flex gap-3 items-center text-white text-3xl hover:bg-[#383E5A] p-2 rounded ${
                      pathname === '/buy-assistant' ? 'active-tab' : ''
                    }`}
                  >
                    <FaBullseye />
                  </div>
                  <div
                    onClick={() => router.push('/documents')}
                    className={`flex gap-3 items-center hover:bg-[#383E5A] p-2 rounded ${
                      pathname === '/documents' ? 'active-tab' : ''
                    }`}
                  >
                    <img src='/File.png' alt='Documents' />
                  </div>
                  <div
                    onClick={() => router.push('/squads')}
                    className={`flex gap-3 items-center hover:bg-[#383E5A] p-2 rounded ${
                      pathname === '/squads' ? 'active-tab' : ''
                    }`}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='32'
                      height='32'
                      fill='white'
                      viewBox='0 0 256 256'
                    >
                      <path d='M116,128a12,12,0,1,1,12,12A12,12,0,0,1,116,128ZM84,140a12,12,0,1,0-12-12A12,12,0,0,0,84,140Zm88,0a12,12,0,1,0-12-12A12,12,0,0,0,172,140Zm60-76V192a16,16,0,0,1-16,16H83l-32.6,28.16-.09.07A15.89,15.89,0,0,1,40,240a16.13,16.13,0,0,1-6.8-1.52A15.85,15.85,0,0,1,24,224V64A16,16,0,0,1,40,48H216A16,16,0,0,1,232,64ZM40,224h0ZM216,64H40V224l34.77-30A8,8,0,0,1,80,192H216Z'></path>
                    </svg>
                  </div>
                  <div
                    onClick={() => router.push('/voice')}
                    className={`flex gap-3 items-center hover:bg-[#383E5A] p-2 rounded ${
                      pathname === '/voice' ? 'active-tab' : ''
                    }`}
                  >
                    <img src='/SpeakerHigh.png' alt='Voice Library' />
                  </div>
                  <div
                    onClick={() => router.push('/call')}
                    className={`flex gap-3 items-center hover:bg-[#383E5A] p-2 rounded ${
                      pathname === '/call' ? 'active-tab' : ''
                    }`}
                  >
                    <img src='/PhoneCall.png' alt='Call Logs' />
                  </div>
                  {/* <div
                    className={`flex gap-3 items-center hover:bg-[#383E5A] p-2 rounded ${
                      pathname === "/api" ? "active-tab" : ""
                    }`}
                  >
                    <img src={WebhooksLogo} alt="Provider APIs" />
                  </div> */}
                </div>
                <div
                  onClick={() => router.push('/profile')}
                  className={`flex md:mt-20 gap-3 items-center hover:bg-[#383E5A] p-2 rounded ${
                    pathname === '/profile' ? 'active-tab' : ''
                  }`}
                >
                  <svg
                    className='w-8 h-8 text-white'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
                  </svg>
                </div>
                <div className='flex items-center justify-center bg-teal-600 rounded-full w-8 h-8'>
                  <svg
                    className='w-6 h-6 text-teal-200'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-5l4.5 2.5-4.5 2.5zm0-8L16 12 10 14.01v-5L10 8.5z' />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Sidebar
