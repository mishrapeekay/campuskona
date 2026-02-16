import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/ui/composites';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Textarea } from '@/ui/primitives/textarea';
import { Checkbox } from '@/ui/primitives/checkbox';
import { Loader2, BookOpen, Save, X, AlertCircle } from 'lucide-react';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/ui/primitives/select';
import {
    createSubject,
    updateSubject,
    fetchSubjectById,
    fetchBoards,
} from '../../store/slices/academicsSlice';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import showToast, { getErrorMessage } from '../../utils/toast';

const SubjectForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const { currentSubject, boards, loading } = useSelector((state) => state.academics);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        subject_type: 'CORE',
        class_group: 'PRIMARY',
        stream: 'GENERAL',
        board: '',
        theory_max_marks: 100,
        practical_max_marks: 0,
        has_practical: false,
        is_optional: false,
        description: '',
        is_active: true,
    });

    const [errors, setErrors] = useState({});
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchBoards());
        if (isEdit && id) {
            dispatch(fetchSubjectById(id));
        }
    }, [dispatch, id, isEdit]);

    useEffect(() => {
        if (isEdit && currentSubject) {
            setFormData({
                name: currentSubject.name || '',
                code: currentSubject.code || '',
                subject_type: currentSubject.subject_type || 'CORE',
                class_group: currentSubject.class_group || 'PRIMARY',
                stream: currentSubject.stream || 'GENERAL',
                board: currentSubject.board?.id?.toString() || currentSubject.board?.toString() || '',
                theory_max_marks: currentSubject.theory_max_marks ?? 100,
                practical_max_marks: currentSubject.practical_max_marks ?? 0,
                has_practical: currentSubject.has_practical ?? false,
                is_optional: currentSubject.is_optional ?? false,
                description: currentSubject.description || '',
                is_active: currentSubject.is_active ?? true,
            });
        }
    }, [currentSubject, isEdit]);

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

    const handleSelectChange = (name, value) => {
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

        if (!formData.name) newErrors.name = 'Subject name is required';
        if (!formData.code) newErrors.code = 'Subject code is required';
        if (!formData.subject_type) newErrors.subject_type = 'Subject type is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;
        setActionLoading(true);

        const submitData = {
            ...formData,
            theory_max_marks: parseInt(formData.theory_max_marks, 10),
            practical_max_marks: parseInt(formData.practical_max_marks, 10),
            board: formData.board || null,
        };

        try {
            if (isEdit) {
                await dispatch(updateSubject({ id, data: submitData })).unwrap();
                showToast.success('Subject updated successfully');
            } else {
                await dispatch(createSubject(submitData)).unwrap();
                showToast.success('Subject created successfully');
            }
            navigate('/academics/subjects');
        } catch (err) {
            console.error('Failed to save subject:', err);
            showToast.error('Failed to save subject: ' + getErrorMessage(err));
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
            <div className="space-y-6 max-w-4xl mx-auto">
                <PageHeader
                    title={isEdit ? 'Edit Subject' : 'Add Subject'}
                    description={isEdit ? 'Modify subject details and configuration' : 'Create a new subject in the curriculum'}
                    breadcrumbs={[
                        { label: 'Academics', href: '/academics' },
                        { label: 'Subjects', href: '/academics/subjects' },
                        { label: isEdit ? 'Edit' : 'New', active: true },
                    ]}
                />

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" />
                                Subject Details
                            </CardTitle>
                            <CardDescription>
                                Configure the subject properties, such as type, stream, and marks distribution.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Subject Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., Mathematics"
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">Subject Code <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder="e.g., MATH101"
                                        className={errors.code ? 'border-destructive' : ''}
                                    />
                                    {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject_type">Subject Type <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={formData.subject_type}
                                        onValueChange={(val) => handleSelectChange('subject_type', val)}
                                    >
                                        <SelectTrigger className={errors.subject_type ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CORE">Core Subject</SelectItem>
                                            <SelectItem value="ELECTIVE">Elective Subject</SelectItem>
                                            <SelectItem value="LANGUAGE">Language</SelectItem>
                                            <SelectItem value="EXTRA_CURRICULAR">Extra Curricular</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.subject_type && <p className="text-xs text-destructive">{errors.subject_type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="board">Board (Optional)</Label>
                                    <Select
                                        value={formData.board}
                                        onValueChange={(val) => handleSelectChange('board', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Boards (Common)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Boards (Common)</SelectItem>
                                            {(Array.isArray(boards) ? boards : []).map((b) => (
                                                <SelectItem key={b.id} value={b.id.toString()}>{b.name || b.board_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="class_group">Class Group <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={formData.class_group}
                                        onValueChange={(val) => handleSelectChange('class_group', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Class Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PRIMARY">Primary (Class 1-5)</SelectItem>
                                            <SelectItem value="MIDDLE">Middle (Class 6-8)</SelectItem>
                                            <SelectItem value="SECONDARY">Secondary (Class 9-10)</SelectItem>
                                            <SelectItem value="SENIOR_SECONDARY">Senior Secondary (Class 11-12)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stream">Stream <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={formData.stream}
                                        onValueChange={(val) => handleSelectChange('stream', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Stream" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GENERAL">General</SelectItem>
                                            <SelectItem value="SCI">Science</SelectItem>
                                            <SelectItem value="COM">Commerce</SelectItem>
                                            <SelectItem value="HUM">Humanities</SelectItem>
                                            <SelectItem value="VOC">Vocational</SelectItem>
                                            <SelectItem value="IB_GROUP">IB Group</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="theory_max_marks">Theory Max Marks</Label>
                                    <Input
                                        id="theory_max_marks"
                                        name="theory_max_marks"
                                        type="number"
                                        value={formData.theory_max_marks}
                                        onChange={handleChange}
                                        placeholder="e.g., 100"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="practical_max_marks">Practical Max Marks</Label>
                                    <Input
                                        id="practical_max_marks"
                                        name="practical_max_marks"
                                        type="number"
                                        value={formData.practical_max_marks}
                                        onChange={handleChange}
                                        placeholder="e.g., 0"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Enter subject description..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted/40 rounded-lg border border-border">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="has_practical"
                                        checked={formData.has_practical}
                                        onCheckedChange={(checked) => handleCheckboxChange('has_practical', checked)}
                                    />
                                    <Label htmlFor="has_practical" className="font-normal cursor-pointer">Has Practical Component</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_optional"
                                        checked={formData.is_optional}
                                        onCheckedChange={(checked) => handleCheckboxChange('is_optional', checked)}
                                    />
                                    <Label htmlFor="is_optional" className="font-normal cursor-pointer">Optional Subject</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => handleCheckboxChange('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active" className="font-normal cursor-pointer">Active</Label>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-border pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/academics/subjects')}
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
                                        {isEdit ? 'Update Subject' : 'Create Subject'}
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

export default SubjectForm;
