import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { CheckCircle, AlertCircle, User, Star, Loader2 } from 'lucide-react';
import { submitEvaluationResponse } from '@/Store/EvaluationSlice';
import { toast } from 'sonner';

const ImmediateSupervisorER = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.usersData);
  const { evaluations, status, submissionStatus } = useSelector((state) => state.evaluations);

  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState('');
  const [responses, setResponses] = useState({});
  const [additionalComments, setAdditionalComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Filter for instructors in the same department as the current user
  const departmentInstructors = users?.filter(
    (u) => u.role === 'instructor' && u.department === user?.department
  ) || [];

  // Get active evaluations for supervisor category
  const activeEvaluations = evaluations?.filter(
    (evalItem) => evalItem.status === 'active' && evalItem.category === 'Immediate_Supervisior'
  ) || [];

  // Initialize responses when evaluation changes
  useEffect(() => {
    if (selectedEvaluation && evaluations) {
      const evaluation = evaluations.find(e => e._id === selectedEvaluation);
      if (evaluation && evaluation.criteria) {
        const initialResponses = {};
        evaluation.criteria.forEach((criterion) => {
          initialResponses[criterion._id] = {
            criteriaId: criterion._id,
            rating: 0,
            comments: '',
          };
        });
        setResponses(initialResponses);
      }
    }
  }, [selectedEvaluation, evaluations]);

  // Check if supervisor has already submitted for this instructor
  const checkIfAlreadySubmitted = (instructorId, evaluationId) => {
    // This would typically check against existing responses
    // For now, we'll use a simple check - in real implementation, you'd check the database
    return false;
  };

  // Handle rating change for a question
  const handleRatingChange = (criteriaId, rating) => {
    setResponses(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        rating: parseInt(rating)
      }
    }));
  };

  // Handle text response change
  const handleTextResponseChange = (criteriaId, text) => {
    setResponses(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        comments: text
      }
    }));
  };

  // Calculate total score
  const totalScore = evaluations?.find(e => e._id === selectedEvaluation)?.criteria?.reduce((sum, criterion) => {
    const response = responses[criterion._id];
    const score = response?.rating || 0;
    // Calculate weighted contribution: (score/100) * weight
    const weightedScore = (score / 20) * 20;
    return sum += weightedScore;
  }, 0) || 0;

  // Submit evaluation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedInstructor || !selectedEvaluation) {
      setSubmitStatus({ type: 'error', message: 'Please select an instructor and evaluation' });
      return;
    }

    // Validate all criteria have been rated
    const allRated = Object.values(responses).every(response => response.rating > 0);

    if (!allRated) {
      setSubmitStatus({ type: 'error', message: 'Please rate all criteria before submitting' });
      return;
    }

    setIsSubmitting(true);

    try {
      const evaluationData = {
        id: selectedEvaluation,
        responses: Object.values(responses),
        overallComment: additionalComments,
        courseCode: '', // Not applicable for supervisor evaluation
        instructorId: selectedInstructor,
        evaluatorId: user._id,
        evaluatorType: 'Immediate_Supervisor'
      };

      const result = await dispatch(submitEvaluationResponse(evaluationData)).unwrap();

      if (result.success) {
        setSubmitStatus({ type: 'success', message: 'Evaluation submitted successfully!' });
        setHasSubmitted(true);
        toast.success('Evaluation submitted successfully!');

        // Reset form after successful submission
        setTimeout(() => {
          setSelectedInstructor('');
          setSelectedEvaluation('');
          setResponses({});
          setAdditionalComments('');
          setHasSubmitted(false);
          setSubmitStatus(null);
        }, 3000);
      } else {
        setSubmitStatus({ type: 'error', message: result.message || 'Failed to submit evaluation' });
        toast.error(result.message || 'Failed to submit evaluation');
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'An error occurred while submitting the evaluation' });
      toast.error('An error occurred while submitting the evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current evaluation details
  const currentEvaluation = evaluations?.find(e => e._id === selectedEvaluation);

  // Check if already submitted for current selection
  const alreadySubmitted = selectedInstructor && selectedEvaluation &&
    checkIfAlreadySubmitted(selectedInstructor, selectedEvaluation);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 pt-10">Immediate Supervisor Evaluation</h2>
        <p className="text-gray-600 mt-1">Provide evaluation feedback for instructors in your department</p>
      </div>

      {/* Status Alert */}
      {submitStatus && (
        <Alert className={submitStatus.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
          {submitStatus.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {submitStatus.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Selection Section */}
      <Card className='bg-(--six) text-white p-10'>
        <CardHeader>
          <CardTitle className="flex items-center  text-white">
            <User className="h-5 w-5 mr-2" />
            Evaluation Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="instructor-select" className="pb-5">Select Instructor</Label>
            <Select value={selectedInstructor} onValueChange={setSelectedInstructor} disabled={hasSubmitted}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an instructor to evaluate" />
              </SelectTrigger>
              <SelectContent>
                {departmentInstructors.map((instructor) => (
                  <SelectItem key={instructor._id} value={instructor._id}>
                    {instructor.fullName} - {instructor.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="evaluation-select" className="pb-5">Select Evaluation Period</Label>
            <Select value={selectedEvaluation} onValueChange={setSelectedEvaluation} disabled={hasSubmitted}>
              <SelectTrigger>
                <SelectValue placeholder="Choose evaluation period" />
              </SelectTrigger>
              <SelectContent>
                {activeEvaluations.map((evaluation) => (
                  <SelectItem key={evaluation._id} value={evaluation._id}>
                    {evaluation.title} - {evaluation.academicYear}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {alreadySubmitted && (
            <Alert className="border-yellow-500 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                You have already submitted an evaluation for this instructor in this period.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Evaluation Questions */}
      {currentEvaluation && !alreadySubmitted && (
        <Card className='bg-(--four) text-white'>
          <CardHeader>
            <CardTitle>Evaluation Criteria <span className='bg-white text-black  px-10'>{currentEvaluation?.criteria.length}</span> </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentEvaluation.criteria?.map((criterion, index) => (
              <div key={criterion._id} className="space-y-4 border-b pb-6 last:border-b-0">
                <div>
                  <h3 className="text-lg font-medium">
                    <span>{index + 1}.</span>
                    <span className="text-green-100"> {criterion.category}</span>
                  </h3>
                  <p className="text-sm text-gray-100 mt-1 flex justify-between">
                    <span>{criterion.description}</span>
                    <span className="text-blue-600 bg-gray-100 p-1 rounded-md">
                      {criterion.weight}%
                    </span>
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      max={criterion.weight}
                      min={0}
                      step="1"
                      className="p-2 text-xl bg-(--one) text-black border border-gray-300 rounded-lg w-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={responses[criterion._id]?.rating || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
                          handleRatingChange(criterion._id, value);
                        }
                      }}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const boundedValue = Math.min(Math.max(value, 0), 100);
                        if (value !== boundedValue) {
                          handleRatingChange(criterion._id, boundedValue);
                        }
                      }}
                      placeholder={`0-${criterion.weight}`}
                      required
                    />
                    <span className="text-lg">%</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Additional Comments */}
            <div className="space-y-2">
              <Label htmlFor="additional-comments" className="text-gray-200">
                Overall Comments
              </Label>
              <Textarea
                className="bg-gray-200"
                id="additional-comments"
                placeholder="Any additional feedback or comments about the instructor's performance..."
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                rows={4}
              />
            </div>

            {/* Total Score Display */}
            <div className="flex justify-between pt-6 border-t">
              <div className="bg-green-900 text-white px-6 py-2 rounded-lg text-lg">
                TOTAL SCORE: {totalScore.toFixed(1)}% / {currentEvaluation?.criteria?.reduce((sum, c) => sum + c.weight, 0) || 0}%
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      {currentEvaluation && !alreadySubmitted && (
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedInstructor || !selectedEvaluation}
            className="px-8 py-2 bg-green-600 hover:bg-green-700"
          >
            {isSubmitting || submissionStatus === 'submitting' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit Evaluation
              </>
            )}
          </Button>
        </div>
      )}

      {/* No Active Evaluations */}
      {activeEvaluations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Evaluations</h3>
            <p className="text-gray-600">
              There are currently no active evaluation periods for supervisor evaluations.
              Please check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImmediateSupervisorER;