import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';

const DownlodResult = ({ responses = [], user = {} }) => {

  // Calculate average scores by evaluator type (same logic as parent)
  const calculateAverageByType = (responses, evaluatorType) => {
    const filteredResponses = responses.filter(response => {
      const categoryMap = {
        'Student': 'Student',
        'Self_Evaluation': 'Self',
        'Immediate_Supervisior': 'Immediate Supervisor',
        'College_Team': 'Staff'
      };
      const evaluatorTypeFromCategory = categoryMap[response.evaluation?.category] || 'Unknown';
      return evaluatorTypeFromCategory === evaluatorType;
    });

    if (filteredResponses.length === 0) return null;

    const allRatings = [];
    filteredResponses.forEach(response => {
      if (response.responses && Array.isArray(response.responses)) {
        response.responses.forEach(resp => {
          if (resp.rating) {
            allRatings.push(resp.rating);
          }
        });
      }
    });

    if (allRatings.length === 0) return null;

    const totalRating = allRatings.reduce((acc, rating) => acc + rating, 0);
    return {
      average: totalRating,
      count: filteredResponses.length
    };
  };

  const handleDownload = () => {
    if (!responses || responses.length === 0) {
      alert('No evaluation data available to download.');
      return;
    }

    try {
      const doc = new jsPDF();
      let yPosition = 20;

      // Add title
      doc.setFontSize(22);
      doc.setTextColor(18, 105, 58);
      doc.text('My Evaluation Results', 14, yPosition);
      yPosition += 12;

      // Add instructor info
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Instructor: ${user?.fullName || 'N/A'}`, 14, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, yPosition);
      yPosition += 15;

      // Calculate averages
      const studentAverage = calculateAverageByType(responses, 'Student');
      const supervisorAverage = calculateAverageByType(responses, 'Immediate Supervisor');
      const selfAverage = calculateAverageByType(responses, 'Self');
      const staffAverage = calculateAverageByType(responses, 'Staff');

      // Calculate total score
      const totalScore = (
        (studentAverage?.average || 0) +
        (supervisorAverage?.average || 0) +
        (selfAverage?.average || 0) +
        (staffAverage?.average || 0)
      );

      // Summary Statistics
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Evaluation Summary', 14, yPosition);
      yPosition += 10;

      const summaryData = [];

      if (studentAverage) {
        summaryData.push([
          'Student Evaluations',
          `${studentAverage.average.toFixed(1)} / 40%`,
          studentAverage.count,
          '40%'
        ]);
      }

      if (supervisorAverage) {
        summaryData.push([
          'Immediate Supervisor',
          `${supervisorAverage.average.toFixed(1)} / 20%`,
          supervisorAverage.count,
          '20%'
        ]);
      }

      if (selfAverage) {
        summaryData.push([
          'Self Evaluation',
          `${selfAverage.average.toFixed(1)} / 10%`,
          selfAverage.count,
          '10%'
        ]);
      }

      if (staffAverage) {
        summaryData.push([
          'Staff/Peer Evaluations',
          `${staffAverage.average.toFixed(1)} / 30%`,
          staffAverage.count,
          '30%'
        ]);
      }

      // Add summary table
      autoTable(doc, {
        startY: yPosition,
        head: [['Evaluator Type', 'Score', 'Evaluators', 'Weight']],
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [18, 105, 58], textColor: 255 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 60 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 }
        }
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Add total score
      doc.setFontSize(16);
      doc.setTextColor(18, 105, 58);
      doc.text(`Total Score: ${totalScore.toFixed(1)} / 100%`, 14, yPosition);
      yPosition += 15;

      // Detailed Responses
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Evaluation Details', 14, yPosition);
      yPosition += 5;

      const detailRows = [];
      responses.forEach((response, index) => {
        const category = response.evaluation?.category || 'N/A';
        const avgRating = response.responses?.reduce((sum, r) => sum + (r.rating || 0), 0) / (response.responses?.length || 1);

        detailRows.push([
          index + 1,
          category.replace(/_/g, ' '),
          response.evaluation?.title || 'N/A',
          avgRating.toFixed(1),
          response.responses?.length || 0
        ]);
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['#', 'Category', 'Evaluation', 'Avg Score', 'Responses']],
        body: detailRows,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [18, 105, 58], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

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
      }

      // Save PDF
      doc.save(`evaluation_results_${user?.fullName?.replace(/\s+/g, '_') || 'instructor'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Don't show button if no data
  if (!responses || responses.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex justify-end">
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm"
        title="Download My Evaluation Results as PDF"
      >
        <Download className="w-4 h-4" />
        <span>Download My Results</span>
      </button>
    </div>
  );
};

export default DownlodResult;