import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/ui/composites';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Textarea } from '@/ui/primitives/textarea';
import { Label } from '@/ui/primitives/label';
import { Checkbox } from '@/ui/primitives/checkbox';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Loader2, Calendar, Save, X, AlertCircle } from 'lucide-react';
import {
    createAcademicYear,
    updateAcademicYear,
    fetchAcademicYearById,
} from '../../store/slices/academicsSlice';
import showToast, { getErrorMessage } from '../../utils/toast';

const AcademicYearForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const { currentYear, loading } = useSelector((state) => state.academics);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        start_date: '',
        end_date: '',
        is_active: true,
        is_current: false,
        description: '',
    });

    const [errors, setErrors] = useState({});
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (isEdit && id) {
            dispatch(fetchAcademicYearById(id));
        }
    }, [dispatch, id, isEdit]);

    useEffect(() => {
        if (isEdit && currentYear) {
            setFormData({
                name: currentYear.name || '',
                code: currentYear.code || '',
                start_date: currentYear.start_date || '',
                end_date: currentYear.end_date || '',
                is_active: currentYear.is_active ?? true,
                is_current: currentYear.is_current ?? false,
                description: currentYear.description || '',
            });
        }
    }, [currentYear, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleCheckboxChange = (name, checked) => {
        setFormData((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.code) newErrors.code = 'Code is required';
        if (!formData.start_date) newErrors.start_date = 'Start date is required';
        if (!formData.end_date) newErrors.end_date = 'End date is required';

        if (formData.start_date && formData.end_date) {
            if (new Date(formData.start_date) >= new Date(formData.end_date)) {
                newErrors.end_date = 'End date must be after start date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;
        setActionLoading(true);

        try {
            if (isEdit) {
                await dispatch(updateAcademicYear({ id, data: formData })).unwrap();
                showToast.success('Academic year updated successfully');
            } else {
                await dispatch(createAcademicYear(formData)).unwrap();
                showToast.success('Academic year created successfully');
            }
            navigate('/academics/years');
        } catch (err) {
            console.error('Failed to save academic year:', err);
            showToast.error('Failed to save academic year: ' + getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && isEdit && !formData.name) {
        return (
            <div className="h-[calc(100vh-100px)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-6 max-w-3xl mx-auto">
                <PageHeader
                    title={isEdit ? 'Edit Academic Year' : 'Add Academic Year'}
                    description={isEdit ? 'Update academic year session details' : 'Create a new academic year session'}
                    breadcrumbs={[
                        { label: 'Academics', href: '/academics' },
                        { label: 'Years', href: '/academics/years' },
                        { label: isEdit ? 'Edit' : 'New', active: true },
                    ]}
                />

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Year Configuration
                            </CardTitle>
                            <CardDescription>
                                Define the start and end dates for the academic session.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Academic Year Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., 2025-2026"
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">Code <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder="e.g., AY2025-26"
                                        className={errors.code ? 'border-destructive' : ''}
                                    />
                                    {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start Date <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="start_date"
                                        name="start_date"
                                        type="date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        className={errors.start_date ? 'border-destructive' : ''}
                                    />
                                    {errors.start_date && <p className="text-xs text-destructive">{errors.start_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Date <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="end_date"
                                        name="end_date"
                                        type="date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        className={errors.end_date ? 'border-destructive' : ''}
                                    />
                                    {errors.end_date && <p className="text-xs text-destructive">{errors.end_date}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Add any additional notes about this academic year..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex flex-col gap-4 p-4 bg-muted/40 rounded-lg border border-border">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => handleCheckboxChange('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer font-normal">
                                        Mark as <span className="font-semibold text-foreground">Active</span> (Visible in selection lists)
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_current"
                                        checked={formData.is_current}
                                        onCheckedChange={(checked) => handleCheckboxChange('is_current', checked)}
                                    />
                                    <Label htmlFor="is_current" className="cursor-pointer font-normal">
                                        Set as <span className="font-semibold text-foreground">Current Academic Year</span> (Default for system)
                                    </Label>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-border pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/academics/years')}
                                disabled={actionLoading}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button type="submit" disabled={actionLoading || loading}>
                                {actionLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        {isEdit ? 'Update Year' : 'Create Year'}
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AnimatedPage>
    );
};

export default AcademicYearForm;
