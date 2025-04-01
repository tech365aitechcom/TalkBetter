import React from 'react'
import { useRouter } from 'next/navigation'

const Assistant = ({ open }) => {
  const router = useRouter()

  return (
    <div
      className={`${
        open
          ? 'lg:w-[65%] lg:left-[30%] left-[10rem] w-[60%] sm:left-[15rem] md:w-[70%] sm:w-[62%] xl:w-[75%] xl:left-[23%] xm:w-[68%]'
          : 'lg:w-[89%] lg:right-[3%]   lg:left-[8%] w-[70%] left-[25%]'
      } fixed flex-col gap-[24px] lg:top-[4.6rem] xl:top-[5rem] bg-black h-[85vh] rounded-3xl text-white flex justify-center items-center w-64 top-[6.9rem] sm:top-[4.9rem] `}
    >
      <div onClick={() => router.push('/assistants')} className=''>
        <img
          src='/PlusCircle.png'
          alt='Add Assistant'
          className='w-20 h-20'
        ></img>
      </div>
      <p
        className='font-semibold text-[14px] sm:text-base lg:text-3xl'
        onClick={() => router.push('/assistants')}
      >
        Create Assistant
      </p>
      <p className='font-normal text-[7px] sm:text-sm lg:text-lg'>
        Make a new assistant to get started with your first conversation.
      </p>
    </div>
  )
}

export default Assistant
