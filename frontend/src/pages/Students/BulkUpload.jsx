import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { bulkUploadStudents } from '../../store/slices/studentsSlice';
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
 * Bulk Upload Page - Upload multiple students via CSV/Excel
 */
const BulkUpload = () => {
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
            'blood_group', 'email', 'phone', 'address_line1', 'city', 'state',
            'pincode', 'admission_date', 'class', 'section', 'board',
        ];

        const sampleData = [
            'John', 'M', 'Doe', '2010-01-15', 'M', 'A+', 'john.doe@example.com',
            '9876543210', '123 Main Street', 'Mumbai', 'Maharashtra', '400001',
            '2024-04-01', '5', 'A', 'CBSE',
        ];

        const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'student_upload_template.csv';
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
            const result = await dispatch(bulkUploadStudents(file)).unwrap();

            setSuccess(true);
            setUploadedCount(result.success_count || 0);

            if (result.errors && result.errors.length > 0) {
                setErrors(result.errors);
            }

            if (result.errors.length === 0) {
                setTimeout(() => {
                    navigate('/students');
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
                    title="Bulk Upload Students"
                    description="Upload multiple students at once using CSV or Excel file"
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
                                    Download the CSV template file and fill in the student information.
                                </p>
                                <Button variant="outline" onClick={handleDownloadTemplate}>
                                    <Download />
                                    Download Template
                                </Button>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-foreground mb-2">Step 2: Fill in Data</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Fill in all required fields (marked with *)</li>
                                    <li>Use the correct date format: YYYY-MM-DD</li>
                                    <li>Gender: M (Male), F (Female), O (Other)</li>
                                    <li>Board: CBSE, ICSE, or MPBSE</li>
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
                                <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                                    <div className="flex">
                                        <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-success">
                                                Upload Successful!
                                            </h3>
                                            <p className="mt-1 text-sm text-success/80">
                                                {uploadedCount} student{uploadedCount > 1 ? 's' : ''} uploaded successfully.
                                                {errors.length === 0 && ' Redirecting to students list...'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {errors.length > 0 && (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                                    <div className="flex">
                                        <XCircle className="h-5 w-5 text-destructive shrink-0" />
                                        <div className="ml-3 flex-1">
                                            <h3 className="text-sm font-medium text-destructive">
                                                Upload Errors ({errors.length})
                                            </h3>
                                            <div className="mt-2 text-sm text-destructive/80">
                                                <ul className="list-disc list-inside space-y-1">
                                                    {errors.slice(0, 10).map((error, index) => (
                                                        <li key={index}>
                                                            Row {error.row}: {error.message}
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
                                <Button variant="outline" onClick={() => navigate('/students')}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpload} disabled={!file || uploading}>
                                    {uploading ? (
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                        <Upload className="h-4 w-4 mr-1" />
                                    )}
                                    Upload Students
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
                                <li>Check for duplicate admission numbers</li>
                                <li>Verify date formats (YYYY-MM-DD)</li>
                                <li>Use valid email addresses</li>
                                <li>Phone numbers should be 10 digits</li>
                                <li>Class values should be between 1-12</li>
                                <li>Section values should be A, B, C, or D</li>
                                <li>Board should be CBSE, ICSE, or MPBSE</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default BulkUpload;
