import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { bulkUploadStaff } from '../../store/slices/staffSlice';
import { FormField } from '../../components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    Download,
    FileText,
    Upload,
    X,
    CheckCircle2,
    XCircle,
    Loader2,
} from 'lucide-react';

/**
 * Staff Bulk Upload Page - Upload multiple staff members via CSV/Excel
 */
const StaffBulkUpload = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState([]);
    const [success, setSuccess] = useState(false);
    const [uploadedCount, setUploadedCount] = useState(0);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validTypes = [
                'text/csv',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ];

            if (!validTypes.includes(selectedFile.type)) {
                alert('Please upload a valid CSV or Excel file');
                return;
            }

            setFile(selectedFile);
            setErrors([]);
            setSuccess(false);
        }
    };

    const handleDownloadTemplate = () => {
        const headers = [
            'first_name', 'middle_name', 'last_name', 'date_of_birth', 'gender',
            'blood_group', 'email', 'phone', 'password',
            'current_address_line1', 'current_address_line2', 'current_city',
            'current_state', 'current_pincode',
            'employee_id', 'joining_date', 'department', 'designation',
            'employment_type', 'highest_qualification', 'basic_salary',
        ];

        const sampleData = [
            'Priya', '', 'Sharma', '1990-05-20', 'F', 'B+',
            'priya.sharma@school.edu', '9876543210', 'StaffPass@123',
            '12 Park Avenue', 'Near City Mall', 'Gwalior',
            'Madhya Pradesh', '474001',
            'VV-EMP-0100', '2024-04-01', 'Academic', 'TEACHER',
            'PERMANENT', 'B.Ed', '35000',
        ];

        const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'staff_upload_template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file to upload');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setErrors([]);

        try {
            const result = await dispatch(bulkUploadStaff(file)).unwrap();

            setSuccess(true);
            setUploadedCount(result.success_count || 0);

            if (result.errors && result.errors.length > 0) {
                setErrors(result.errors);
            }

            if (!result.errors || result.errors.length === 0) {
                setTimeout(() => {
                    navigate('/staff');
                }, 3000);
            }
        } catch (error) {
            setErrors([{ row: 0, message: error.message || 'Upload failed' }]);
        } finally {
            setUploading(false);
            setUploadProgress(100);
        }
    };

    const handleReset = () => {
        setFile(null);
        setErrors([]);
        setSuccess(false);
        setUploadedCount(0);
        setUploadProgress(0);
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Bulk Upload Staff"
                    description="Upload multiple staff members at once using CSV or Excel file"
                    breadcrumbs={[
                        { label: 'Staff', href: '/staff' },
                        { label: 'Bulk Upload', active: true },
                    ]}
                />

                <div className="max-w-4xl space-y-6">
                    {/* Instructions Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-foreground mb-2">Step 1: Download Template</h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Download the CSV template file and fill in the staff information.
                                </p>
                                <Button variant="outline" onClick={handleDownloadTemplate}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Template
                                </Button>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-foreground mb-2">Step 2: Fill in Data</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Fill in all required fields (first_name, last_name, email, phone, joining_date, department, designation, employment_type)</li>
                                    <li>Use the correct date format: YYYY-MM-DD</li>
                                    <li>Gender: M (Male), F (Female), O (Other)</li>
                                    <li>Employment type: PERMANENT, CONTRACT, PART_TIME, PROBATION</li>
                                    <li>Designation: TEACHER, PRINCIPAL, LIBRARIAN, ACCOUNTANT, etc.</li>
                                    <li>Do not modify the header row</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-foreground mb-2">Step 3: Upload File</h4>
                                <p className="text-sm text-muted-foreground">
                                    Upload the completed CSV or Excel file using the form below.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upload Form Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload File</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                label="Select File"
                                name="file"
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileChange}
                                helperText="Supported formats: CSV, Excel (.xlsx, .xls)"
                            />

                            {file && (
                                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <FileText className="h-8 w-8 text-primary mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(file.size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={handleReset}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {uploading && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Uploading...</span>
                                        <span className="text-muted-foreground">{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <div className="flex">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-green-800">
                                                Upload Successful!
                                            </h3>
                                            <p className="mt-1 text-sm text-green-700">
                                                {uploadedCount} staff member{uploadedCount !== 1 ? 's' : ''} uploaded successfully.
                                                {errors.length === 0 && ' Redirecting to staff list...'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {errors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex">
                                        <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                                        <div className="ml-3 flex-1">
                                            <h3 className="text-sm font-medium text-red-800">
                                                Upload Errors ({errors.length})
                                            </h3>
                                            <div className="mt-2 text-sm text-red-700">
                                                <ul className="list-disc list-inside space-y-1">
                                                    {errors.slice(0, 10).map((error, index) => (
                                                        <li key={index}>
                                                            {error.row ? `Row ${error.row}: ` : ''}{error.message}
                                                        </li>
                                                    ))}
                                                    {errors.length > 10 && (
                                                        <li className="font-medium">
                                                            ... and {errors.length - 10} more errors
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => navigate('/staff')}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpload} disabled={!file || uploading}>
                                    {uploading ? (
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                        <Upload className="h-4 w-4 mr-1" />
                                    )}
                                    Upload Staff
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tips Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tips for Successful Upload</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                                <li>Ensure all required fields are filled</li>
                                <li>Check for duplicate employee IDs or email addresses</li>
                                <li>Verify date formats (YYYY-MM-DD)</li>
                                <li>Use valid email addresses — each becomes the staff login</li>
                                <li>Phone numbers should be 10 digits</li>
                                <li>Salary should be a number (e.g. 35000)</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default StaffBulkUpload;
