import Loading from '@/components/loading'
import React from 'react'

const LoadingPage = () => {
  return (
    <div className="-mt-8 h-screen">
      <div className="h-full w-full flex justify-center items-center">
        <Loading />
      </div>
    </div>
  )
}

export default LoadingPage