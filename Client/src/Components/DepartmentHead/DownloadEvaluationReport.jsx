import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';

const DownloadEvaluationReport = ({
    filteredEvaluations = [],
    stats = {},
    title = "Evaluation Report",
    fileName = "evaluation_report.pdf",
    chartRefs = [] // Array of refs to chart elements
}) => {

    const handleDownload = async () => {
        try {
            const doc = new jsPDF();
            let yPosition = 20;

            // Add title
            doc.setFontSize(20);
            doc.setTextColor(18, 105, 58); // Green color
            doc.text(title, 14, yPosition);
            yPosition += 10;

            // Add date
            doc.setFontSize(10);
            doc.setTextColor(100);
            const date = new Date().toLocaleDateString();
            doc.text(`Generated: ${date}`, 14, yPosition);
            yPosition += 15;

            // Add Statistics Summary
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Summary Statistics", 14, yPosition);
            yPosition += 10;

            // Create stats table
            const statsData = [
                ["Total Evaluations", stats.totalEvaluations || 0],
                ["Average Score", `${(stats.averageScore || 0).toFixed(1)}%`],
                ["Total Responses", stats.totalResponses || 0],
                ["Completion Rate", `${(stats.completionRate || 0).toFixed(1)}%`]
            ];

            autoTable(doc, {
                startY: yPosition,
                head: [['Metric', 'Value']],
                body: statsData,
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [18, 105, 58], textColor: 255 },
                columnStyles: {
                    0: { fontStyle: 'bold' }
                }
            });

            yPosition = doc.lastAutoTable.finalY + 15;

            // Add Evaluation Details Table
            if (filteredEvaluations && filteredEvaluations.length > 0) {
                // Check if we need a new page
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(14);
                doc.text("Evaluation Details", 14, yPosition);
                yPosition += 5;

                const evaluationData = filteredEvaluations.map(evalItem => [
                    evalItem.title || "N/A",
                    evalItem.academicYear || "N/A",
                    (evalItem.averageScore || 0).toFixed(1),
                    evalItem.responseCount || 0,
                    evalItem.status || "N/A"
                ]);

                autoTable(doc, {
                    startY: yPosition,
                    head: [['Title', 'Academic Year', 'Avg Score', 'Responses', 'Status']],
                    body: evaluationData,
                    theme: 'striped',
                    styles: { fontSize: 9, cellPadding: 3 },
                    headStyles: { fillColor: [18, 105, 58], textColor: 255 },
                    alternateRowStyles: { fillColor: [245, 245, 245] }
                });

                yPosition = doc.lastAutoTable.finalY + 15;
            }

            // Capture and add charts if refs are provided
            if (chartRefs && chartRefs.length > 0) {
                for (let i = 0; i < chartRefs.length; i++) {
                    const chartRef = chartRefs[i];

                    if (chartRef && chartRef.current) {
                        // Add new page for charts
                        doc.addPage();
                        yPosition = 20;

                        try {
                            // Convert chart to canvas
                            const canvas = await html2canvas(chartRef.current, {
                                backgroundColor: '#ffffff',
                                scale: 2,
                                logging: false
                            });

                            const imgData = canvas.toDataURL('image/png');
                            const imgWidth = 180;
                            const imgHeight = (canvas.height * imgWidth) / canvas.width;

                            // Add chart image
                            doc.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
                        } catch (error) {
                            console.error(`Error capturing chart ${i}:`, error);
                        }
                    }
                }
            }

            // Add footer to all pages
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
            }

            // Save the PDF
            doc.save(fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF report. Please try again.');
        }
    };

    return (
        <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm"
            title="Download Evaluation Report as PDF"
        >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
        </button>
    );
};

export default DownloadEvaluationReport;
