import React, { useRef, forwardRef } from 'react'
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

const Overview = ({ filteredEvaluations = [], stats = {}, chartRefs = [] }) => {
  // Check if we have data to render
  const hasData = filteredEvaluations?.length > 0 && stats?.completionRate !== undefined;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Score Distribution Chart */}
        <Card className="w-full" ref={chartRefs[0]}>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] w-full relative">
            <div className="w-full h-full">
              {!hasData ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart
                    data={filteredEvaluations}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="averageScore"
                      name="Average Score"
                      fill="#12693a"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Response Rate Chart */}
        <Card className="w-full" ref={chartRefs[1]}>
          <CardHeader>
            <CardTitle>Response Rate</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] w-full relative">
            <div className="w-full h-full">
              {!hasData ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Completed", value: stats.completionRate },
                        { name: "Pending", value: 100 - (stats.completionRate || 0) },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#12693a"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      <Cell fill="#0088FE" />
                      <Cell fill="#FF8042" />
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Overview