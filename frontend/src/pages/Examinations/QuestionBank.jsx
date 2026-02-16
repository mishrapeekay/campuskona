import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Plus,
    Search,
    Sparkles,
    Eye,
    Trash2,
    Filter,
    RefreshCw,
    MoreHorizontal
} from 'lucide-react';
import { fetchQuestions } from '../../store/slices/aiQuestionsSlice';
import AIGeneratorModal from './AIGeneratorModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Skeleton } from '@/ui/primitives/skeleton';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/ui/primitives/dropdown-menu';

const QuestionBank = () => {
    const dispatch = useDispatch();
    const { questions, loading, pagination } = useSelector(state => state.aiQuestions);
    const [searchTerm, setSearchTerm] = useState('');
    const [isGeneratorOpen, setGeneratorOpen] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(fetchQuestions({ page }));
    }, [dispatch, page]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        // Debounce logic would be implemented here in a real scenario
    };

    const getBloomColor = (level) => {
        switch (level) {
            case 'REMEMBER': return 'default';
            case 'UNDERSTAND': return 'primary';
            case 'APPLY': return 'success';
            case 'ANALYZE': return 'warning';
            case 'EVALUATE': return 'destructive';
            case 'CREATE': return 'info';
            default: return 'secondary';
        }
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Question Bank"
                    description="Manage and generate assessment questions"
                    action={
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setGeneratorOpen(true)}
                                className="border-violet-500 text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/20"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                AI Generator
                            </Button>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                New Question
                            </Button>
                        </div>
                    }
                />

                <Card>
                    <CardHeader className="pb-3 border-b border-border">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search questions by text or topic..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <Button variant="outline" size="sm">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => dispatch(fetchQuestions({ page }))}>
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-medium">
                                    <tr>
                                        <th className="px-6 py-3 text-left w-1/3">Question</th>
                                        <th className="px-6 py-3 text-left">Subject</th>
                                        <th className="px-6 py-3 text-left">Bloom Level</th>
                                        <th className="px-6 py-3 text-left">Difficulty</th>
                                        <th className="px-6 py-3 text-left">Source</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan={6} className="px-6 py-4">
                                                    <Skeleton className="h-6 w-full" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : questions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                                No questions found. Try adjusting your search or add a new question.
                                            </td>
                                        </tr>
                                    ) : (
                                        questions.map((q) => (
                                            <tr key={q.id} className="hover:bg-muted/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <p className="line-clamp-2 font-medium text-foreground">{q.question_text}</p>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {q.subject_name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={getBloomColor(q.bloom_level)} className="uppercase text-[10px]">
                                                        {q.bloom_level}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`
                                                        inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
                                                        ${q.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                            q.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                'bg-rose-50 text-rose-700 border-rose-200'}
                                                    `}>
                                                        {q.difficulty}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {q.is_ai_generated ? (
                                                        <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 gap-1">
                                                            <Sparkles className="w-3 h-3" /> AI
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Manual</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon">
                                                            <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon">
                                                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                            <span className="text-sm text-muted-foreground">
                                Showing {questions.length} of {pagination?.count || 0} questions
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pagination?.next}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Generator Modal */}
                <AIGeneratorModal
                    open={isGeneratorOpen}
                    onClose={() => setGeneratorOpen(false)}
                    lessonData={null}
                />
            </div>
        </AnimatedPage>
    );
};

export default QuestionBank;
