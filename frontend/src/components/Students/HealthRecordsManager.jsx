import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Activity, Calendar, Stethoscope } from 'lucide-react';
import { Card, Button, Badge, Modal } from '../common';
import {
    getStudentHealthRecords,
    addStudentHealthRecord,
    updateStudentHealthRecord,
    deleteStudentHealthRecord,
} from '../../api/students';
import showToast, { getErrorMessage } from '../../utils/toast';

/**
 * Health Records Manager Component
 * Manages student health records, checkups, vaccinations, and medical history
 */
const HealthRecordsManager = ({ studentId }) => {
    const [healthRecords, setHealthRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        record_type: 'CHECKUP',
        record_date: new Date().toISOString().split('T')[0],
        height: '',
        weight: '',
        bmi: '',
        blood_pressure: '',
        temperature: '',
        pulse_rate: '',
        vision: '',
        dental_checkup: '',
        vaccinations: '',
        illness: '',
        diagnosis: '',
        treatment: '',
        prescription: '',
        doctor_name: '',
        hospital_name: '',
        remarks: '',
    });

    useEffect(() => {
        loadHealthRecords();
    }, [studentId]);

    const loadHealthRecords = async () => {
        try {
            setLoading(true);
            const response = await getStudentHealthRecords(studentId);
            setHealthRecords(response.data || []);
        } catch (error) {
            console.error('Error loading health records:', error);
            showToast.error('Failed to load health records: ' + getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (record = null) => {
        if (record) {
            setEditingRecord(record);
            setFormData({
                record_type: record.record_type || 'CHECKUP',
                record_date: record.record_date || new Date().toISOString().split('T')[0],
                height: record.height || '',
                weight: record.weight || '',
                bmi: record.bmi || '',
                blood_pressure: record.blood_pressure || '',
                temperature: record.temperature || '',
                pulse_rate: record.pulse_rate || '',
                vision: record.vision || '',
                dental_checkup: record.dental_checkup || '',
                vaccinations: record.vaccinations || '',
                illness: record.illness || '',
                diagnosis: record.diagnosis || '',
                treatment: record.treatment || '',
                prescription: record.prescription || '',
                doctor_name: record.doctor_name || '',
                hospital_name: record.hospital_name || '',
                remarks: record.remarks || '',
            });
        } else {
            setEditingRecord(null);
            setFormData({
                record_type: 'CHECKUP',
                record_date: new Date().toISOString().split('T')[0],
                height: '',
                weight: '',
                bmi: '',
                blood_pressure: '',
                temperature: '',
                pulse_rate: '',
                vision: '',
                dental_checkup: '',
                vaccinations: '',
                illness: '',
                diagnosis: '',
                treatment: '',
                prescription: '',
                doctor_name: '',
                hospital_name: '',
                remarks: '',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRecord(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };

            // Auto-calculate BMI if height and weight are provided
            if ((name === 'height' || name === 'weight') && updated.height && updated.weight) {
                const heightInMeters = parseFloat(updated.height) / 100;
                const weightInKg = parseFloat(updated.weight);
                if (heightInMeters > 0 && weightInKg > 0) {
                    updated.bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(2);
                }
            }

            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.record_date) {
            showToast.warning('Please select a record date');
            return;
        }

        setSubmitting(true);
        try {
            if (editingRecord) {
                await updateStudentHealthRecord(studentId, editingRecord.id, formData);
            } else {
                await addStudentHealthRecord(studentId, formData);
            }
            await loadHealthRecords();
            handleCloseModal();
            showToast.success(`Health record ${editingRecord ? 'updated' : 'added'} successfully!`);
        } catch (error) {
            console.error('Error saving health record:', error);
            showToast.error(`Failed to ${editingRecord ? 'update' : 'add'} health record: ` + getErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (record) => {
        setRecordToDelete(record);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!recordToDelete) return;

        try {
            await deleteStudentHealthRecord(studentId, recordToDelete.id);
            await loadHealthRecords();
            setDeleteConfirmOpen(false);
            setRecordToDelete(null);
            showToast.success('Health record deleted successfully!');
        } catch (error) {
            console.error('Error deleting health record:', error);
            showToast.error('Failed to delete health record: ' + getErrorMessage(error));
        }
    };

    const recordTypes = [
        { value: 'CHECKUP', label: 'General Checkup' },
        { value: 'VACCINATION', label: 'Vaccination' },
        { value: 'ILLNESS', label: 'Illness/Disease' },
        { value: 'INJURY', label: 'Injury' },
        { value: 'DENTAL', label: 'Dental Checkup' },
        { value: 'VISION', label: 'Vision Test' },
        { value: 'OTHER', label: 'Other' },
    ];

    const getRecordTypeColor = (type) => {
        const colors = {
            CHECKUP: 'info',
            VACCINATION: 'success',
            ILLNESS: 'warning',
            INJURY: 'danger',
            DENTAL: 'primary',
            VISION: 'secondary',
            OTHER: 'default',
        };
        return colors[type] || 'default';
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
                <h3 className="text-lg font-medium text-gray-900">Health Records</h3>
                <Button onClick={handleOpenModal} variant="primary" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Record
                </Button>
            </div>

            {/* Health Records List */}
            {healthRecords.length > 0 ? (
                <div className="space-y-4">
                    {healthRecords.map((record) => (
                        <Card key={record.id} className="hover:shadow-md transition-shadow relative">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                        <Activity className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>

                                <div className="ml-4 flex-1">
                                    {/* Actions */}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <Button
                                            onClick={() => handleOpenModal(record)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            onClick={() => handleDeleteClick(record)}
                                            variant="danger"
                                            size="sm"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {/* Header */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-base font-semibold text-gray-900">
                                                {recordTypes.find((t) => t.value === record.record_type)?.label ||
                                                    record.record_type}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant={getRecordTypeColor(record.record_type)} size="sm">
                                                    {record.record_type}
                                                </Badge>
                                                <span className="text-xs text-gray-500 flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {new Date(record.record_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        {record.height && (
                                            <div>
                                                <span className="text-gray-500">Height:</span>
                                                <span className="ml-2 font-medium">{record.height} cm</span>
                                            </div>
                                        )}
                                        {record.weight && (
                                            <div>
                                                <span className="text-gray-500">Weight:</span>
                                                <span className="ml-2 font-medium">{record.weight} kg</span>
                                            </div>
                                        )}
                                        {record.bmi && (
                                            <div>
                                                <span className="text-gray-500">BMI:</span>
                                                <span className="ml-2 font-medium">{record.bmi}</span>
                                            </div>
                                        )}
                                        {record.blood_pressure && (
                                            <div>
                                                <span className="text-gray-500">BP:</span>
                                                <span className="ml-2 font-medium">{record.blood_pressure}</span>
                                            </div>
                                        )}
                                        {record.temperature && (
                                            <div>
                                                <span className="text-gray-500">Temp:</span>
                                                <span className="ml-2 font-medium">{record.temperature}°F</span>
                                            </div>
                                        )}
                                        {record.pulse_rate && (
                                            <div>
                                                <span className="text-gray-500">Pulse:</span>
                                                <span className="ml-2 font-medium">{record.pulse_rate} bpm</span>
                                            </div>
                                        )}
                                        {record.vision && (
                                            <div>
                                                <span className="text-gray-500">Vision:</span>
                                                <span className="ml-2 font-medium">{record.vision}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Additional Details */}
                                    {(record.illness || record.diagnosis || record.treatment || record.vaccinations) && (
                                        <div className="mt-4 space-y-2 text-sm">
                                            {record.illness && (
                                                <div>
                                                    <span className="text-gray-500">Illness:</span>
                                                    <span className="ml-2">{record.illness}</span>
                                                </div>
                                            )}
                                            {record.diagnosis && (
                                                <div>
                                                    <span className="text-gray-500">Diagnosis:</span>
                                                    <span className="ml-2">{record.diagnosis}</span>
                                                </div>
                                            )}
                                            {record.treatment && (
                                                <div>
                                                    <span className="text-gray-500">Treatment:</span>
                                                    <span className="ml-2">{record.treatment}</span>
                                                </div>
                                            )}
                                            {record.vaccinations && (
                                                <div>
                                                    <span className="text-gray-500">Vaccinations:</span>
                                                    <span className="ml-2">{record.vaccinations}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Doctor/Hospital Info */}
                                    {(record.doctor_name || record.hospital_name) && (
                                        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                                            {record.doctor_name && (
                                                <div className="flex items-center">
                                                    <Stethoscope className="h-4 w-4 mr-1 text-gray-400" />
                                                    <span>Dr. {record.doctor_name}</span>
                                                </div>
                                            )}
                                            {record.hospital_name && (
                                                <div>
                                                    <span>{record.hospital_name}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Remarks */}
                                    {record.remarks && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                                            <span className="text-gray-500">Remarks:</span>
                                            <p className="mt-1 text-gray-700">{record.remarks}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <div className="text-center py-8">
                        <Activity className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No health records</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Add health checkups, vaccinations, and medical history
                        </p>
                        <div className="mt-6">
                            <Button onClick={handleOpenModal} variant="primary">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Health Record
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Add/Edit Record Modal */}
            <Modal
                isOpen={showModal}
                onClose={handleCloseModal}
                title={editingRecord ? 'Edit Health Record' : 'Add Health Record'}
                size="lg"
            >
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Record Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="record_type"
                                        value={formData.record_type}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {recordTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="record_date"
                                        value={formData.record_date}
                                        onChange={handleInputChange}
                                        required
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Vital Signs */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Vital Signs</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Height (cm)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        BMI
                                    </label>
                                    <input
                                        type="text"
                                        name="bmi"
                                        value={formData.bmi}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Blood Pressure
                                    </label>
                                    <input
                                        type="text"
                                        name="blood_pressure"
                                        placeholder="120/80"
                                        value={formData.blood_pressure}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Temperature (°F)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="temperature"
                                        placeholder="98.6"
                                        value={formData.temperature}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pulse Rate (bpm)
                                    </label>
                                    <input
                                        type="number"
                                        name="pulse_rate"
                                        placeholder="72"
                                        value={formData.pulse_rate}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Medical Details */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Medical Details</h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Illness/Complaint
                                    </label>
                                    <input
                                        type="text"
                                        name="illness"
                                        value={formData.illness}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Diagnosis
                                    </label>
                                    <input
                                        type="text"
                                        name="diagnosis"
                                        value={formData.diagnosis}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Treatment/Medication
                                    </label>
                                    <textarea
                                        name="treatment"
                                        value={formData.treatment}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vaccinations
                                    </label>
                                    <input
                                        type="text"
                                        name="vaccinations"
                                        placeholder="e.g., COVID-19 Dose 1, Hepatitis B"
                                        value={formData.vaccinations}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Doctor/Hospital */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Medical Professional</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Doctor Name
                                    </label>
                                    <input
                                        type="text"
                                        name="doctor_name"
                                        value={formData.doctor_name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hospital/Clinic Name
                                    </label>
                                    <input
                                        type="text"
                                        name="hospital_name"
                                        value={formData.hospital_name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Remarks
                            </label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
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
                            {submitting ? 'Saving...' : editingRecord ? 'Update Record' : 'Add Record'}
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
                    Are you sure you want to delete this health record?
                    <span className="block font-semibold mt-2">
                        {recordTypes.find((t) => t.value === recordToDelete?.record_type)?.label} - {' '}
                        {recordToDelete?.record_date && new Date(recordToDelete.record_date).toLocaleDateString()}
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

export default HealthRecordsManager;
