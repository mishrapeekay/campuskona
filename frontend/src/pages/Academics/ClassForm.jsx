import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save,
    X,
    School,
    GraduationCap,
    BookOpen,
    Loader2,
    CheckCircle
} from 'lucide-react';
import {
    createClass,
    updateClass,
    fetchClassById,
    fetchBoards,
} from '../../store/slices/academicsSlice';
import { PageHeader } from '@/ui/composites';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/ui/primitives/card';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Textarea } from '@/ui/primitives/textarea';
import { Checkbox } from '@/ui/primitives/checkbox';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/ui/primitives/select';
import { Skeleton } from '@/ui/primitives/skeleton';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import showToast, { getErrorMessage } from '../../utils/toast';

const ClassForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const { currentClass, boards, loading } = useSelector((state) => state.academics);

    const [formData, setFormData] = useState({
        name: '',
        grade_level: '',
        board_id: '',
        stream: '', // Optional
        description: '',
        is_active: true,
    });

    const [actionLoading, setActionLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        dispatch(fetchBoards());
        if (isEditMode) {
            dispatch(fetchClassById(id));
        }
    }, [dispatch, id, isEditMode]);

    useEffect(() => {
        if (isEditMode && currentClass) {
            setFormData({
                name: currentClass.name || '',
                grade_level: currentClass.grade_level || '',
                board_id: currentClass.board?.id?.toString() || currentClass.board_id?.toString() || '',
                stream: currentClass.stream || '',
                description: currentClass.description || '',
                is_active: currentClass.is_active ?? true,
            });
        }
    }, [currentClass, isEditMode]);

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
            [name]: value === 'none' ? '' : value,
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
        if (!formData.name) newErrors.name = 'Class name is required';
        if (!formData.grade_level) newErrors.grade_level = 'Grade level is required';
        if (!formData.board_id) newErrors.board_id = 'Board is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setActionLoading(true);
        try {
            if (isEditMode) {
                await dispatch(updateClass({ id, data: formData })).unwrap();
                showToast.success('Class updated successfully');
            } else {
                await dispatch(createClass(formData)).unwrap();
                showToast.success('Class created successfully');
            }
            navigate('/academics/classes');
        } catch (err) {
            console.error('Failed to save class:', err);
            showToast.error('Failed to save class: ' + getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && isEditMode && !currentClass) {
        return (
            <AnimatedPage>
                <div className="space-y-6 max-w-2xl mx-auto">
                    <Skeleton className="h-10 w-48" />
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="max-w-3xl mx-auto space-y-6">
                <PageHeader
                    title={isEditMode ? 'Edit Class' : 'Create New Class'}
                    description={isEditMode ? `Update details for ${formData.name}` : 'Set up a new class and assign it to a board'}
                    breadcrumbs={[
                        { label: 'Academics', href: '/academics' },
                        { label: 'Classes', href: '/academics/classes' },
                        { label: isEditMode ? 'Edit' : 'New', active: true }
                    ]}
                />

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <School className="w-5 h-5 text-primary" />
                                Class Details
                            </CardTitle>
                            <CardDescription>
                                Configure the grade level, board affiliation, and stream.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Class Name <span className="text-destructive">*</span></Label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Class 10"
                                            className={`pl-9 ${errors.name ? 'border-destructive' : ''}`}
                                        />
                                    </div>
                                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="grade_level">Grade Level <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={formData.grade_level}
                                        onValueChange={(val) => handleSelectChange('grade_level', val)}
                                    >
                                        <SelectTrigger className={errors.grade_level ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select Grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[...Array(12)].map((_, i) => (
                                                <SelectItem key={i + 1} value={(i + 1).toString()}>Grade {i + 1}</SelectItem>
                                            ))}
                                            <SelectItem value="LKG">LKG</SelectItem>
                                            <SelectItem value="UKG">UKG</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.grade_level && <p className="text-xs text-destructive">{errors.grade_level}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="board_id">Board <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={formData.board_id}
                                        onValueChange={(val) => handleSelectChange('board_id', val)}
                                    >
                                        <SelectTrigger className={errors.board_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select Board" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(Array.isArray(boards) ? boards : []).map((board) => (
                                                <SelectItem key={board.id} value={board.id.toString()}>
                                                    {board.name || board.board_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.board_id && <p className="text-xs text-destructive">{errors.board_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stream">Stream (Optional)</Label>
                                    <Select
                                        value={formData.stream}
                                        onValueChange={(val) => handleSelectChange('stream', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Stream (if applicable)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="SCIENCE">Science</SelectItem>
                                            <SelectItem value="COMMERCE">Commerce</SelectItem>
                                            <SelectItem value="ARTS">Arts/Humanities</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Additional details about this class..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center space-x-2 p-4 bg-muted/40 rounded-lg border border-border">
                                <Checkbox
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => handleCheckboxChange('is_active', checked)}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer font-normal">
                                    Class is <span className="font-semibold text-foreground">Active</span> and available for student enrollment
                                </Label>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-border pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/academics/classes')}
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
                                        {isEditMode ? 'Update Class' : 'Create Class'}
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

export default ClassForm;
