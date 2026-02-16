import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Phone, Mail, Briefcase, DollarSign } from 'lucide-react';
import { Card, Button, Badge, Modal } from '../common';
import {
    getStudentGuardians,
    addStudentGuardian,
    updateStudentGuardian,
    removeStudentGuardian,
} from '../../api/students';
import showToast, { getErrorMessage } from '../../utils/toast';

/**
 * Guardian Manager Component
 * Handles CRUD operations for student guardians
 */
const GuardianManager = ({ studentId }) => {
    const [guardians, setGuardians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGuardian, setEditingGuardian] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [guardianToDelete, setGuardianToDelete] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        relation: 'FATHER',
        phone: '',
        email: '',
        occupation: '',
        annual_income: '',
        aadhar_number: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        is_primary: false,
    });

    // Fetch guardians on mount
    useEffect(() => {
        loadGuardians();
    }, [studentId]);

    const loadGuardians = async () => {
        try {
            setLoading(true);
            const response = await getStudentGuardians(studentId);
            setGuardians(response.data || []);
        } catch (error) {
            console.error('Error loading guardians:', error);
            showToast.error('Failed to load guardians: ' + getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (guardian = null) => {
        if (guardian) {
            setEditingGuardian(guardian);
            setFormData({
                first_name: guardian.first_name || '',
                middle_name: guardian.middle_name || '',
                last_name: guardian.last_name || '',
                relation: guardian.relation || 'FATHER',
                phone: guardian.phone || '',
                email: guardian.email || '',
                occupation: guardian.occupation || '',
                annual_income: guardian.annual_income || '',
                aadhar_number: guardian.aadhar_number || '',
                address_line1: guardian.address_line1 || '',
                address_line2: guardian.address_line2 || '',
                city: guardian.city || '',
                state: guardian.state || '',
                pincode: guardian.pincode || '',
                is_primary: guardian.is_primary || false,
            });
        } else {
            setEditingGuardian(null);
            setFormData({
                first_name: '',
                middle_name: '',
                last_name: '',
                relation: 'FATHER',
                phone: '',
                email: '',
                occupation: '',
                annual_income: '',
                aadhar_number: '',
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                pincode: '',
                is_primary: guardians.length === 0, // First guardian is primary by default
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingGuardian(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.first_name || !formData.last_name || !formData.phone) {
            showToast.warning('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            if (editingGuardian) {
                // Update existing guardian
                await updateStudentGuardian(studentId, editingGuardian.id, formData);
            } else {
                // Add new guardian
                await addStudentGuardian(studentId, formData);
            }

            await loadGuardians(); // Reload guardians
            handleCloseModal();
            showToast.success(`Guardian ${editingGuardian ? 'updated' : 'added'} successfully!`);
        } catch (error) {
            console.error('Error saving guardian:', error);
            showToast.error(`Failed to ${editingGuardian ? 'update' : 'add'} guardian: ${getErrorMessage(error)}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (guardian) => {
        setGuardianToDelete(guardian);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!guardianToDelete) return;

        try {
            await removeStudentGuardian(studentId, guardianToDelete.id);
            await loadGuardians();
            setDeleteConfirmOpen(false);
            setGuardianToDelete(null);
            showToast.success('Guardian removed successfully!');
        } catch (error) {
            console.error('Error deleting guardian:', error);
            showToast.error('Failed to remove guardian: ' + getErrorMessage(error));
        }
    };

    const relationOptions = [
        { value: 'FATHER', label: 'Father' },
        { value: 'MOTHER', label: 'Mother' },
        { value: 'GUARDIAN', label: 'Legal Guardian' },
        { value: 'GRANDFATHER', label: 'Grandfather' },
        { value: 'GRANDMOTHER', label: 'Grandmother' },
        { value: 'UNCLE', label: 'Uncle' },
        { value: 'AUNT', label: 'Aunt' },
        { value: 'BROTHER', label: 'Brother' },
        { value: 'SISTER', label: 'Sister' },
        { value: 'OTHER', label: 'Other' },
    ];

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
                <h3 className="text-lg font-medium text-gray-900">Guardian Information</h3>
                <Button onClick={() => handleOpenModal()} variant="primary" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Guardian
                </Button>
            </div>

            {/* Guardian List */}
            {guardians.length > 0 ? (
                <div className="space-y-4">
                    {guardians.map((guardian, index) => (
                        <Card key={guardian.id} className="hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    {/* Header */}
                                    <div className="flex items-center mb-4">
                                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-lg font-semibold text-gray-900">
                                                {guardian.full_name || `${guardian.first_name} ${guardian.last_name}`}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="info" size="sm">
                                                    {guardian.relation}
                                                </Badge>
                                                {guardian.is_primary && (
                                                    <Badge variant="success" size="sm">
                                                        Primary Contact
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                        {guardian.phone && (
                                            <div className="flex items-center text-gray-600">
                                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                                <span>{guardian.phone}</span>
                                            </div>
                                        )}
                                        {guardian.email && (
                                            <div className="flex items-center text-gray-600">
                                                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                                <span>{guardian.email}</span>
                                            </div>
                                        )}
                                        {guardian.occupation && (
                                            <div className="flex items-center text-gray-600">
                                                <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                                                <span>{guardian.occupation}</span>
                                            </div>
                                        )}
                                        {guardian.annual_income && (
                                            <div className="flex items-center text-gray-600">
                                                <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                                                <span>₹{guardian.annual_income}</span>
                                            </div>
                                        )}
                                        {guardian.aadhar_number && (
                                            <div className="flex items-center text-gray-600">
                                                <span className="text-gray-500 mr-2">Aadhar:</span>
                                                <span>{guardian.aadhar_number}</span>
                                            </div>
                                        )}
                                        {guardian.address_line1 && (
                                            <div className="flex items-start text-gray-600 md:col-span-2 lg:col-span-3">
                                                <span className="text-gray-500 mr-2">Address:</span>
                                                <span>
                                                    {guardian.address_line1}
                                                    {guardian.address_line2 && `, ${guardian.address_line2}`}
                                                    {guardian.city && `, ${guardian.city}`}
                                                    {guardian.state && `, ${guardian.state}`}
                                                    {guardian.pincode && ` - ${guardian.pincode}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 ml-4">
                                    <Button
                                        onClick={() => handleOpenModal(guardian)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteClick(guardian)}
                                        variant="danger"
                                        size="sm"
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
                        <User className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No guardians added</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by adding a guardian for this student
                        </p>
                        <div className="mt-6">
                            <Button onClick={() => handleOpenModal()} variant="primary">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Guardian
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={handleCloseModal}
                title={editingGuardian ? 'Edit Guardian' : 'Add Guardian'}
                size="lg"
            >
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Personal Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Middle Name
                                    </label>
                                    <input
                                        type="text"
                                        name="middle_name"
                                        value={formData.middle_name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Relationship & Contact */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Relationship & Contact</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Relation <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="relation"
                                        value={formData.relation}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {relationOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Aadhar Number
                                    </label>
                                    <input
                                        type="text"
                                        name="aadhar_number"
                                        value={formData.aadhar_number}
                                        onChange={handleInputChange}
                                        maxLength={12}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Occupation & Income */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Professional Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Occupation
                                    </label>
                                    <input
                                        type="text"
                                        name="occupation"
                                        value={formData.occupation}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Annual Income (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="annual_income"
                                        value={formData.annual_income}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Address</h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address Line 1
                                    </label>
                                    <input
                                        type="text"
                                        name="address_line1"
                                        value={formData.address_line1}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address Line 2
                                    </label>
                                    <input
                                        type="text"
                                        name="address_line2"
                                        value={formData.address_line2}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            PIN Code
                                        </label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            maxLength={6}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Primary Contact */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_primary"
                                checked={formData.is_primary}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 text-sm text-gray-700">
                                Set as primary contact
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            onClick={handleCloseModal}
                            variant="secondary"
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={submitting}>
                            {submitting ? 'Saving...' : editingGuardian ? 'Update Guardian' : 'Add Guardian'}
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
                    Are you sure you want to remove{' '}
                    <span className="font-semibold">{guardianToDelete?.full_name}</span> as a guardian?
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

export default GuardianManager;
