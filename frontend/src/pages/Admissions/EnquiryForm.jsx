import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createEnquiry } from '../../store/slices/admissionsSlice';
import * as academicsAPI from '../../api/academics';
import { PageHeader, FormField, Button, LoadingSpinner } from '../../components/common';

const SOURCE_OPTIONS = [
    { value: 'WALK_IN', label: 'Walk In' },
    { value: 'PHONE', label: 'Phone' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'REFERRAL', label: 'Referral' },
];

const EnquiryForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [classes, setClasses] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        class_applied: '',
        source: 'WALK_IN',
        notes: '',
        follow_up_date: '',
    });

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await academicsAPI.getClasses();
                const list = res.data?.results || res.data || [];
                setClasses(list.map((c) => ({ value: c.id, label: c.name })));
            } catch (err) {
                console.error('Failed to fetch classes', err);
            }
        };
        fetchClasses();
    }, []);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name?.trim()) newErrors.name = 'Name is required';
        if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            const payload = {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email?.trim() || undefined,
                class_applied: formData.class_applied || null,
                source: formData.source,
                notes: formData.notes?.trim() || undefined,
                follow_up_date: formData.follow_up_date || null,
            };
            await dispatch(createEnquiry(payload)).unwrap();
            navigate('/admissions/enquiries');
        } catch (err) {
            if (err?.response?.data) {
                setErrors(err.response.data);
            } else {
                setErrors({ non_field_errors: 'An error occurred. Please try again.' });
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="New Enquiry"
                subtitle="Record a new admission enquiry"
            />

            {errors.non_field_errors && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-red-700">{errors.non_field_errors}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Enquiry Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label="Name *"
                            name="name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            error={errors.name}
                            required
                        />
                        <FormField
                            label="Phone *"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            error={errors.phone}
                            required
                        />
                        <FormField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            error={errors.email}
                        />
                        <FormField
                            label="Class Enquired"
                            name="class_applied"
                            type="select"
                            value={formData.class_applied}
                            onChange={(e) => handleChange('class_applied', e.target.value)}
                            options={[{ value: '', label: 'Select class' }, ...classes]}
                        />
                        <FormField
                            label="Source"
                            name="source"
                            type="select"
                            value={formData.source}
                            onChange={(e) => handleChange('source', e.target.value)}
                            options={SOURCE_OPTIONS}
                        />
                        <FormField
                            label="Follow-up Date"
                            name="follow_up_date"
                            type="date"
                            value={formData.follow_up_date}
                            onChange={(e) => handleChange('follow_up_date', e.target.value)}
                        />
                        <FormField
                            label="Notes"
                            name="notes"
                            type="textarea"
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => navigate('/admissions/enquiries')}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Create Enquiry'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EnquiryForm;
