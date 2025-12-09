import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';

const DownloadReport = ({ data = [], title = "User Report", fileName = "report.pdf" }) => {
    const handleDownload = () => {
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(18);
        doc.text(title, 14, 22);

        // Add date
        doc.setFontSize(11);
        doc.setTextColor(100);
        const date = new Date().toLocaleDateString();
        doc.text(`Date: ${date}`, 14, 30);

        // Define table columns and rows
        const tableColumn = ["Name", "Username", "Role", "Email"];
        const tableRows = [];

        if (!data || !Array.isArray(data)) {
            console.error("No data available for report");
            return;
        }

        data.forEach(user => {
            const userData = [
                user.fullName || "N/A",
                user.username || "N/A",
                user.role || "N/A",
                user.email || "N/A",
            ];
            tableRows.push(userData);
        });

        // Generate table using autoTable as a function
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
        });

        // Save the PDF
        doc.save(fileName);
    };

    return (
        <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
            title="Download PDF Report"
        >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
        </button>
    );
};

export default DownloadReport;
