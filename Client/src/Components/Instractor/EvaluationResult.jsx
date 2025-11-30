import { fetchResponsesByInstructorId, selectResponses } from '@/Store/EvaluationSlice'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const EvaluationResult = () => {
  const responses = useSelector(selectResponses);
  const {user}=useSelector(state=>state.auth)

  const InstructorId=user?._id || ''
  const dispatch=useDispatch()
  
  useEffect(() => {
    // Directly fetch responses by instructor ID
    if (InstructorId) {
      dispatch(fetchResponsesByInstructorId(InstructorId));
    }
  }, [dispatch, InstructorId]);

  // Calculate average scores by evaluator type
  const calculateAverageByType = (responses, evaluatorType) => {
    const filteredResponses = responses.filter(response => {
      // Map evaluation category to evaluator type
      const categoryMap = {
        'Student': 'Student',
        'Self_Evaluation': 'Self', 
        'Immediate_Supervisior': 'Immediate Supervisor',
        'College_Team': 'Staff'
      };
      const evaluatorTypeFromCategory = categoryMap[response.evaluation?.category] || 'Unknown';
      return evaluatorTypeFromCategory === evaluatorType;
    });
    
    if (filteredResponses.length === 0) return null;
    
    // Calculate average from all ratings in the responses array
    const allRatings = [];
    filteredResponses.forEach(response => {
      if (response.responses && Array.isArray(response.responses)) {
        response.responses.forEach(resp => {
          if (resp.rating) {
            // Keep rating as 0-100 scale
            allRatings.push(resp.rating);
          }
        });
      }
    });
    
    if (allRatings.length === 0) return null;
    
    const totalRating = allRatings.reduce((acc, rating) => acc + rating, 0);
    return {
      average: totalRating,
      count: filteredResponses.length
    };
  };

  const studentAverage = calculateAverageByType(responses, 'Student');
  const supervisorAverage = calculateAverageByType(responses, 'Immediate Supervisor');
  const selfAverage = calculateAverageByType(responses, 'Self');
  const staffAverage = calculateAverageByType(responses, 'Staff');

  return (
    <div className='mb-20'>
     <h1 className='m-10 font-bold text-2xl'>MY Evaluation Results</h1>
     
     {/* Display Average Scores by Evaluator Type */}
     {responses && responses.length > 0 && user.isVerified && (
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
         
         {/* Student Evaluations */}
         {studentAverage && (
        <div style={{ 
             backgroundColor: '#14470bff', 
             padding: '15px', 
             borderRadius: '8px',
             border: '1px solid #09f57352'
           }}>
             <h3 style={{ color: '#d4e6d5ff', margin: '0 0 10px 0' }}>Student Evaluations</h3>
             <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#cae7ccff' }}>
               {studentAverage.average.toFixed(1)} /40%
             </div>
             <div style={{ fontSize: '16px', color: '#4caf50', marginTop: '5px' }}>
               {'⭐'.repeat(Math.round(studentAverage.average /8))}
             </div>
             <div style={{ fontSize: '12px', color: '#e7e7e0ff', marginTop: '5px' }}>
               Based on {studentAverage.count} evaluaters{studentAverage.count !== 1 ? 's' : ''}
             </div>
           </div>
         )}

         {/* Supervisor Evaluations */}
         {supervisorAverage && (
          <div style={{ 
             backgroundColor: '#14470bff', 
             padding: '15px', 
             borderRadius: '8px',
             border: '1px solid #09f57352'
           }}>
       <h3 style={{ color: '#d4e6d5ff', margin: '0 0 10px 0' }}>Student Evaluations</h3>
             <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#cae7ccff' }}>
               {supervisorAverage.average.toFixed(1)} / 20%
             </div>
             <div style={{ fontSize: '16px', color: '#ff9800', marginTop: '5px' }}>
               {'⭐'.repeat(Math.round(supervisorAverage.average / 4))}
             </div>
             <div style={{ fontSize: '12px', color: '#ffffffff', marginTop: '5px' }}>
               Based on {supervisorAverage.count} evaluaters{supervisorAverage.count !== 1 ? 's' : ''}
             </div>
           </div>
         )}

         {/* Self Evaluations */}
         {selfAverage && (
            <div style={{ 
             backgroundColor: '#14470bff', 
             padding: '15px', 
             borderRadius: '8px',
             border: '1px solid #09f57352'
           }}>
    <h3 style={{ color: '#d4e6d5ff', margin: '0 0 10px 0' }}>Student Evaluations</h3>
             <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#cae7ccff' }}>
               {selfAverage.average.toFixed(1)} / 10%
             </div>
             <div style={{ fontSize: '16px', color: '#9c27b0', marginTop: '5px' }}>
               {'⭐'.repeat(Math.round(selfAverage.average / 2))}
             </div>
             <div style={{ fontSize: '12px', color: '#ffffffff', marginTop: '5px' }}>
               Based on {selfAverage.count} evaluaters{selfAverage.count !== 1 ? 's' : ''}
             </div>
           </div>
         )}

         {/* Staff Evaluations */}
         {staffAverage && (
           <div style={{ 
             backgroundColor: '#14470bff', 
             padding: '15px', 
             borderRadius: '8px',
             border: '1px solid #09f57352'
           }}>
            <h3 style={{ color: '#d4e6d5ff', margin: '0 0 10px 0' }}>Student Evaluations</h3>
             <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#cae7ccff' }}>
               {staffAverage.average.toFixed(1)} / 30%
             </div>
             <div style={{ fontSize: '16px', color: '#0aa80aff', marginTop: '5px' }}>
               {'⭐'.repeat(Math.round(staffAverage.average / 15))}
             </div>
             <div style={{ fontSize: '12px', color: '#ffffffff', marginTop: '5px' }}>
               Based on {staffAverage.count} evaluaters{staffAverage.count !== 1 ? 's' : ''}
             </div>
           </div>
         )}

       </div>
     )}
     
     {(!responses || responses.length === 0) && (
       <p>No evaluation results available.</p>
     )}
    </div>
  )
}

export default EvaluationResult