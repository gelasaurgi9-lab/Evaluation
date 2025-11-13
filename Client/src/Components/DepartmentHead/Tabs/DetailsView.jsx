import React from "react";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
const DetailsView = ({ filteredEvaluations }) => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Detailed Evaluation Results</CardTitle>
          <CardDescription>
            Comprehensive view of all evaluation data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Avg. Score</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvaluations.length > 0 ? (
                filteredEvaluations.map((evalItem) => (
                  <TableRow key={evalItem._id}>
                    <TableCell className="font-medium">
                      {evalItem.title}
                    </TableCell>

                    <TableCell>{evalItem.academicYear}</TableCell>
                    <TableCell>
                      {evalItem.averageScore?.toFixed(1) || "N/A"}
                    </TableCell>
                    <TableCell>{evalItem.responseCount || 0}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          evalItem.status === "active" ? "default" : "secondary"
                        }
                      >
                        {evalItem.status?.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No evaluations found matching the selected criteria.
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

export default DetailsView;
