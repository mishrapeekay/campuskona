import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Check,
  AlertCircle,
  FileText,
  Calendar,
  BookOpen,
  Upload,
  Paperclip,
  X,
  Loader2
} from 'lucide-react';
import {
  createAssignment,
  updateAssignment,
  fetchAssignmentById,
  clearCurrentAssignment,
  clearError,
} from '../../store/slices/assignmentsSlice';
import { fetchClasses, fetchSections, fetchSubjects } from '../../store/slices/academicsSlice';
import { PageHeader } from '@/ui/composites';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/ui/primitives/card';
import { Skeleton } from '@/ui/primitives/skeleton';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Label } from '@/ui/primitives/label';
import { Input } from '@/ui/primitives/input';
import { Textarea } from '@/ui/primitives/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/ui/primitives/select'; // Assuming these exist, otherwise fallback to native select

const AssignmentForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const { currentAssignment, error } = useSelector((state) => state.assignments);
  const { classes, sections, subjects } = useSelector((state) => state.academics);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    section: '',
    class_id: '',
    due_date: '',
    max_marks: '',
    status: 'DRAFT',
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchSubjects());
    if (isEditing) {
      dispatch(fetchAssignmentById(id));
    }
    return () => {
      dispatch(clearCurrentAssignment());
      dispatch(clearError());
    };
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (isEditing && currentAssignment.data) {
      const a = currentAssignment.data;
      setFormData({
        title: a.title || '',
        description: a.description || '',
        subject: a.subject || '',
        section: a.section || '',
        class_id: a.class_id || a.class_obj || '',
        due_date: a.due_date ? a.due_date.slice(0, 10) : '',
        max_marks: a.max_marks || '',
        status: a.status || 'DRAFT',
      });
      if (a.class_id || a.class_obj) {
        dispatch(fetchSections({ class_id: a.class_id || a.class_obj }));
      }
    }
  }, [currentAssignment.data, isEditing, dispatch]);

  useEffect(() => {
    if (formData.class_id) {
      dispatch(fetchSections({ class_id: formData.class_id }));
    }
  }, [formData.class_id, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'class_id') {
        updated.section = '';
      }
      return updated;
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let payload;
      if (file) {
        payload = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
          if (v !== '' && k !== 'class_id') payload.append(k, v);
        });
        if (formData.class_id) payload.append('class_id', formData.class_id);
        payload.append('attachment', file);
      } else {
        payload = {};
        Object.entries(formData).forEach(([k, v]) => {
          if (v !== '' && k !== 'class_id') payload[k] = v;
        });
        if (formData.class_id) payload.class_id = formData.class_id;
      }

      if (isEditing) {
        await dispatch(updateAssignment({ id, data: payload })).unwrap();
      } else {
        await dispatch(createAssignment(payload)).unwrap();
      }
      setSubmissionSuccess(true);
      setTimeout(() => navigate('/assignments'), 1000);
    } catch (err) {
      console.error('Failed to save assignment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isEditing && currentAssignment.loading) {
    return (
      <AnimatedPage>
        <div className="space-y-6 max-w-3xl mx-auto">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
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
          title={isEditing ? 'Edit Assignment' : 'Create Assignment'}
          description={isEditing ? `Update details for ${formData.title}` : 'Design a new assignment for your students'}
          breadcrumbs={[
            { label: 'Academics', href: '/academics' },
            { label: 'Assignments', href: '/assignments' },
            { label: isEditing ? 'Edit' : 'New', active: true }
          ]}
        />

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Assignment Details
              </CardTitle>
              <CardDescription>
                Fill in the details for the assignment relative to curriculum.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {typeof error === 'string' ? error : 'An error occurred while saving.'}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    placeholder="e.g. Chapter 3: Laws of Motion - Exercises"
                    value={formData.title}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="class_id">Class</Label>
                  <select
                    id="class_id"
                    name="class_id"
                    required
                    value={formData.class_id}
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Class</option>
                    {(classes?.data || classes || []).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section">Section (Optional)</Label>
                  <select
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">All Sections</option>
                    {(sections?.data || sections || []).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Subject</option>
                    {(subjects?.data || subjects || []).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={5}
                  placeholder="Detailed instructions for the assignment..."
                  value={formData.description}
                  onChange={handleChange}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      id="due_date"
                      name="due_date"
                      required
                      value={formData.due_date}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_marks">Maximum Marks</Label>
                  <input
                    type="number"
                    id="max_marks"
                    name="max_marks"
                    min="0"
                    placeholder="e.g. 20"
                    value={formData.max_marks}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachment">Attachment (Optional)</Label>
                <div className="border-2 border-dashed border-input rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
                  {file ? (
                    <div className="flex items-center gap-2 text-sm text-foreground bg-primary/10 px-3 py-2 rounded-md">
                      <Paperclip className="w-4 h-4 text-primary" />
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="ml-2 hover:bg-destructive/10 rounded-full p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-foreground font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOC, JPG up to 10MB</p>
                      <input
                        type="file"
                        id="attachment"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => document.getElementById('attachment').click()}
                      >
                        Select File
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/assignments')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || submissionSuccess}
                className={submissionSuccess ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : submissionSuccess ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Update Assignment' : 'Create Assignment'}
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

export default AssignmentForm;
