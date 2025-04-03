'use client'
import React, { useState } from 'react'
import ChatbotModal from './ChatbotModal'

const ChatBot: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false)

  return (
    <div>
      <button
        className='fixed flex justify-center items-center gap-2 bottom-10 text-center right-10 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg cursor-pointer'
        onClick={() => setIsChatbotOpen(true)}
        style={{ opacity: 1 }}
      >
        Ask AI{' '}
        <span className='text-[#5D5FEF] font-extrabold text-2xl'>TB</span>
      </button>
      {isChatbotOpen && (
        <ChatbotModal onClose={() => setIsChatbotOpen(false)} />
      )}
    </div>
  )
}

export default ChatBot
