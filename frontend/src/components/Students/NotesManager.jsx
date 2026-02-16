import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileText, Calendar, User } from 'lucide-react';
import { Card, Button, Badge, Modal } from '../common';
import {
    getStudentNotes,
    addStudentNote,
    updateStudentNote,
    deleteStudentNote,
} from '../../api/students';
import showToast, { getErrorMessage } from '../../utils/toast';

/**
 * Notes Manager Component
 * Manages student notes - behavioral, academic, general observations
 */
const NotesManager = ({ studentId }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        note_type: 'GENERAL',
        title: '',
        content: '',
        is_important: false,
    });

    useEffect(() => {
        loadNotes();
    }, [studentId]);

    const loadNotes = async () => {
        try {
            setLoading(true);
            const response = await getStudentNotes(studentId);
            setNotes(response.data || []);
        } catch (error) {
            console.error('Error loading notes:', error);
            showToast.error('Failed to load notes: ' + getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (note = null) => {
        if (note) {
            setEditingNote(note);
            setFormData({
                note_type: note.note_type || 'GENERAL',
                title: note.title || '',
                content: note.content || '',
                is_important: note.is_important || false,
            });
        } else {
            setEditingNote(null);
            setFormData({
                note_type: 'GENERAL',
                title: '',
                content: '',
                is_important: false,
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingNote(null);
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

        if (!formData.title || !formData.content) {
            showToast.warning('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            if (editingNote) {
                await updateStudentNote(studentId, editingNote.id, formData);
            } else {
                await addStudentNote(studentId, formData);
            }

            await loadNotes();
            handleCloseModal();
            showToast.success(`Note ${editingNote ? 'updated' : 'added'} successfully!`);
        } catch (error) {
            console.error('Error saving note:', error);
            showToast.error(`Failed to ${editingNote ? 'update' : 'add'} note: ${getErrorMessage(error)}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (note) => {
        setNoteToDelete(note);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!noteToDelete) return;

        try {
            await deleteStudentNote(studentId, noteToDelete.id);
            await loadNotes();
            setDeleteConfirmOpen(false);
            setNoteToDelete(null);
            showToast.success('Note deleted successfully!');
        } catch (error) {
            console.error('Error deleting note:', error);
            showToast.error('Failed to delete note: ' + getErrorMessage(error));
        }
    };

    const noteTypes = [
        { value: 'GENERAL', label: 'General' },
        { value: 'ACADEMIC', label: 'Academic' },
        { value: 'BEHAVIORAL', label: 'Behavioral' },
        { value: 'ACHIEVEMENT', label: 'Achievement' },
        { value: 'CONCERN', label: 'Concern' },
        { value: 'PARENT_MEETING', label: 'Parent Meeting' },
        { value: 'COUNSELING', label: 'Counseling' },
        { value: 'OTHER', label: 'Other' },
    ];

    const getNoteTypeColor = (type) => {
        const colors = {
            GENERAL: 'default',
            ACADEMIC: 'info',
            BEHAVIORAL: 'warning',
            ACHIEVEMENT: 'success',
            CONCERN: 'danger',
            PARENT_MEETING: 'primary',
            COUNSELING: 'secondary',
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
                <h3 className="text-lg font-medium text-gray-900">Notes & Observations</h3>
                <Button onClick={() => handleOpenModal()} variant="primary" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                </Button>
            </div>

            {/* Notes List */}
            {notes.length > 0 ? (
                <div className="space-y-4">
                    {notes.map((note) => (
                        <Card
                            key={note.id}
                            className={`hover:shadow-md transition-shadow ${
                                note.is_important ? 'border-l-4 border-l-red-500' : ''
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-base font-semibold text-gray-900">
                                                {note.title}
                                            </h4>
                                            {note.is_important && (
                                                <Badge variant="danger" size="sm">
                                                    Important
                                                </Badge>
                                            )}
                                        </div>
                                        <Badge variant={getNoteTypeColor(note.note_type)} size="sm">
                                            {noteTypes.find((t) => t.value === note.note_type)?.label ||
                                                note.note_type}
                                        </Badge>
                                    </div>

                                    {/* Content */}
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {note.content}
                                    </p>

                                    {/* Footer */}
                                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                                        {note.created_by_name && (
                                            <div className="flex items-center">
                                                <User className="h-3 w-3 mr-1" />
                                                <span>By {note.created_by_name}</span>
                                            </div>
                                        )}
                                        {note.created_at && (
                                            <div className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                <span>
                                                    {new Date(note.created_at).toLocaleDateString()} at{' '}
                                                    {new Date(note.created_at).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        )}
                                        {note.updated_at && note.updated_at !== note.created_at && (
                                            <span className="text-gray-400">(edited)</span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 ml-4">
                                    <Button
                                        onClick={() => handleOpenModal(note)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteClick(note)}
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
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No notes yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Add notes about student behavior, academic performance, or general observations
                        </p>
                        <div className="mt-6">
                            <Button onClick={() => handleOpenModal()} variant="primary">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Note
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={handleCloseModal}
                title={editingNote ? 'Edit Note' : 'Add Note'}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Note Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Note Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="note_type"
                                value={formData.note_type}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {noteTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                placeholder="Brief title for this note"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Note Content <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                required
                                rows={6}
                                placeholder="Write your detailed note here..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Important Flag */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_important"
                                checked={formData.is_important}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 text-sm text-gray-700">
                                Mark as important (requires immediate attention)
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
                            {submitting ? 'Saving...' : editingNote ? 'Update Note' : 'Add Note'}
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
                    Are you sure you want to delete this note?
                    <span className="block font-semibold mt-2">{noteToDelete?.title}</span>
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

export default NotesManager;
