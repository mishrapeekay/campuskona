import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export utility for generating Excel and PDF files
 */

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file (without extension)
 * @param {String} sheetName - Name of the worksheet
 */
export const exportToExcel = (data, filename = 'export', sheetName = 'Sheet1') => {
    try {
        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Auto-size columns
        const maxWidth = data.reduce((w, r) => Math.max(w, r.name ? r.name.length : 10), 10);
        worksheet['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: maxWidth }));

        // Generate file
        XLSX.writeFile(workbook, `${filename}.xlsx`);
        return true;
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        throw new Error('Failed to export to Excel');
    }
};

/**
 * Export data to PDF file
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions [{header: 'Name', dataKey: 'name'}]
 * @param {String} filename - Name of the file (without extension)
 * @param {String} title - Title for the PDF document
 */
export const exportToPDF = (data, columns, filename = 'export', title = 'Report') => {
    try {
        // Create PDF document
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(18);
        doc.text(title, 14, 22);

        // Add date
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

        // Generate table
        doc.autoTable({
            startY: 35,
            head: [columns.map(col => col.header)],
            body: data.map(row => columns.map(col => row[col.dataKey] || '-')),
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [59, 130, 246], // Blue
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250],
            },
        });

        // Save PDF
        doc.save(`${filename}.pdf`);
        return true;
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        throw new Error('Failed to export to PDF');
    }
};

/**
 * Export students data
 * @param {Array} students - Array of student objects
 * @param {String} format - 'excel' or 'pdf'
 */
export const exportStudents = (students, format = 'excel') => {
    const filename = `students_${new Date().toISOString().split('T')[0]}`;

    if (format === 'excel') {
        const data = students.map(student => ({
            'Admission No': student.admission_number,
            'Full Name': student.full_name,
            'Class': student.class_name,
            'Section': student.section_name,
            'Roll Number': student.roll_number,
            'Gender': student.gender,
            'Date of Birth': student.date_of_birth,
            'Email': student.email,
            'Phone': student.phone,
            'Status': student.admission_status,
        }));
        return exportToExcel(data, filename, 'Students');
    } else {
        const columns = [
            { header: 'Admission No', dataKey: 'admission_number' },
            { header: 'Full Name', dataKey: 'full_name' },
            { header: 'Class', dataKey: 'class_name' },
            { header: 'Section', dataKey: 'section_name' },
            { header: 'Roll No', dataKey: 'roll_number' },
            { header: 'Gender', dataKey: 'gender' },
            { header: 'Status', dataKey: 'admission_status' },
        ];
        return exportToPDF(students, columns, filename, 'Student List');
    }
};

/**
 * Export staff data
 * @param {Array} staff - Array of staff objects
 * @param {String} format - 'excel' or 'pdf'
 */
export const exportStaff = (staff, format = 'excel') => {
    const filename = `staff_${new Date().toISOString().split('T')[0]}`;

    if (format === 'excel') {
        const data = staff.map(member => ({
            'Employee ID': member.employee_id,
            'Full Name': member.full_name,
            'Department': member.department_name,
            'Designation': member.designation,
            'Email': member.email,
            'Phone': member.phone,
            'Employment Type': member.employment_type,
            'Status': member.status,
        }));
        return exportToExcel(data, filename, 'Staff');
    } else {
        const columns = [
            { header: 'Employee ID', dataKey: 'employee_id' },
            { header: 'Full Name', dataKey: 'full_name' },
            { header: 'Department', dataKey: 'department_name' },
            { header: 'Designation', dataKey: 'designation' },
            { header: 'Phone', dataKey: 'phone' },
            { header: 'Status', dataKey: 'status' },
        ];
        return exportToPDF(staff, columns, filename, 'Staff List');
    }
};

/**
 * Export attendance data
 * @param {Array} attendance - Array of attendance records
 * @param {String} format - 'excel' or 'pdf'
 * @param {Object} meta - Metadata (class, section, date)
 */
export const exportAttendance = (attendance, format = 'excel', meta = {}) => {
    const filename = `attendance_${meta.date || new Date().toISOString().split('T')[0]}`;

    if (format === 'excel') {
        const data = attendance.map(record => ({
            'Roll No': record.roll_number,
            'Student Name': record.student_name,
            'Status': record.status,
            'Remarks': record.remarks || '',
        }));
        return exportToExcel(data, filename, 'Attendance');
    } else {
        const columns = [
            { header: 'Roll No', dataKey: 'roll_number' },
            { header: 'Student Name', dataKey: 'student_name' },
            { header: 'Status', dataKey: 'status' },
            { header: 'Remarks', dataKey: 'remarks' },
        ];
        const title = `Attendance Report - ${meta.class_name} ${meta.section_name} (${meta.date})`;
        return exportToPDF(attendance, columns, filename, title);
    }
};

/**
 * Print current page
 * Opens browser print dialog
 */
export const printPage = () => {
    window.print();
};

/**
 * Print specific element
 * @param {String} elementId - ID of the element to print
 */
export const printElement = (elementId) => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error('Element not found');
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f3f4f6; font-weight: bold; }
        h1 { color: #1f2937; margin-bottom: 20px; }
        .print-hide { display: none; }
        @media print {
            .no-print { display: none; }
        }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(element.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
};

export default {
    exportToExcel,
    exportToPDF,
    exportStudents,
    exportStaff,
    exportAttendance,
    printPage,
    printElement,
};
