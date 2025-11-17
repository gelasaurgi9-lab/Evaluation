import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { Info, User, UserCheck, Users, UserCog } from 'lucide-react';

const Score = ({ evaluatorScores = {}, hasEvaluations = true }) => {

  console.log(evaluatorScores)
  // If there are no evaluations or no scores, show a message
  if (!hasEvaluations || !evaluatorScores || Object.keys(evaluatorScores).length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No evaluations available
      </div>
    );
  }
  // Process scores with default values and calculate individual scores
  const scores = {
    student: {
      value: evaluatorScores.student || 0,
      label: 'Students',
      icon: <Users className="h-3 w-3 mr-1" />
    },
    self: {
      value: evaluatorScores.self || 0,
      label: 'Self',
      icon: <User className="h-3 w-3 mr-1" />
    },
    staff: {
      value: evaluatorScores.staff || 0,
      label: 'Staff',
      icon: <Users className="h-3 w-3 mr-1" />
    },
    supervisor: {
      value: evaluatorScores.supervisor || 0,
      label: 'Supervisor',
      icon: <UserCog className="h-3 w-3 mr-1" />
    }
  };

  // Calculate overall average only for non-zero scores
  const validScores = Object.values(scores)
    .map(score => score.value)
    .filter(score => score > 0);
    
  const overallAverage = validScores.length > 0 
    ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
    : 'N/A';

  const getScoreColor = (score) => {
    if (score === 0) return 'text-gray-400';
    if (score >= 85) return 'text-green-600 font-medium';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatScore = (value) => {
    return value > 0 ? `${value.toFixed(1)}%` : 'N/A';
  };

  return (
    <div className="space-y-2">
      {/* Overall Score */}
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
        <div className="flex items-center">
          <UserCheck className="h-4 w-4 mr-2 text-primary" />
          <span className="font-medium">Overall Score</span>
        </div>
        <span className={`text-base font-semibold ${getScoreColor(overallAverage)}`}>
          {overallAverage}%
        </span>
      </div>

      {/* Individual Scores */}
      <div className="space-y-1.5">
        {Object.entries(scores).map(([key, { value, label, icon }]) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              {icon}
              <span>{label}:</span>
            </div>
            <span className={getScoreColor(value)}>
              {formatScore(value)}
            </span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center text-xs text-muted-foreground cursor-help pt-1">
              <Info className="h-3 w-3 mr-1" />
              <span>Score Breakdown</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">
              <strong>Score Ranges:</strong><br />
              • 85-100%: Excellent<br />
              • 70-84%: Good<br />
              • 50-69%: Needs Improvement<br />
              • Below 50%: Critical
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default Score;