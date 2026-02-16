import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPayrollRun } from '../../store/slices/hrPayrollSlice';
import { PageHeader, FormField, Button } from '../../components/common';

const MONTHS = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

const PayrollRunForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        month: new Date().getMonth() + 1,
        year: currentYear,
    });

    const yearOptions = Array.from({ length: 5 }, (_, i) => {
        const y = currentYear - i;
        return { value: y, label: String(y) };
    });

    const validate = () => {
        const newErrors = {};
        if (!formData.month || formData.month < 1 || formData.month > 12) newErrors.month = 'Select a valid month';
        if (!formData.year || formData.year < 2020 || formData.year > 2030) newErrors.year = 'Select a valid year';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            const run = await dispatch(createPayrollRun({
                month: Number(formData.month),
                year: Number(formData.year),
                run_date: new Date().toISOString().slice(0, 10),
            })).unwrap();
            navigate(`/hr/payroll/${run.id}/payslips`);
        } catch (err) {
            setErrors(err?.detail ? { non_field_errors: typeof err.detail === 'string' ? err.detail : 'Failed to create payroll run.' } : { non_field_errors: 'Failed to create payroll run.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="New Payroll Run"
                subtitle="Create a payroll run for a month/year. After creating, process it to generate payslips."
                actions={[{ label: 'Back to Payroll', variant: 'outline', onClick: () => navigate('/hr/payroll') }]}
            />

            {errors.non_field_errors && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-red-700">{errors.non_field_errors}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-md">
                <div className="grid grid-cols-1 gap-4">
                    <FormField
                        label="Month *"
                        name="month"
                        type="select"
                        value={formData.month}
                        onChange={(e) => setFormData((prev) => ({ ...prev, month: Number(e.target.value) }))}
                        options={[{ value: '', label: 'Select month' }, ...MONTHS]}
                        error={errors.month}
                        required
                    />
                    <FormField
                        label="Year *"
                        name="year"
                        type="select"
                        value={formData.year}
                        onChange={(e) => setFormData((prev) => ({ ...prev, year: Number(e.target.value) }))}
                        options={[{ value: '', label: 'Select year' }, ...yearOptions]}
                        error={errors.year}
                        required
                    />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => navigate('/hr/payroll')}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={saving}>
                        {saving ? 'Creating...' : 'Create Payroll Run'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PayrollRunForm;
