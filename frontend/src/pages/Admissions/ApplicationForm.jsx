import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createApplication } from '../../store/slices/admissionsSlice';
import * as admissionsAPI from '../../api/admissions';
import * as academicsAPI from '../../api/academics';
import { PageHeader, FormField, Button, LoadingSpinner } from '../../components/common';

const ApplicationForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Dropdown options
    const [academicYears, setAcademicYears] = useState([]);
    const [classes, setClasses] = useState([]);

    const [formData, setFormData] = useState({
        student_name: '', date_of_birth: '', gender: 'M',
        class_applied: '', academic_year: '',
        father_name: '', mother_name: '', phone: '', email: '',
        address: '', city: '', state: '', pincode: '',
        previous_school: '', previous_class: '', board: '', percentage: '',
    });

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [yearsRes, classesRes] = await Promise.all([
                    academicsAPI.getAcademicYears(),
                    academicsAPI.getClasses() // Assuming pagination is not issue for dropdown
                ]);

                const years = yearsRes.data?.results || yearsRes.data || [];
                const classList = classesRes.data?.results || classesRes.data || [];

                setAcademicYears(years.map(y => ({ value: y.id, label: y.name })));
                setClasses(classList.map(c => ({ value: c.id, label: c.name })));

                // Set default academic year if available and creating new
                if (!isEditing && years.length > 0) {
                    const current = years.find(y => y.is_current) || years[0];
                    setFormData(prev => ({ ...prev, academic_year: current.id }));
                }

            } catch (err) {
                console.error("Failed to fetch metadata", err);
            }
        };

        fetchMetadata();

        if (isEditing) {
            setLoading(true);
            admissionsAPI.getApplicationById(id).then((res) => {
                const d = res.data;
                const toStr = (v) => (v != null ? String(v) : '');
                setFormData({
                    student_name: toStr(d.student_name),
                    date_of_birth: d.date_of_birth || '',
                    gender: d.gender || 'M',
                    class_applied: d.class_applied?.id ?? d.class_applied ?? '',
                    academic_year: d.academic_year?.id ?? d.academic_year ?? '',
                    father_name: toStr(d.father_name),
                    mother_name: toStr(d.mother_name),
                    phone: toStr(d.phone),
                    email: toStr(d.email),
                    address: toStr(d.address),
                    city: toStr(d.city),
                    state: toStr(d.state),
                    pincode: toStr(d.pincode),
                    previous_school: toStr(d.previous_school),
                    previous_class: toStr(d.previous_class),
                    board: toStr(d.board),
                    percentage: d.percentage != null ? String(d.percentage) : '',
                });
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [id, isEditing]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.student_name) newErrors.student_name = 'Student name is required';
        if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
        if (!formData.father_name) newErrors.father_name = 'Father name is required';
        if (!formData.phone) newErrors.phone = 'Phone is required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.class_applied) newErrors.class_applied = 'Class is required';
        if (!formData.academic_year) newErrors.academic_year = 'Academic Year is required';
        if (!formData.city?.trim()) newErrors.city = 'City is required';
        if (!formData.state?.trim()) newErrors.state = 'State is required';
        if (!formData.pincode?.trim()) newErrors.pincode = 'Pincode is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            if (isEditing) {
                await admissionsAPI.updateApplication(id, formData);
            } else {
                await dispatch(createApplication(formData)).unwrap();
            }
            navigate('/admissions/applications');
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

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <PageHeader
                title={isEditing ? 'Edit Application' : 'New Admission Application'}
                subtitle="Fill in the student and parent details"
            />

            {errors.non_field_errors && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-red-700">{errors.non_field_errors}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student Information */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Student Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            label="Student Name *"
                            name="student_name"
                            value={formData.student_name}
                            onChange={(e) => handleChange('student_name', e.target.value)}
                            error={errors.student_name}
                            required
                        />
                        <FormField
                            label="Date of Birth *"
                            name="date_of_birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => handleChange('date_of_birth', e.target.value)}
                            error={errors.date_of_birth}
                            required
                        />
                        <FormField
                            label="Gender *"
                            name="gender"
                            type="select"
                            value={formData.gender}
                            onChange={(e) => handleChange('gender', e.target.value)}
                            options={[
                                { value: 'M', label: 'Male' },
                                { value: 'F', label: 'Female' },
                                { value: 'O', label: 'Other' }
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormField
                            label="Class Applied *"
                            name="class_applied"
                            type="select"
                            value={formData.class_applied}
                            onChange={(e) => handleChange('class_applied', e.target.value)}
                            error={errors.class_applied}
                            options={classes}
                            required
                        />
                        <FormField
                            label="Academic Year *"
                            name="academic_year"
                            type="select"
                            value={formData.academic_year}
                            onChange={(e) => handleChange('academic_year', e.target.value)}
                            error={errors.academic_year}
                            options={academicYears}
                            required
                        />
                    </div>
                </div>

                {/* Parent Information */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Parent / Guardian Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label="Father's Name *"
                            name="father_name"
                            value={formData.father_name}
                            onChange={(e) => handleChange('father_name', e.target.value)}
                            error={errors.father_name}
                            required
                        />
                        <FormField
                            label="Mother's Name"
                            name="mother_name"
                            value={formData.mother_name}
                            onChange={(e) => handleChange('mother_name', e.target.value)}
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
                        />
                    </div>
                </div>

                {/* Address */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Address</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <FormField
                            label="Address *"
                            name="address"
                            type="textarea"
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            error={errors.address}
                            required
                            rows={2}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <FormField
                            label="City *"
                            name="city"
                            value={formData.city}
                            onChange={(e) => handleChange('city', e.target.value)}
                            error={errors.city}
                            required
                        />
                        <FormField
                            label="State *"
                            name="state"
                            value={formData.state}
                            onChange={(e) => handleChange('state', e.target.value)}
                            error={errors.state}
                            required
                        />
                        <FormField
                            label="Pincode *"
                            name="pincode"
                            value={formData.pincode}
                            onChange={(e) => handleChange('pincode', e.target.value)}
                            error={errors.pincode}
                            required
                        />
                    </div>
                </div>

                {/* Previous School */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Previous School Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label="Previous School"
                            name="previous_school"
                            value={formData.previous_school}
                            onChange={(e) => handleChange('previous_school', e.target.value)}
                        />
                        <FormField
                            label="Previous Class"
                            name="previous_class"
                            value={formData.previous_class}
                            onChange={(e) => handleChange('previous_class', e.target.value)}
                        />
                        <FormField
                            label="Board"
                            name="board"
                            value={formData.board}
                            onChange={(e) => handleChange('board', e.target.value)}
                            placeholder="CBSE, ICSE, State..."
                        />
                        <FormField
                            label="Percentage"
                            name="percentage"
                            type="number"
                            step="0.01"
                            value={formData.percentage}
                            onChange={(e) => handleChange('percentage', e.target.value)}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => navigate('/admissions/applications')}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={saving}>
                        {saving ? 'Saving...' : isEditing ? 'Update Application' : 'Create Application'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ApplicationForm;
