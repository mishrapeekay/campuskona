import React, { useState, useEffect } from 'react';
import {
    Upload,
    Download,
    Trash2,
    FileText,
    File,
    CheckCircle,
    XCircle,
    Eye,
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../common';
import {
    getStudentDocuments,
    uploadStudentDocument,
    deleteStudentDocument,
} from '../../api/students';
import showToast, { getErrorMessage } from '../../utils/toast';

/**
 * Document Manager Component
 * Handles document upload, download, and deletion for students
 */
const DocumentManager = ({ studentId }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);

    const [uploadForm, setUploadForm] = useState({
        document_type: 'BIRTH_CERTIFICATE',
        file: null,
    });

    const documentTypes = [
        { value: 'BIRTH_CERTIFICATE', label: 'Birth Certificate' },
        { value: 'TRANSFER_CERTIFICATE', label: 'Transfer Certificate' },
        { value: 'AADHAR_CARD', label: 'Aadhar Card' },
        { value: 'PHOTO', label: 'Photograph' },
        { value: 'MARKSHEET', label: 'Previous Marksheet' },
        { value: 'CASTE_CERTIFICATE', label: 'Caste Certificate' },
        { value: 'INCOME_CERTIFICATE', label: 'Income Certificate' },
        { value: 'DOMICILE_CERTIFICATE', label: 'Domicile Certificate' },
        { value: 'MEDICAL_CERTIFICATE', label: 'Medical Certificate' },
        { value: 'RESIDENCE_PROOF', label: 'Residence Proof' },
        { value: 'OTHER', label: 'Other Document' },
    ];

    useEffect(() => {
        loadDocuments();
    }, [studentId]);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const response = await getStudentDocuments(studentId);
            setDocuments(response.data || []);
        } catch (error) {
            console.error('Error loading documents:', error);
            showToast.error('Failed to load documents: ' + getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToast.warning('File size must be less than 5MB');
                return;
            }

            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                showToast.warning('Only PDF, JPEG, JPG, and PNG files are allowed');
                return;
            }

            setUploadForm((prev) => ({ ...prev, file }));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!uploadForm.file) {
            showToast.warning('Please select a file');
            return;
        }

        setUploading(true);
        try {
            await uploadStudentDocument(
                studentId,
                uploadForm.file,
                uploadForm.document_type
            );

            await loadDocuments();
            setShowUploadModal(false);
            setUploadForm({ document_type: 'BIRTH_CERTIFICATE', file: null });
            showToast.success('Document uploaded successfully!');
        } catch (error) {
            console.error('Error uploading document:', error);
            showToast.error('Failed to upload document: ' + getErrorMessage(error));
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteClick = (document) => {
        setDocumentToDelete(document);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!documentToDelete) return;

        try {
            await deleteStudentDocument(studentId, documentToDelete.id);
            await loadDocuments();
            setDeleteConfirmOpen(false);
            setDocumentToDelete(null);
            showToast.success('Document deleted successfully!');
        } catch (error) {
            console.error('Error deleting document:', error);
            showToast.error('Failed to delete document: ' + getErrorMessage(error));
        }
    };

    const handleDownload = (document) => {
        if (document.file) {
            // Open document in new tab
            window.open(document.file, '_blank');
        } else {
            showToast.warning('Document file not available');
        }
    };

    const getDocumentIcon = (documentType) => {
        const iconProps = { className: "h-8 w-8" };

        if (documentType?.includes('PHOTO') || documentType?.includes('IMAGE')) {
            return <File {...iconProps} className="h-8 w-8 text-purple-500" />;
        }

        return <FileText {...iconProps} className="h-8 w-8 text-blue-500" />;
    };

    const getFileExtension = (filename) => {
        return filename?.split('.').pop()?.toUpperCase() || '';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                <Button
                    onClick={() => setShowUploadModal(true)}
                    variant="primary"
                    size="sm"
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                </Button>
            </div>

            {/* Document List */}
            {documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                        <Card
                            key={doc.id}
                            className="hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start flex-1">
                                    {/* Icon */}
                                    <div className="flex-shrink-0">
                                        {getDocumentIcon(doc.document_type)}
                                    </div>

                                    {/* Details */}
                                    <div className="ml-4 flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900">
                                            {documentTypes.find((t) => t.value === doc.document_type)?.label ||
                                                doc.document_type}
                                        </h4>

                                        {doc.file_name && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {doc.file_name}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 mt-2">
                                            {doc.is_verified ? (
                                                <Badge variant="success" size="xs">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="warning" size="xs">
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Pending
                                                </Badge>
                                            )}

                                            {doc.file_size && (
                                                <span className="text-xs text-gray-500">
                                                    {(doc.file_size / 1024).toFixed(1)} KB
                                                </span>
                                            )}

                                            {doc.file_name && (
                                                <Badge variant="default" size="xs">
                                                    {getFileExtension(doc.file_name)}
                                                </Badge>
                                            )}
                                        </div>

                                        {doc.uploaded_at && (
                                            <p className="text-xs text-gray-400 mt-2">
                                                Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 ml-4">
                                    <Button
                                        onClick={() => handleDownload(doc)}
                                        variant="outline"
                                        size="sm"
                                        title="View Document"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteClick(doc)}
                                        variant="danger"
                                        size="sm"
                                        title="Delete Document"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Upload documents like birth certificate, TC, marksheets, etc.
                        </p>
                        <div className="mt-6">
                            <Button
                                onClick={() => setShowUploadModal(true)}
                                variant="primary"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Document
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Upload Modal */}
            <Modal
                isOpen={showUploadModal}
                onClose={() => {
                    setShowUploadModal(false);
                    setUploadForm({ document_type: 'BIRTH_CERTIFICATE', file: null });
                }}
                title="Upload Document"
                size="md"
            >
                <form onSubmit={handleUpload}>
                    <div className="space-y-6">
                        {/* Document Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Document Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={uploadForm.document_type}
                                onChange={(e) =>
                                    setUploadForm((prev) => ({
                                        ...prev,
                                        document_type: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                {documentTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select File <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Supported formats: PDF, JPEG, JPG, PNG (Max 5MB)
                            </p>
                            {uploadForm.file && (
                                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                                    <p className="text-sm text-blue-800">
                                        Selected: {uploadForm.file.name} (
                                        {(uploadForm.file.size / 1024).toFixed(1)} KB)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            onClick={() => {
                                setShowUploadModal(false);
                                setUploadForm({ document_type: 'BIRTH_CERTIFICATE', file: null });
                            }}
                            variant="secondary"
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                title="Confirm Delete"
                size="sm"
            >
                <p className="text-gray-600">
                    Are you sure you want to delete this document?
                    <span className="block font-semibold mt-2">
                        {documentTypes.find((t) => t.value === documentToDelete?.document_type)?.label}
                    </span>
                    This action cannot be undone.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        onClick={() => setDeleteConfirmOpen(false)}
                        variant="secondary"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} variant="danger">
                        Delete
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default DocumentManager;
