import React from 'react'
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
const Overview = ({filteredEvaluations, stats}) => {
  return (
    <div>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Card>
                   <CardHeader>
                     <CardTitle>Score Distribution</CardTitle>
                   </CardHeader>
                   <CardContent className="h-80">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart
                         data={filteredEvaluations}
                         margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                       >
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="title" />
                         <YAxis />
                         <Tooltip />
                         <Legend />
                         <Bar
                           dataKey="averageScore"
                           name="Average Score"
                           fill="#8884d8"
                         />
                       </BarChart>
                     </ResponsiveContainer>
                   </CardContent>
                 </Card>
     
                 <Card>
                   <CardHeader>
                     <CardTitle>Response Rate</CardTitle>
                   </CardHeader>
                   <CardContent className="h-80">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie
                           data={[
                             { name: "Completed", value: stats.completionRate },
                             { name: "Pending", value: 100 - stats.completionRate },
                           ]}
                           cx="50%"
                           cy="50%"
                           labelLine={false}
                           outerRadius={80}
                           fill="#8884d8"
                           dataKey="value"
                           label={({ name, percent }) =>
                             `${name}: ${(percent * 100).toFixed(0)}%`
                           }
                         >
                           <Cell fill="#0088FE" />
                           <Cell fill="#FF8042" />
                         </Pie>
                         <Tooltip />
                         <Legend />
                       </PieChart>
                     </ResponsiveContainer>
                   </CardContent>
                 </Card>
               </div> 
    </div>
  )
}

export default Overview