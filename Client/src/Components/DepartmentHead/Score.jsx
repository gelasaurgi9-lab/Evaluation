import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { Info } from 'lucide-react';

const Score = ({ evaluatorScores, instructorId }) => {
  // Default values if no scores are provided
  const scores = {
    student: 0,
    self: 0,
    staff: 0,
    supervisor: 0,
  };

  // Only process if we have evaluator scores for this specific instructor
  if (evaluatorScores && evaluatorScores[instructorId]) {
    const instructorScores = evaluatorScores[instructorId];
    scores.student = instructorScores.student || 0;
    scores.self = instructorScores.self || 0;
    scores.staff = instructorScores.staff || 0;
    scores.supervisor = instructorScores.supervisor || 0;
  }

  // Calculate overall average only for non-zero scores
  const validScores = Object.values(scores).filter(score => score > 0);
  const overallAverage = validScores.length > 0 
    ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
    : 'N/A';

  const getScoreColor = (score) => {
    if (score === 0) return 'text-gray-400'; // Gray for no score
    if (score >= 85) return 'text-green-600 font-medium';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Overall:</span>
        <span className={`text-base font-semibold ${getScoreColor(overallAverage)}`}>
          {overallAverage}%
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
        <div className="flex items-center">
          <span className="w-16">Students:</span>
          <span className={getScoreColor(scores.student)}>
            {scores.student > 0 ? `${scores.student.toFixed(1)}%` : 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center">
          <span className="w-16">Self:</span>
          <span className={getScoreColor(scores.self)}>
            {scores.self > 0 ? `${scores.self.toFixed(1)}%` : 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center">
          <span className="w-16">Staff:</span>
          <span className={getScoreColor(scores.staff)}>
            {scores.staff > 0 ? `${scores.staff.toFixed(1)}%` : 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center">
          <span className="w-16">Supervisor:</span>
          <span className={getScoreColor(scores.supervisor)}>
            {scores.supervisor > 0 ? `${scores.supervisor.toFixed(1)}%` : 'N/A'}
          </span>
        </div>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center text-xs text-muted-foreground cursor-help">
              <Info className="h-3 w-3 mr-1" />
              <span>Score details</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Shows average scores from different evaluator types. The overall score is an average of all available evaluations for this instructor.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default Score;