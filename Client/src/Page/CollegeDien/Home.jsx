
import React from 'react'
import Analysis from '../Alluser/Analysis'
import Header from '@/Components/CollegeDien/Header'
import Sider from '@/Components/CollegeDien/Sider'
import ViewEvaluationResult from '@/Components/DepartmentHead/ViewEvaluationResult'
import InstractorResultInMyDepartment from '@/Components/CollegeDien/InstractorResultInMyDepartment'


const CollageDeanHome = ({user}) => {
  return (
    <div className='Dashboard h-screen'>
      <Header/>
     <div className='flex items-center mb-10'>
     <Sider/>
     <div className='mt-20'>Hi👋 <span className='bg-(--three) p-3 rounded-lg'>{user.fullName}</span></div>
     </div>
     <InstractorResultInMyDepartment/>
    </div>
  )
}

export default CollageDeanHome