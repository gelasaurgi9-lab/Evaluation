import Header from '@/Components/DepartmentHead/Header'
import Sider from '@/Components/DepartmentHead/Sider'
import React from 'react'
import Analysis from '../Alluser/Analysis'

const DepartmentHeadHome = ({user}) => {

  return (
    <div className='Dashboard h-screen'>
      <Header/>
     <div className='flex items-center mb-10'>
     <Sider/>
     <div className='mt-2'>
      <h1 className='text-2xl font-bold bg-(--six) p-10  m-10 text-gray-100 rounded-2xl'>
                Hello,👋 {user?.fullName || 'Student'}
              </h1>
     </div>
     </div>
     <Analysis/>
    </div>
  )
}

export default DepartmentHeadHome