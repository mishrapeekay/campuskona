import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, LoadingSpinner as Spinner } from '../../components/common';
import { privacyAPI } from '../../api/privacy';
import showToast from '../../utils/toast';
import { formatDateTime } from '../../utils/dateUtils';

const GrievancePortal = () => {
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [addingComment, setAddingComment] = useState(false);

    const [formData, setFormData] = useState({
        student_id: '',
        category: '',
        subject: '',
        description: '',
        severity: 'MEDIUM'
    });

    const categories = [
        { value: 'CONSENT_VIOLATION', label: 'Consent Violation', description: 'Unauthorized processing without consent' },
        { value: 'DATA_BREACH', label: 'Data Breach', description: 'Suspected or confirmed data breach' },
        { value: 'UNAUTHORIZED_ACCESS', label: 'Unauthorized Access', description: 'Someone accessed data without permission' },
        { value: 'DATA_INACCURACY', label: 'Data Inaccuracy', description: 'Incorrect or outdated information' },
        { value: 'RETENTION_VIOLATION', label: 'Retention Violation', description: 'Data retained longer than necessary' },
        { value: 'OTHER', label: 'Other Privacy Concern', description: 'Any other privacy or data protection issue' }
    ];

    useEffect(() => {
        loadGrievances();
    }, []);

    const loadGrievances = async () => {
        try {
            setLoading(true);
            const response = await privacyAPI.getGrievances();
            setGrievances(response.data.results || response.data || []);
        } catch (error) {
            showToast.error('Failed to load grievances');
            console.error('Grievances error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitGrievance = async (e) => {
        e.preventDefault();

        const { category, subject, description } = formData;

        if (!category || !subject.trim() || !description.trim()) {
            showToast.error('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            await privacyAPI.createGrievance(formData);

            showToast.success(
                'Grievance filed successfully. You will receive an acknowledgment email within 24 hours.',
                { autoClose: 5000 }
            );

            setShowForm(false);
            setFormData({
                student_id: '',
                category: '',
                subject: '',
                description: '',
                severity: 'MEDIUM'
            });
            loadGrievances();
        } catch (error) {
            showToast.error('Failed to file grievance');
            console.error('Submit grievance error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewDetails = async (grievance) => {
        try {
            const response = await privacyAPI.getGrievanceDetails(grievance.id);
            setSelectedGrievance(response.data);
            setShowDetailsModal(true);
        } catch (error) {
            showToast.error('Failed to load grievance details');
            console.error('Grievance details error:', error);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            showToast.error('Please enter a comment');
            return;
        }

        try {
            setAddingComment(true);
            await privacyAPI.addGrievanceComment(selectedGrievance.id, {
                comment: newComment
            });

            showToast.success('Comment added successfully');
            setNewComment('');

            // Reload grievance details
            const response = await privacyAPI.getGrievanceDetails(selectedGrievance.id);
            setSelectedGrievance(response.data);
        } catch (error) {
            showToast.error('Failed to add comment');
            console.error('Add comment error:', error);
        } finally {
            setAddingComment(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'SUBMITTED': 'secondary',
            'ACKNOWLEDGED': 'info',
            'UNDER_REVIEW': 'warning',
            'RESOLVED': 'success',
            'CLOSED': 'secondary'
        };

        const icons = {
            'SUBMITTED': '📝',
            'ACKNOWLEDGED': '✓',
            'UNDER_REVIEW': '🔍',
            'RESOLVED': '✅',
            'CLOSED': '🔒'
        };

        return (
            <Badge variant={variants[status] || 'secondary'}>
                {icons[status]} {status.replace('_', ' ')}
            </Badge>
        );
    };

    const getSeverityBadge = (severity) => {
        const variants = {
            'LOW': 'info',
            'MEDIUM': 'warning',
            'HIGH': 'danger',
            'CRITICAL': 'danger'
        };

        return <Badge variant={variants[severity] || 'secondary'}>{severity}</Badge>;
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'CONSENT_VIOLATION': '🚫',
            'DATA_BREACH': '🔓',
            'UNAUTHORIZED_ACCESS': '⚠️',
            'DATA_INACCURACY': '❌',
            'RETENTION_VIOLATION': '⏰',
            'OTHER': '📋'
        };
        return icons[category] || '📋';
    };

    const getTimelineStatus = (grievance) => {
        const now = new Date();
        const filed = new Date(grievance.filed_at);
        const hoursElapsed = Math.floor((now - filed) / (1000 * 60 * 60));

        if (grievance.resolved_at) {
            const resolved = new Date(grievance.resolved_at);
            const resolutionHours = Math.floor((resolved - filed) / (1000 * 60 * 60));
            return {
                status: 'resolved',
                message: `Resolved in ${resolutionHours} hours`,
                color: 'text-green-600'
            };
        }

        if (!grievance.acknowledged_at && hoursElapsed > 24) {
            return {
                status: 'overdue_ack',
                message: 'Acknowledgment overdue (24h SLA)',
                color: 'text-red-600'
            };
        }

        if (grievance.severity === 'CRITICAL' && hoursElapsed > 72) {
            return {
                status: 'overdue_resolution',
                message: 'Resolution overdue (72h SLA)',
                color: 'text-red-600'
            };
        }

        return {
            status: 'on_track',
            message: `In progress (${hoursElapsed}h elapsed)`,
            color: 'text-blue-600'
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Grievance Redressal</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Report privacy concerns and track resolution status
                    </p>
                </div>
                <Button variant="primary" onClick={() => setShowForm(true)}>
                    📝 File New Grievance
                </Button>
            </div>

            {/* Information Banner */}
            <Card className="bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                    <div className="text-3xl">💬</div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 mb-2">About Grievance Redressal</h3>
                        <p className="text-sm text-blue-800 mb-2">
                            If you have concerns about how your child's personal data is being processed, you can file a grievance.
                            We are committed to:
                        </p>
                        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                            <li><strong>24-hour acknowledgment</strong> - You'll receive a confirmation within 24 hours</li>
                            <li><strong>72-hour resolution</strong> - Critical issues resolved within 3 business days</li>
                            <li><strong>Transparent tracking</strong> - Track status and updates in real-time</li>
                            <li><strong>Two-way communication</strong> - Add comments and receive updates</li>
                        </ul>
                    </div>
                </div>
            </Card>

            {/* Grievances List */}
            <Card
                title={`My Grievances (${grievances.length})`}
                actions={
                    <Button variant="primary" size="sm" onClick={loadGrievances}>
                        🔄 Refresh
                    </Button>
                }
            >
                {grievances.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-4">✅</div>
                        <p className="text-lg font-medium">No grievances filed</p>
                        <p className="text-sm mt-2">
                            If you have any privacy concerns, you can file a grievance using the button above.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {grievances.map(grievance => {
                            const timeline = getTimelineStatus(grievance);

                            return (
                                <div
                                    key={grievance.id}
                                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => handleViewDetails(grievance)}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl">{getCategoryIcon(grievance.category)}</span>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-lg">
                                                        {grievance.subject}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {getStatusBadge(grievance.status)}
                                                        {getSeverityBadge(grievance.severity)}
                                                        <span className="text-xs text-gray-500">
                                                            {grievance.category.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {grievance.description}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <div>
                                                    <strong>Filed:</strong> {formatDateTime(grievance.filed_at)}
                                                </div>
                                                {grievance.acknowledged_at && (
                                                    <div>
                                                        <strong>Acknowledged:</strong> {formatDateTime(grievance.acknowledged_at)}
                                                    </div>
                                                )}
                                                {grievance.resolved_at && (
                                                    <div>
                                                        <strong>Resolved:</strong> {formatDateTime(grievance.resolved_at)}
                                                    </div>
                                                )}
                                            </div>

                                            <div className={`text-sm font-medium mt-2 ${timeline.color}`}>
                                                {timeline.message}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-xs text-gray-500">
                                                ID: {grievance.grievance_id?.substring(0, 8)}
                                            </div>
                                            <Button variant="outline" size="sm">
                                                View Details →
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {/* File Grievance Modal */}
            <Modal
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false);
                    setFormData({
                        student_id: '',
                        category: '',
                        subject: '',
                        description: '',
                        severity: 'MEDIUM'
                    });
                }}
                title="File New Grievance"
                size="lg"
            >
                <form onSubmit={handleSubmitGrievance} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">-- Select Category --</option>
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                        {formData.category && (
                            <p className="text-xs text-gray-500 mt-1">
                                {categories.find(c => c.value === formData.category)?.description}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject *
                        </label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Brief summary of your concern"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={6}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Provide detailed information about your privacy concern..."
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Please provide as much detail as possible to help us investigate your concern.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Severity
                        </label>
                        <select
                            value={formData.severity}
                            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="LOW">Low - Minor concern</option>
                            <option value="MEDIUM">Medium - Moderate concern</option>
                            <option value="HIGH">High - Serious concern</option>
                            <option value="CRITICAL">Critical - Urgent attention required</option>
                        </select>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="text-sm text-yellow-800">
                            <strong>What happens next?</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>You'll receive an acknowledgment email within 24 hours</li>
                                <li>Your grievance will be assigned to our Data Protection Officer</li>
                                <li>We aim to resolve critical issues within 72 hours</li>
                                <li>You can track status and add comments here</li>
                                <li>You'll be notified of any updates via email</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setShowForm(false);
                                setFormData({
                                    student_id: '',
                                    category: '',
                                    subject: '',
                                    description: '',
                                    severity: 'MEDIUM'
                                });
                            }}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                '📝 Submit Grievance'
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Grievance Details Modal */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedGrievance(null);
                    setNewComment('');
                }}
                title="Grievance Details"
                size="xl"
            >
                {selectedGrievance && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{getCategoryIcon(selectedGrievance.category)}</span>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {selectedGrievance.subject}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getStatusBadge(selectedGrievance.status)}
                                            {getSeverityBadge(selectedGrievance.severity)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 text-right">
                                    <div>Grievance ID</div>
                                    <div className="font-mono">{selectedGrievance.grievance_id}</div>
                                </div>
                            </div>

                            <div className="text-sm text-gray-700">
                                {selectedGrievance.description}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                        📝
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">Grievance Filed</div>
                                        <div className="text-sm text-gray-600">{formatDateTime(selectedGrievance.filed_at)}</div>
                                    </div>
                                </div>

                                {selectedGrievance.acknowledged_at && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                            ✓
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">Acknowledged</div>
                                            <div className="text-sm text-gray-600">{formatDateTime(selectedGrievance.acknowledged_at)}</div>
                                        </div>
                                    </div>
                                )}

                                {selectedGrievance.resolved_at && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                                            ✅
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">Resolved</div>
                                            <div className="text-sm text-gray-600">{formatDateTime(selectedGrievance.resolved_at)}</div>
                                            {selectedGrievance.resolution_notes && (
                                                <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                                                    <strong>Resolution Notes:</strong> {selectedGrievance.resolution_notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comments */}
                        {selectedGrievance.comments && selectedGrievance.comments.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Comments & Updates</h4>
                                <div className="space-y-3">
                                    {selectedGrievance.comments.map((comment, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-start justify-between mb-1">
                                                <div className="font-medium text-gray-900">
                                                    {comment.user_name || 'System'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatDateTime(comment.created_at)}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                {comment.comment}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add Comment (if not resolved) */}
                        {selectedGrievance.status !== 'RESOLVED' && selectedGrievance.status !== 'CLOSED' && (
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Add Comment</h4>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Add additional information or ask a question..."
                                />
                                <div className="flex justify-end mt-2">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleAddComment}
                                        disabled={addingComment || !newComment.trim()}
                                    >
                                        {addingComment ? (
                                            <>
                                                <Spinner size="sm" className="mr-2" />
                                                Adding...
                                            </>
                                        ) : (
                                            'Add Comment'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Close Button */}
                        <div className="flex justify-end pt-4 border-t">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedGrievance(null);
                                    setNewComment('');
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default GrievancePortal;
