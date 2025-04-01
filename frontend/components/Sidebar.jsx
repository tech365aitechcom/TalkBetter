'use client'
import React, { useState } from 'react'
import Navbar from './Navbar'

const Sidebar = () => {
  const [openstate, setOpenState] = useState(false)
  const openfun = (data) => {
    setOpenState(!openstate)
  }

  return <Navbar openfun={openfun} />
}

export default Sidebar
