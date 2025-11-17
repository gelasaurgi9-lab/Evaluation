import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Overview from './Tabs/Overview' 
import DetailsView from './Tabs/DetailsView' 

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
  LineChart,
  Line,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/Components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { fetchEvaluations } from "@/Store/EvaluationSlice";
import { format } from "date-fns";
import Score from "./Score";
import AllInstructor from "./Tabs/AllInstructor";
import ExportingFile from "./Tabs/ExportingFile";
import ImmediateSupervisorER from "./immediate_Supervisor_ER";
import { List } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const ViewEvaluationResult = () => {
  
  const dispatch = useDispatch();
  const { evaluations, status, error } = useSelector(
    (state) => state.evaluations
  );
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.usersData);
  const [selectedEvaluation, setSelectedEvaluation] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchEvaluations());
    }
  }, [status, dispatch]);

  // Get unique academic years for filter
  const academicYears = [
    ...new Set(evaluations.map((evalItem) => evalItem.academicYear)),
  ];

  // Get instructors from the same department
  const departmentInstructors =
    users?.filter(
      (user) =>
        user.role === "instructor" && user.department === user.department
    ) || [];
  


  // Filter evaluations based on selections
  const filteredEvaluations = evaluations.filter((evalItem) => {
    const matchesEvaluation =
      selectedEvaluation === "all" ||
      !selectedEvaluation ||
      evalItem._id === selectedEvaluation;

    // If an instructor is selected, check if they are in the evaluation
    const matchesInstructor =
      selectedInstructor === "all" ||
      evalItem.instructor?.some(
        (instructor) => instructor.id === selectedInstructor
      );

    // Check if the evaluation is for an instructor in the same department
    const isInDepartment =
      !evalItem.instructor ||
      evalItem.instructor.some((instructor) =>
        departmentInstructors.some(
          (deptInstructor) => deptInstructor._id === instructor.id
        )
      );

    return matchesEvaluation && matchesInstructor && isInDepartment;
  });
  // Calculate statistics
  const stats = {
    totalEvaluations: filteredEvaluations.length,
    averageScore:
      filteredEvaluations.reduce(
        (acc, curr) => acc + (curr.averageScore || 0),
        0
      ) / (filteredEvaluations.length || 1),
    totalResponses: filteredEvaluations.reduce(
      (acc, curr) => acc + (curr.responseCount || 0),
      0
    ),
    completionRate:
      (filteredEvaluations.filter((e) => e.status === "completed").length /
        (filteredEvaluations.length || 1)) *
      100,
  };

  // Prepare data for charts
  const scoreByInstructor = filteredEvaluations.flatMap(
    (evalItem) =>
      evalItem.instructors?.map((instructor) => ({
        name: instructor.fullName,
        score: instructor.averageScore || 0,
        responses: instructor.responseCount || 0,
      })) || []
  );

  const scoreByCriteria = filteredEvaluations.flatMap(
    (evalItem) =>
      evalItem.criteria?.map((criterion) => ({
        name: criterion.category,
        score: criterion.averageScore || 0,
        weight: criterion.weight || 0,
      })) || []
  );

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">

        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error ||
                "Failed to load evaluation results. Please try again later."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Evaluation
          </label>
          <Select
            onValueChange={setSelectedEvaluation}
            value={selectedEvaluation}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Evaluations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Evaluations</SelectItem>
              {evaluations.map((evalItem) => (
                <SelectItem key={evalItem._id} value={evalItem._id}>
                  {evalItem.title} - {evalItem.academicYear}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year
          </label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {academicYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-(--six) text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Evaluations start from 2025
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvaluations}</div>
            <p className="text-xs text-muted-foreground">
              {filteredEvaluations.length} match current filters
            </p>
          </CardContent>
        </Card>

        <Card className="bg-(--six) text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
    
            <div className="text-2xl font-bold">
              {stats.averageScore.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-300">Across all evaluations</p>
          </CardContent>
        </Card>

        <Card className="bg-(--six) text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Responses
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-gray-300"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
 
            <div className="text-2xl font-bold">{stats.totalResponses}</div>

            <p className="text-xs text-muted-foreground">
              {stats.completionRate.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card
          className={`${
            filteredEvaluations[0]?.status === "active"
              ? "bg-green-500"
              : "bg-red-200"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-gray-300"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEvaluations.length > 0 ? (
                <Badge
                  variant={
                    filteredEvaluations[0].status === "active"
                      ? "default"
                      : "secondary"
                  }
                >
                  {filteredEvaluations[0].status?.toUpperCase()}
                </Badge>
              ) : (
                "N/A"
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Current evaluation status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs
        defaultValue="overview"
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className='bg-(--two)'>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="instructors">By Instructor</TabsTrigger>
          <TabsTrigger value="criteria">By Criteria</TabsTrigger>
          <TabsTrigger value="details">Detailed View</TabsTrigger>
          <TabsTrigger value="All Instructor in my Department">
            All Instructor in my Department
          </TabsTrigger>
          <TabsTrigger value="immediate Supervisor" className='bg-green-600 ml-10 text-(--six) cursor-pointer'><List/> immediate Supervisor</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Overview filteredEvaluations={filteredEvaluations} stats={stats}/>
        </TabsContent>

        <TabsContent value="instructors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Instructor</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={scoreByInstructor}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" name="Average Score" fill="#82ca9d">
                    {scoreByInstructor.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="criteria" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Criteria</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={scoreByCriteria}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Average Score"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <DetailsView filteredEvaluations={filteredEvaluations}/> 
        </TabsContent>
     

        <TabsContent value="All Instructor in my Department">
       <AllInstructor users={users} departmentInstructors={departmentInstructors} evaluations={evaluations}/>
      
        </TabsContent>

           <TabsContent value="immediate Supervisor" >
         <ImmediateSupervisorER users={users} evaluations={evaluations} />
        </TabsContent>
      </Tabs>

      {/* Export and Action Buttons */}
     <ExportingFile/>
    </div>
  );
};

export default ViewEvaluationResult;
