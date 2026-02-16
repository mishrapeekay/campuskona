import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchLessonPlanById,
    createLessonPlan,
    updateLessonPlan,
    clearCurrentPlan
} from '../../store/slices/lessonPlansSlice';
import { fetchSections, fetchSubjects } from '../../store/slices/academicsSlice';
import { PageHeader } from '@/ui/composites';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/ui/primitives/select';
import { suggestLessonPlan } from '../../api/academics';
import showToast, { getErrorMessage } from '../../utils/toast';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Check,
    Sparkles,
    Calendar,
    BookOpen,
    Loader2,
    Save,
    X,
    FileText,
    ListChecks,
    Target,
    Paperclip
} from 'lucide-react';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Badge } from '@/ui/primitives/badge';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/ui/primitives/tabs';
import { Textarea } from '@/ui/primitives/textarea';

const LessonPlanForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isEdit = !!id;

    const { currentPlan, loading: planLoading } = useSelector((state) => state.lessonPlans);
    const { sections, subjects } = useSelector((state) => state.academics);

    // Initial State with expanded fields for advanced planning
    const [formData, setFormData] = useState({
        section: '',
        subject: '',
        topic: '',
        start_date: '',
        end_date: '',
        status: 'DRAFT',
        objectives: [],     // List of strings
        materials: '',      // Markdown/Text
        procedure: '',      // Markdown/Text
        homework: '',       // Markdown/Text
        assessment: ''      // Markdown/Text
    });

    const [isSuggesting, setIsSuggesting] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [newObjective, setNewObjective] = useState('');

    useEffect(() => {
        dispatch(fetchSections());
        dispatch(fetchSubjects());
        if (isEdit) {
            dispatch(fetchLessonPlanById(id));
        }
        return () => dispatch(clearCurrentPlan());
    }, [dispatch, id, isEdit]);

    useEffect(() => {
        if (isEdit && currentPlan.data) {
            setFormData({
                section: currentPlan.data.class_section?.id?.toString() || '',
                subject: currentPlan.data.subject?.id?.toString() || '',
                topic: currentPlan.data.topic || '',
                start_date: currentPlan.data.start_date || '',
                end_date: currentPlan.data.end_date || '',
                status: currentPlan.data.status || 'DRAFT',
                objectives: currentPlan.data.objectives || [], // Assuming backend supports JSON/Array
                materials: currentPlan.data.materials || '',
                procedure: currentPlan.data.procedure || '',
                homework: currentPlan.data.homework || '',
                assessment: currentPlan.data.assessment || ''
            });
        }
    }, [currentPlan.data, isEdit]);

    const handleAISuggest = async () => {
        if (!formData.subject || !formData.section || !formData.topic) {
            showToast('Please select a subject, section and enter a topic first', 'warning');
            return;
        }

        const subjectObj = subjects.data.find(s => s.id === parseInt(formData.subject));
        const sectionObj = sections.data.find(s => s.id === parseInt(formData.section));

        try {
            setIsSuggesting(true);
            const response = await suggestLessonPlan({
                subject: subjectObj?.name,
                class_name: sectionObj?.name,
                unit_title: formData.topic,
                unit_description: "Generate comprehensive lesson plan including objectives, procedure, and materials."
            });

            // Assuming API returns structured data, otherwise map fields appropriately
            if (response.data) {
                setFormData(prev => ({
                    ...prev,
                    objectives: response.data.objectives || prev.objectives,
                    materials: response.data.materials || prev.materials,
                    procedure: response.data.procedure || prev.procedure,
                    homework: response.data.homework || prev.homework,
                    assessment: response.data.assessment || prev.assessment
                }));
                showToast('Lesson plan generated successfully!', 'success');
            }
        } catch (error) {
            showToast('AI assistant is currently unavailable: ' + getErrorMessage(error), 'error');
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleAddObjective = () => {
        if (newObjective.trim()) {
            setFormData(prev => ({ ...prev, objectives: [...prev.objectives, newObjective.trim()] }));
            setNewObjective('');
        }
    };

    const handleRemoveObjective = (index) => {
        setFormData(prev => ({ ...prev, objectives: prev.objectives.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.section || !formData.subject || !formData.start_date || !formData.topic) {
            showToast('Please fill all required fields', 'warning');
            return;
        }

        const payload = { ...formData };
        setActionLoading(true);
        try {
            const action = isEdit ? updateLessonPlan({ id, data: payload }) : createLessonPlan(payload);
            const result = await dispatch(action);

            if (!result.error) {
                showToast(`Lesson plan ${isEdit ? 'updated' : 'created'} successfully`, 'success');
                navigate('/academics/lesson-plans');
            } else {
                showToast(getErrorMessage(result.payload), 'error');
            }
        } catch (error) {
            showToast('An unexpected error occurred', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    if (planLoading && isEdit) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <AnimatedPage>
            <div className="max-w-5xl mx-auto p-6 space-y-8 pb-20">
                <PageHeader
                    title={isEdit ? "Edit Lesson Plan" : "Create Lesson Plan"}
                    description="Design structured and engaging lessons for your students."
                    breadcrumbs={[
                        { label: 'Lesson Plans', href: '/academics/lesson-plans' },
                        { label: isEdit ? 'Edit' : 'Create', active: true },
                    ]}
                    action={
                        <Button variant="outline" onClick={() => navigate('/academics/lesson-plans')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to List
                        </Button>
                    }
                />

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Core Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Lesson Details</CardTitle>
                                <CardDescription>Define the core parameters of your lesson.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="section">Class & Section</Label>
                                        <Select
                                            value={formData.section}
                                            onValueChange={(val) => setFormData({ ...formData, section: val })}
                                        >
                                            <SelectTrigger id="section">
                                                <SelectValue placeholder="Select Class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections.data?.map((s) => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>
                                                        {s.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Select
                                            value={formData.subject}
                                            onValueChange={(val) => setFormData({ ...formData, subject: val })}
                                        >
                                            <SelectTrigger id="subject">
                                                <SelectValue placeholder="Select Subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.data?.map((s) => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>
                                                        {s.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="topic">Topic / Unit Title</Label>
                                    <Input
                                        id="topic"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        placeholder="e.g. Introduction to Photosynthesis"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_date">Start Date</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end_date">End Date</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div>
                                    <CardTitle>Lesson Content</CardTitle>
                                    <CardDescription>Structured plan for the class execution.</CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleAISuggest}
                                    disabled={isSuggesting}
                                    className="bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-300"
                                >
                                    {isSuggesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                    Auto-Generate Content
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Tabs defaultValue="objectives" className="space-y-4">
                                    <TabsList className="grid grid-cols-4 w-full">
                                        <TabsTrigger value="objectives" className="text-xs">Objectives</TabsTrigger>
                                        <TabsTrigger value="materials" className="text-xs">Materials</TabsTrigger>
                                        <TabsTrigger value="procedure" className="text-xs">Procedure</TabsTrigger>
                                        <TabsTrigger value="assessment" className="text-xs">Assessment</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="objectives" className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input
                                                value={newObjective}
                                                onChange={(e) => setNewObjective(e.target.value)}
                                                placeholder="Add a learning objective..."
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddObjective())}
                                            />
                                            <Button type="button" onClick={handleAddObjective} size="icon"><Plus className="w-4 h-4" /></Button>
                                        </div>
                                        <div className="space-y-2">
                                            {formData.objectives.length === 0 && (
                                                <p className="text-sm text-muted-foreground text-center py-4 italic">No objectives added yet.</p>
                                            )}
                                            {formData.objectives.map((obj, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-muted/30 p-2 rounded-md group">
                                                    <Target className="w-4 h-4 text-primary shrink-0" />
                                                    <span className="text-sm flex-1">{obj}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleRemoveObjective(idx)}
                                                    >
                                                        <X className="w-3 h-3 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="materials" className="space-y-2">
                                        <Label>Resources & Materials Needed</Label>
                                        <Textarea
                                            value={formData.materials}
                                            onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                                            className="min-h-[200px]"
                                            placeholder="- Textbook Page 45&#10;- Projector&#10;- Lab Equipment"
                                        />
                                    </TabsContent>

                                    <TabsContent value="procedure" className="space-y-2">
                                        <Label>Instructional Procedure</Label>
                                        <Textarea
                                            value={formData.procedure}
                                            onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                                            className="min-h-[300px] font-mono text-sm"
                                            placeholder="## Introduction (5 mins)&#10;...&#10;&#10;## Main Activity (20 mins)&#10;..."
                                        />
                                    </TabsContent>

                                    <TabsContent value="assessment" className="space-y-2">
                                        <Label>Assessment & Homework</Label>
                                        <Textarea
                                            value={formData.assessment}
                                            onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                                            className="min-h-[150px]"
                                            placeholder="How will student understanding be measured?"
                                        />
                                        <Label className="mt-4 block">Homework</Label>
                                        <Textarea
                                            value={formData.homework}
                                            onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
                                            className="min-h-[100px]"
                                            placeholder="Assignments for next class..."
                                        />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Status & Resources */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Plan Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="SUBMITTED">Submitted for Review</SelectItem>
                                        <SelectItem value="APPROVED">Approved</SelectItem>
                                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="pt-4 border-t flex flex-col gap-3">
                                    <Button type="submit" disabled={actionLoading} className="w-full">
                                        {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        {isEdit ? 'Update Plan' : 'Create Plan'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => navigate('/academics/lesson-plans')} className="w-full">
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Attachments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                                    <Paperclip className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-xs text-muted-foreground">Drag & drop files or click to upload</p>
                                </div>
                                <div className="mt-4 space-y-2">
                                    {/* Mock list of attachments */}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                                        <FileText className="w-4 h-4" />
                                        <span className="truncate flex-1">worksheet_v1.pdf</span>
                                        <X className="w-3 h-3 cursor-pointer hover:text-destructive" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AnimatedPage>
    );
};

export default LessonPlanForm;
