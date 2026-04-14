import React from 'react'
import Navbar from '@/component/navbar/navbar'
import Footer from '@/component/footer/footer'
import HomePage from './home/page'


const page = () => {
  return (
    <div>
      <Navbar/>
      <HomePage/>
      <Footer/>
    </div>
  )
}

export default page