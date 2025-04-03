'use client'

import { BACKEND_BASE_URL } from '@/constant/URL'
import { useSidebarStore } from '@/store/sidebarStore'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { buyAssistant } from '../../../http/assistantHttp'
import { debounce } from 'lodash'
import CallDialoag from './_components/CallDialoag'
import { useRouter } from 'next/navigation'
import { FaStar, FaUserAlt } from 'react-icons/fa'
import { BuyAssistantState } from '../../../../shared/interfaces/buy-assistant'

const BuyAssistantPage = () => {
  const [state, setState] = useState<BuyAssistantState>({
    loading: false,
    page: 1,
    totalPage: 1,
    search: '',
    buyLoading: null,
    selectedCall: null,
    assistants: [],
  })

  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen)
  const router = useRouter()

  const handleBuyAssistant = (id: string) => {
    buyAssistant(
      id,
      () => setState((prevState) => ({ ...prevState, buyLoading: id })),
      () => setState((prevState) => ({ ...prevState, buyLoading: null }))
    )
  }

  const fetchAssistant = async (page: number, searchQuery: string) => {
    setState((prevState) => ({ ...prevState, loading: true }))
    try {
      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/configs/get-publish-assistant?page=${page}&search=${searchQuery}`
      )
      setState((prevState) => ({
        ...prevState,
        assistants: res.data.data,
        totalPage: res.data.totalPage,
      }))
    } catch (error: any) {
      console.log('Error fetching assistant:', error.message)
    } finally {
      setState((prevState) => ({ ...prevState, loading: false }))
    }
  }

  const debouncedFetch = debounce((page: number, query: string) => {
    fetchAssistant(page, query)
  }, 500)

  useEffect(() => {
    debouncedFetch(state.page, state.search)
  }, [state.page, state.search])

  return (
    <>
      <div
        className={`${
          isSidebarOpen
            ? 'lg:w-[65%] lg:left-[30%] left-[10rem] w-[60%] sm:left-[15rem] md:w-[70%] sm:w-[62%] xl:w-[75%] xl:left-[23%] xm:w-[68%]'
            : 'lg:w-[89%] lg:left-[10%] w-[70%] left-[25%]'
        } fixed lg:top-[4.6rem] xl:top-[5rem] bg-black h-[85vh] px-4 py-5 rounded-3xl text-white w-64 top-[6.9rem] sm:top-[4.9rem]`}
      >
        <div className='mb-4'>
          <input
            type='text'
            placeholder='Search by name...'
            className='w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-500 focus:outline-none'
            value={state.search}
            onChange={(e) =>
              setState((prevState) => ({
                ...prevState,
                search: e.target.value,
              }))
            }
          />
        </div>

        {state.assistants.length !== 0 && !state.loading && (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-8 overflow-y-auto h-[70vh]'>
            {state.assistants.map((assistant) => (
              <div
                key={assistant._id}
                className='bg-gray-700 rounded-lg p-6 shadow-md relative cursor-pointer hover:shadow-xl transition-shadow duration-300 h-60 overflow-hidden flex flex-col'
              >
                <div className='flex-grow overflow-y-auto'>
                  <div className='flex items-center justify-between mb-4'>
                    <h2
                      className='text-2xl font-semibold'
                      onClick={() =>
                        router.push(`/configurationdummyy/${assistant._id}`)
                      }
                    >
                      {assistant.name}
                    </h2>
                    <div className='flex items-center gap-2'>
                      {[...Array(5)].map((_, index) => (
                        <FaStar
                          key={index}
                          className='text-yellow-500 text-lg'
                        />
                      ))}
                    </div>
                  </div>
                  <p className='text-muted'>
                    {assistant.description.slice(0, 100)}...
                  </p>
                  <div className='flex items-center justify-between my-3'>
                    <h2 className='text-xl flex items-center gap-2'>
                      <FaUserAlt /> {assistant.purchaseCount}
                    </h2>
                    <h2 className='text-2xl'>${assistant.price}/m</h2>
                  </div>
                  <div className='flex items-center gap-2 mt-2'>
                    <button
                      className='bg-green-500 text-white flex-1 py-2 rounded-md'
                      onClick={() => handleBuyAssistant(assistant._id)}
                      disabled={state.buyLoading === assistant._id}
                    >
                      {state.buyLoading === assistant._id
                        ? 'Loading...'
                        : 'Buy Now'}
                    </button>
                    <button
                      className='bg-blue-500 text-white flex-1 py-2 rounded-md'
                      onClick={() =>
                        setState((prevState) => ({
                          ...prevState,
                          selectedCall: assistant,
                        }))
                      }
                    >
                      Try Call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {state.assistants.length === 0 && !state.loading && (
          <h1 className='text-3xl text-center mt-32'>No Assistant Found</h1>
        )}
        {state.loading && (
          <h1 className='text-3xl text-center mt-32'>Loading...</h1>
        )}

        <div className='flex justify-center items-center mt-4 gap-4'>
          <button
            className='bg-gray-700 px-4 py-2 rounded-md cursor-pointer'
            disabled={state.page === 1}
            onClick={() =>
              setState((prevState) => ({
                ...prevState,
                page: prevState.page - 1,
              }))
            }
          >
            Previous
          </button>
          <span>
            Page {state.page} of {state.totalPage}
          </span>
          <button
            className='bg-gray-700 px-4 py-2 rounded-md cursor-pointer'
            disabled={state.page === state.totalPage}
            onClick={() =>
              setState((prevState) => ({
                ...prevState,
                page: prevState.page + 1,
              }))
            }
          >
            Next
          </button>
        </div>
      </div>

      {state.selectedCall && (
        <CallDialoag
          assistant={state.selectedCall}
          onClose={() =>
            setState((prevState) => ({ ...prevState, selectedCall: null }))
          }
        />
      )}
    </>
  )
}

export default BuyAssistantPage
