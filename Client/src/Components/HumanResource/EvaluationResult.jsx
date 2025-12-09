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
import Score from '../DepartmentHead/Score';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import Search_Categorize_by_dep from './Search_Categorize_by_dep';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
import { useDispatch, useSelector } from "react-redux";
import { fetchEvaluations, fetchResponsesById, selectResponses } from "@/Store/EvaluationSlice";
import { useEffect, useState } from "react";
import { fetchAllUsers } from "@/Store/UsersDataSlice";
import DownloadFile from "./DownloadFile";
const EvaluationResult = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { users, isLoading: usersLoading } = useSelector((state) => state.usersData);
    const { evaluations, status } = useSelector((state) => state.evaluations);
    const responses = useSelector(selectResponses);

    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const [loading, setLoading] = useState(true);

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    // Fetch data on mount
    useEffect(() => {
        if (!users || users.length === 0) {
            dispatch(fetchAllUsers());
        }
        if (status === 'idle') {
            dispatch(fetchEvaluations());
        }
    }, [dispatch, users, status]);

    // Fetch response documents when evaluations are loaded
    useEffect(() => {
        const fetchResponseDocuments = async () => {
            if (!evaluations || evaluations.length === 0 || responses.length > 0) {
                setLoading(false);
                return;
            }

            const allResponseIds = [];
            evaluations.forEach((evalItem) => {
                if (evalItem.responses && Array.isArray(evalItem.responses)) {
                    allResponseIds.push(...evalItem.responses);
                }
            });

            if (allResponseIds.length > 0) {
                try {
                    await dispatch(fetchResponsesById(allResponseIds));
                } catch (error) {
                    console.error("Error fetching response documents:", error);
                }
            }
            setLoading(false);
        };

        fetchResponseDocuments();
    }, [evaluations, dispatch, responses.length]);

    // Get unique departments for filter dropdown
    const uniqueDepartments = [...new Set(
        users?.filter(u => u.role === 'instructor' && u.department)
            .map(u => u.department) || []
    )];

    // Get instructors from the college dean's department with filters applied
    const departmentInstructors = users?.filter((u) => {
        // Base filter: must be instructor
        if (u.role !== 'instructor') return false;

        // Search filter: by name
        if (searchTerm && !u.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // Department filter
        if (selectedDepartment !== 'all' && u.department !== selectedDepartment) {
            return false;
        }

        // Verification status filter
        if (selectedStatus === 'verified' && !u.isVerified) {
            return false;
        }
        if (selectedStatus === 'not-verified' && u.isVerified) {
            return false;
        }

        return true;
    }) || [];


    // Calculate scores for an instructor
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
            const avgScore = evalItem.averageScore || 0;

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

        Object.keys(evaluatorScores).forEach((key) => {
            if (counts[key] > 0) {
                evaluatorScores[key] /= counts[key];
            }
        });

        return evaluatorScores;
    };

    // Get evaluations for a specific instructor
    const getInstructorEvaluations = (instructorId) => {
        return evaluations?.filter((evalItem) => {
            const evalResponses = responses?.filter(
                (response) => response.evaluation === evalItem._id
            ) || [];

            return evalResponses.some((responseDoc) => {
                if (!responseDoc) return false;

                const responseInstructorId =
                    responseDoc.instructor?._id ||
                    responseDoc.instructor ||
                    responseDoc.instructorId ||
                    responseDoc.evaluatedInstructor ||
                    responseDoc.evaluatedInstructor?._id;

                return String(responseInstructorId) === String(instructorId);
            });
        }) || [];
    };

    // Calculate detailed statistics for selected instructor
    const getDetailedStats = (instructorEvals) => {
        const scoreByCriteria = instructorEvals.flatMap(
            (evalItem) =>
                evalItem.criteria?.map((criterion) => ({
                    name: criterion.category,
                    score: criterion.averageScore || 0,
                    weight: criterion.weight || 0,
                })) || []
        );

        const scoreByCategory = {};
        instructorEvals.forEach((evalItem) => {
            const category = evalItem.category || 'Unknown';
            if (!scoreByCategory[category]) {
                scoreByCategory[category] = {
                    name: category,
                    score: 0,
                    count: 0,
                };
            }
            scoreByCategory[category].score += evalItem.averageScore || 0;
            scoreByCategory[category].count += 1;
        });

        const categoryData = Object.values(scoreByCategory).map((cat) => ({
            name: cat.name,
            score: cat.count > 0 ? (cat.score / cat.count).toFixed(2) : 0,
        }));

        return {
            scoreByCriteria,
            categoryData,
            totalEvaluations: instructorEvals.length,
            averageScore: instructorEvals.length > 0
                ? (instructorEvals.reduce((acc, e) => acc + (e.averageScore || 0), 0).toFixed(2))
                : 0,
        };
    };

    if (usersLoading || status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-2 w-32 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    // Render instructor details view
    if (selectedInstructor) {
        const instructorEvals = getInstructorEvaluations(selectedInstructor._id);
        const evaluatorScores = calculateScores(instructorEvals);
        const detailedStats = getDetailedStats(instructorEvals);

        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        onClick={() => setSelectedInstructor(null)}
                        variant="outline"
                        className="flex items-center gap-2 bg-(--three)"
                    >
                        <ArrowLeft size={16} />
                        Back to Instructors
                    </Button>
                    <h2 className="text-2xl font-bold">
                        {selectedInstructor.fullName} - Evaluation Results
                    </h2>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[16px]">
                    <Card className="bg-(--six) text-white ">
                        <CardHeader>
                            <CardTitle>Total Evaluations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{detailedStats.totalEvaluations}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-(--six) text-white">
                        <CardHeader>
                            <CardTitle>Average Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{detailedStats.averageScore}%</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-(--six) text-white">
                        <CardHeader>
                            <CardTitle>Email</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm">{selectedInstructor.email || 'N/A'}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Score Breakdown */}
                <Card className='text-[16px]'>
                    <CardHeader>
                        <CardTitle>Score Breakdown by Evaluator Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Score evaluatorScores={evaluatorScores} hasEvaluations={instructorEvals.length > 0} />
                    </CardContent>
                </Card>

                {/* Category Chart */}
                {detailedStats.categoryData.length > 0 && (
                    <Card className='text-[16px]'>
                        <CardHeader>
                            <CardTitle>Scores by Evaluation Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="90%" height={300}>
                                <BarChart data={detailedStats.categoryData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="score" fill="#115632" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}
                <DownloadFile
                    instructor={selectedInstructor}
                    evaluatorScores={evaluatorScores}
                    detailedStats={detailedStats}
                    instructorEvals={instructorEvals}
                />

            </div>
        );
    }

    // Render instructor list view
    return (
        <div className="p-6 bg-(--one)">
            <Card >

                <CardContent >
                    {/* Search and Filter Component */}
                    <Search_Categorize_by_dep
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        selectedDepartment={selectedDepartment}
                        setSelectedDepartment={setSelectedDepartment}
                        selectedStatus={selectedStatus}
                        setSelectedStatus={setSelectedStatus}
                        departments={uniqueDepartments}
                    />
                    <Table >
                        <TableHeader className='bg-(--three) text-white '>
                            <TableRow >
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Evaluations</TableHead>
                                <TableHead>Avg. Score</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody >
                            {departmentInstructors?.length > 0 ? (
                                departmentInstructors.map((instructor) => {
                                    const instructorEvals = getInstructorEvaluations(instructor._id);
                                    const hasEvaluations = instructorEvals.length > 0;
                                    const evaluatorScores = hasEvaluations
                                        ? calculateScores(instructorEvals)
                                        : {};

                                    return (
                                        <TableRow
                                            key={instructor._id}
                                            className="cursor-pointer hover:bg-gray-100"
                                            onClick={() => setSelectedInstructor(instructor)}
                                        >
                                            <TableCell className="font-medium text-blue-600 hover:underline">
                                                {instructor.fullName?.trim()}
                                            </TableCell>
                                            <TableCell>{instructor.email || 'N/A'}</TableCell>
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
        </div>
    );
};

export default EvaluationResult;
