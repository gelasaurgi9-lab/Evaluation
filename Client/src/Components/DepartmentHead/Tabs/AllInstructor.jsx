import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/Components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import Score from "../Score";
import { useDispatch } from "react-redux";
import { fetchResponsesById, selectResponses } from "@/Store/EvaluationSlice";
import { useSelector } from "react-redux";
import Switch from "./Switch/Switch";
import { fetchAllUsers, updateInstructrStatus } from "@/Store/UsersDataSlice";
import { toast } from "sonner";

const AllInstructor = ({ user, departmentInstructors, evaluations }) => {
  const dispatch = useDispatch();
  const responses = useSelector(selectResponses);
  const [loading, setLoading] = useState(true);
  console.log(responses);
  // Fetch response documents when component mounts
  useEffect(() => {
    const fetchResponseDocuments = async () => {
      // Only fetch if we have evaluations and no responses yet
      if (!evaluations || evaluations.length === 0 || responses.length > 0) {
        setLoading(false);
        return;
      }

      const allResponseIds = [];

      // Collect all response IDs from evaluations
      evaluations.forEach((evalItem) => {
        if (evalItem.responses && Array.isArray(evalItem.responses)) {
          allResponseIds.push(...evalItem.responses);
        }
      });

      if (allResponseIds.length > 0) {
        try {
          // Fetch all responses at once using bulk endpoint
          await dispatch(fetchResponsesById(allResponseIds));
        } catch (error) {
          console.error("Error fetching response documents:", error);
        }
      }
      setLoading(false);
    };

    fetchResponseDocuments();
  }, [evaluations, dispatch, responses.length]);

 const handleStatusToggle = async (evaluationId, isActive) => {
    try {
      await dispatch(
        updateInstructrStatus({
          id: evaluationId,
          status: isActive,
        })
      ).unwrap();
      toast.success("Instructor verification status updated successfully");
      // This will trigger a re-fetch of evaluations
      await dispatch(fetchAllUsers()).unwrap();
    } catch (error) {
      toast.error(error.message || "Failed to update verification status");
    }
  };


  // Debug: Show all instructor IDs from responses
  const responseInstructorIds =
    responses?.map((r) => r.instructor).filter(Boolean) || [];
  const departmentInstructorIds =
    departmentInstructors?.map((i) => i._id) || [];
  const calculateScores = (instructorEvals) => {
    const evaluatorScores = {
      student: 0,
      self: 0,
      staff: 0,
      supervisor: 0,
    };

    const counts = {
      student: 0,
      self: 0,
      staff: 0,
      supervisor: 0,
    };

    instructorEvals.forEach((evalItem) => {
      // Since responses is an object with IDs, we need to handle it differently
      // The actual response data would need to be fetched from the evaluation response collection
      // For now, we'll use the evaluation's averageScore if available
      const avgScore = evalItem.averageScore || 0;

      // Map evaluation category to score types
      const categoryMap = {
        Student: "student",
        Self_Evaluation: "self",
        College_Team: "staff",
        Immediate_Supervisior: "supervisor",
      };

      const scoreType = categoryMap[evalItem.category];
      if (scoreType) {
        evaluatorScores[scoreType] += avgScore;
        counts[scoreType]++;
      }
    });

    // Calculate averages
    Object.keys(evaluatorScores).forEach((key) => {
      if (counts[key] > 0) {
        evaluatorScores[key] /= counts[key];
      }
    });

    return evaluatorScores;
  };

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">
            Loading evaluation data...
          </div>
        </div>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              Instructors in {user?.department || "Your Department"}
            </CardTitle>
            <CardDescription>
              List of all instructors in your department with their evaluation
              statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Evaluations</TableHead>
                  <TableHead>Avg. Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentInstructors?.length > 0 ? (
                  departmentInstructors.map((instructor) => {
                    const instructorEvals =
                      evaluations?.filter((evalItem) => {
                        // Find responses for this evaluation from Redux state
                        const evalResponses =
                          responses?.filter(
                            (response) => response.evaluation === evalItem._id
                          ) || [];

                        // Check if any response document belongs to this instructor
                        return evalResponses.some((responseDoc) => {
                          if (!responseDoc) return false;

                          // Get instructor ID from response document with multiple fallbacks
                          const responseInstructorId =
                            responseDoc.instructor?._id ||
                            responseDoc.instructor ||
                            responseDoc.instructorId ||
                            responseDoc.evaluatedInstructor ||
                            responseDoc.evaluatedInstructor?._id;

                          return (
                            String(responseInstructorId) ===
                            String(instructor._id)
                          );
                        });
                      }) || [];

                    const hasEvaluations = instructorEvals.length > 0;
                    const evaluatorScores = hasEvaluations
                      ? calculateScores(instructorEvals)
                      : {};

                    return (
                      <TableRow key={instructor._id}>
                        <TableCell className="font-medium">
                          {instructor.fullName?.trim()}
                        </TableCell>
                        <TableCell>{instructor.email || "N/A"}</TableCell>
                        <TableCell>{instructorEvals.length}</TableCell>
                        <TableCell>
                          <Score
                            evaluatorScores={evaluatorScores}
                            hasEvaluations={hasEvaluations}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={instructor.isVerified ? "default" : "secondary"}
                            className={instructor.isVerified ? "bg-green-500" : "bg-gray-300"}
                          >
                            {instructor.isVerified ? "verified" : "not verified"}
                            <Switch
                              id={instructor._id}
                              checked={instructor.isVerified}
                              onChange={(isActive) =>
                                handleStatusToggle(instructor._id, isActive)
                              }
                            />
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No instructors found in your department
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AllInstructor;
