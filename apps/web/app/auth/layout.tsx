import React, { ReactNode } from 'react'
import Logo from '../icons/Logo'
import { ToastContainer } from 'react-toastify'

const layout = ({children}:{children:ReactNode}) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 p-4">
        <ToastContainer/>
        <div className="flex items-center mb-8">
        {/* <PenLine className="h-8 w-8 text-violet-500" /> */}
        <Logo></Logo>
        <span className="ml-2 text-xl font-bold text-white">ColabDraw</span>
      </div>
        {children}
    </div>
  )
}

export default layout