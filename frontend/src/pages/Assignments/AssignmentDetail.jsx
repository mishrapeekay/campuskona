import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchAssignmentById,
  fetchSubmissions,
  gradeSubmission,
  clearCurrentAssignment,
  clearError,
} from '../../store/slices/assignmentsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Skeleton } from '@/ui/primitives/skeleton';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { ArrowLeft, Edit, FileText, Clock, CheckCircle, User, Download, AlertTriangle } from 'lucide-react';

const STATUS_BADGE_VARIANTS = {
  DRAFT: 'secondary',
  PUBLISHED: 'success',
  ARCHIVED: 'warning',
  PENDING: 'info',
  SUBMITTED: 'default',
  GRADED: 'success',
  LATE: 'destructive',
  RETURNED: 'warning',
};

const AssignmentDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { currentAssignment, submissions, error } = useSelector((state) => state.assignments);

  const [gradingId, setGradingId] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '' });

  const canEdit = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'].includes(user?.user_type);
  const assignment = currentAssignment.data;

  useEffect(() => {
    dispatch(fetchAssignmentById(id));
    dispatch(fetchSubmissions({ assignment: id }));
    return () => {
      dispatch(clearCurrentAssignment());
      dispatch(clearError());
    };
  }, [dispatch, id]);

  const handleGrade = async (submissionId) => {
    try {
      await dispatch(
        gradeSubmission({
          id: submissionId,
          data: {
            marks_obtained: parseFloat(gradeForm.marks),
            feedback: gradeForm.feedback,
          },
        })
      ).unwrap();
      setGradingId(null);
      setGradeForm({ marks: '', feedback: '' });
      dispatch(fetchSubmissions({ assignment: id }));
    } catch {
      // error in state
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (currentAssignment.loading) {
    return (
      <AnimatedPage>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (!assignment) {
    return (
      <AnimatedPage>
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Assignment not found.</p>
          <Button onClick={() => navigate('/assignments')}>
            Back to Assignments
          </Button>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/assignments')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{assignment.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {assignment.subject_name || 'No subject'} &middot;{' '}
                {assignment.class_name || ''} / {assignment.section_name || ''}
              </p>
            </div>
          </div>
          {canEdit && (
            <Button onClick={() => navigate(`/assignments/${id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl">
            {typeof error === 'string' ? error : 'An error occurred'}
          </div>
        )}

        {/* Assignment Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {assignment.description || 'No description provided.'}
                </p>
                {assignment.attachment && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <FileText className="w-4 h-4 text-primary" />
                    <a
                      href={assignment.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Download Attachment
                      <Download className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={STATUS_BADGE_VARIANTS[assignment.status] || 'secondary'}>
                    {assignment.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Due Date</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(assignment.due_date)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Max Marks</span>
                  <span className="text-sm font-medium text-foreground">
                    {assignment.max_marks || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm text-muted-foreground">{formatDate(assignment.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submissions Section */}
        {canEdit && (
          <Card>
            <CardHeader>
              <CardTitle>
                Submissions ({submissions.count})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submissions.loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (submissions.data || []).length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No submissions yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Submitted</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Marks</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">File</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(submissions.data || []).map((sub) => (
                        <tr key={sub.id} className="hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-foreground">
                              {sub.student_name || sub.student || '-'}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{formatDate(sub.submitted_at)}</td>
                          <td className="py-3 px-4">
                            <Badge variant={STATUS_BADGE_VARIANTS[sub.status] || 'secondary'}>
                              {sub.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {sub.marks_obtained != null
                              ? `${sub.marks_obtained}/${assignment.max_marks || '-'}`
                              : '-'}
                          </td>
                          <td className="py-3 px-4">
                            {sub.file ? (
                              <a
                                href={sub.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-xs flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                Download
                              </a>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {sub.status !== 'GRADED' ? (
                              gradingId === sub.id ? (
                                <div className="flex items-center gap-2 justify-end">
                                  <input
                                    type="number"
                                    placeholder="Marks"
                                    value={gradeForm.marks}
                                    onChange={(e) =>
                                      setGradeForm((f) => ({ ...f, marks: e.target.value }))
                                    }
                                    className="w-20 px-2 py-1 text-sm border border-input rounded-md bg-background text-foreground focus:ring-1 focus:ring-ring"
                                    min="0"
                                    max={assignment.max_marks || undefined}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Feedback"
                                    value={gradeForm.feedback}
                                    onChange={(e) =>
                                      setGradeForm((f) => ({ ...f, feedback: e.target.value }))
                                    }
                                    className="w-32 px-2 py-1 text-sm border border-input rounded-md bg-background text-foreground focus:ring-1 focus:ring-ring"
                                  />
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleGrade(sub.id)}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setGradingId(null);
                                      setGradeForm({ marks: '', feedback: '' });
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => setGradingId(sub.id)}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Grade
                                </Button>
                              )
                            ) : (
                              <span className="text-xs text-emerald-500 font-medium flex items-center justify-end gap-1">
                                <CheckCircle className="w-3 h-3" /> Graded
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AnimatedPage>
  );
};

export default AssignmentDetail;
