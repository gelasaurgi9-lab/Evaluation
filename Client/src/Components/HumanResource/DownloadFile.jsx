import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';

const DownloadFile = ({ instructor, evaluatorScores, detailedStats, instructorEvals }) => {

    const handleDownload = () => {
        if (!instructor) {
            alert('No instructor data available to download.');
            return;
        }

        try {
            const doc = new jsPDF();
            let yPosition = 20;

            // Add title
            doc.setFontSize(22);
            doc.setTextColor(18, 105, 58);
            doc.text('Instructor Evaluation Report', 14, yPosition);
            yPosition += 12;

            // Add instructor info
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text(`Instructor: ${instructor?.fullName || 'N/A'}`, 14, yPosition);
            yPosition += 8;
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Email: ${instructor?.email || 'N/A'}`, 14, yPosition);
            yPosition += 6;
            doc.text(`Department: ${instructor?.department || 'N/A'}`, 14, yPosition);
            yPosition += 6;
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, yPosition);
            yPosition += 15;

            // Summary Statistics
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Evaluation Summary', 14, yPosition);
            yPosition += 10;

            const summaryData = [
                ['Total Evaluations', detailedStats?.totalEvaluations || 0],
                ['Average Score', `${detailedStats?.averageScore || 0}%`],
                ['Status', instructor?.isVerified ? 'Verified' : 'Not Verified']
            ];

            autoTable(doc, {
                startY: yPosition,
                head: [['Metric', 'Value']],
                body: summaryData,
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 3 },
                headStyles: { fillColor: [18, 105, 58], textColor: 255 },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 80 },
                    1: { cellWidth: 80 }
                }
            });

            yPosition = doc.lastAutoTable.finalY + 15;

            // Score Breakdown by Evaluator Type
            if (evaluatorScores && Object.keys(evaluatorScores).length > 0) {
                if (yPosition > 240) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(14);
                doc.setTextColor(0);
                doc.text('Score Breakdown by Evaluator Type', 14, yPosition);
                yPosition += 10;

                const scoreData = [];

                if (evaluatorScores.student > 0) {
                    scoreData.push(['Student', `${evaluatorScores.student.toFixed(1)}%`, '40% Weight']);
                }
                if (evaluatorScores.supervisor > 0) {
                    scoreData.push(['Supervisor', `${evaluatorScores.supervisor.toFixed(1)}%`, '20% Weight']);
                }
                if (evaluatorScores.self > 0) {
                    scoreData.push(['Self', `${evaluatorScores.self.toFixed(1)}%`, '10% Weight']);
                }
                if (evaluatorScores.staff > 0) {
                    scoreData.push(['Staff', `${evaluatorScores.staff.toFixed(1)}%`, '30% Weight']);
                }

                if (scoreData.length > 0) {
                    autoTable(doc, {
                        startY: yPosition,
                        head: [['Evaluator Type', 'Score', 'Weight']],
                        body: scoreData,
                        theme: 'striped',
                        styles: { fontSize: 10, cellPadding: 3 },
                        headStyles: { fillColor: [18, 105, 58], textColor: 255 },
                        alternateRowStyles: { fillColor: [245, 245, 245] }
                    });

                    yPosition = doc.lastAutoTable.finalY + 15;
                }
            }

            // Category Scores
            if (detailedStats?.categoryData && detailedStats.categoryData.length > 0) {
                if (yPosition > 220) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(14);
                doc.setTextColor(0);
                doc.text('Scores by Evaluation Category', 14, yPosition);
                yPosition += 10;

                const categoryRows = detailedStats.categoryData.map(cat => [
                    cat.name.replace(/_/g, ' '),
                    `${cat.score}%`
                ]);

                autoTable(doc, {
                    startY: yPosition,
                    head: [['Category', 'Average Score']],
                    body: categoryRows,
                    theme: 'grid',
                    styles: { fontSize: 10, cellPadding: 3 },
                    headStyles: { fillColor: [18, 105, 58], textColor: 255 }
                });

                yPosition = doc.lastAutoTable.finalY + 15;
            }

            // Detailed Evaluations
            if (instructorEvals && instructorEvals.length > 0) {
                if (yPosition > 220) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(14);
                doc.setTextColor(0);
                doc.text('Evaluation Details', 14, yPosition);
                yPosition += 10;

                const evalRows = instructorEvals.map((evalItem, index) => [
                    index + 1,
                    evalItem.title || 'N/A',
                    (evalItem.category || 'N/A').replace(/_/g, ' '),
                    `${evalItem.averageScore?.toFixed(1) || 0}%`,
                    evalItem.status || 'N/A'
                ]);

                autoTable(doc, {
                    startY: yPosition,
                    head: [['#', 'Evaluation', 'Category', 'Score', 'Status']],
                    body: evalRows,
                    theme: 'striped',
                    styles: { fontSize: 9, cellPadding: 2 },
                    headStyles: { fillColor: [18, 105, 58], textColor: 255 },
                    alternateRowStyles: { fillColor: [245, 245, 245] },
                    columnStyles: {
                        0: { cellWidth: 10 },
                        1: { cellWidth: 60 },
                        2: { cellWidth: 40 },
                        3: { cellWidth: 25 },
                        4: { cellWidth: 25 }
                    }
                });
            }

            // Add footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
                doc.text(
                    'Human Resources - Evaluation Report',
                    14,
                    doc.internal.pageSize.getHeight() - 10
                );
            }

            // Save PDF
            doc.save(`evaluation_report_${instructor?.fullName?.replace(/\s+/g, '_') || 'instructor'}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    // Don't show button if no data
    if (!instructor) {
        return null;
    }

    return (
        <div className="mt-6 flex justify-end">
            <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 text-[16px] bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm"
                title="Download Evaluation Report as PDF"
            >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
            </button>
        </div>
    );
};

export default DownloadFile;