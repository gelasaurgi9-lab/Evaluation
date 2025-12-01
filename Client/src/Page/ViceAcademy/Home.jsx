
import React from 'react'
import Analysis from '../Alluser/Analysis'
import Header from '@/Components/ViceAcademy/Header'
import Sider from '@/Components/ViceAcademy/Sider'
import EvaluationResult from '@/Components/HumanResource/EvaluationResult'

const ViceAcademyHome = ({user}) => {
  return (
    <div className='Dashboard h-screen'>
      <Header/>
     <div className='flex items-center m-10'>
     
     <div className='mt-20'>Hello 👋👋👋 <span className='bg-(--three) p-3 rounded-lg'>{user.fullName}</span></div>
     </div>
     <EvaluationResult/>
    </div>
  )
}

export default ViceAcademyHome;