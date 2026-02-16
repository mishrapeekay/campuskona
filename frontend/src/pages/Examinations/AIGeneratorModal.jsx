import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, FormControl, InputLabel,
    Select, Chip, Box, Typography, CircularProgress,
    Alert, Divider, List, ListItem, ListItemText, ListItemSecondaryAction,
    IconButton, Checkbox, FormControlLabel
} from '@mui/material';
import { Trash2Icon as DeleteIcon, PencilIcon as EditIcon, SparklesIcon as AIIcon } from 'lucide-react';
import { generateAIQuestions, clearGeneratedQuestions } from '../../store/slices/aiQuestionsSlice';

const BLOOM_LEVELS = [
    { value: 'REMEMBER', label: 'Remember (Recall)' },
    { value: 'UNDERSTAND', label: 'Understand (Explain)' },
    { value: 'APPLY', label: 'Apply (Use)' },
    { value: 'ANALYZE', label: 'Analyze (Connections)' },
    { value: 'EVALUATE', label: 'Evaluate (Justify)' },
    { value: 'CREATE', label: 'Create (Produce)' }
];

const AIGeneratorModal = ({ open, onClose, lessonData }) => {
    const dispatch = useDispatch();
    const { generating, generatedQuestions, error } = useSelector(state => state.aiQuestions);

    const [formData, setFormData] = useState({
        subject_id: lessonData?.subject_id || '',
        class_id: lessonData?.class_id || '',
        lesson_plan_item_id: lessonData?.id || '',
        count: 5,
        bloom_levels: ['REMEMBER', 'UNDERSTAND'],
        content_text: ''
    });

    const [step, setStep] = useState(1); // 1: Config, 2: Review

    useEffect(() => {
        if (generatedQuestions.length > 0) {
            setStep(2);
        }
    }, [generatedQuestions]);

    const handleGenerate = () => {
        dispatch(generateAIQuestions(formData));
    };

    const handleSave = () => {
        // Dispatch save action
        onClose();
        setStep(1);
        dispatch(clearGeneratedQuestions());
    };

    const handleCancel = () => {
        setStep(1);
        dispatch(clearGeneratedQuestions());
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AIIcon color="primary" /> {step === 1 ? 'AI Question Generator' : 'Review AI Generated Questions'}
            </DialogTitle>

            <DialogContent dividers>
                {step === 1 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Generate Multiple Choice Questions (MCQs) automatically based on Bloom's Taxonomy and lesson content.
                        </Typography>

                        <Alert severity="info" variant="outlined">
                            Lesson: <strong>{lessonData?.topic || 'Select a topic'}</strong>
                        </Alert>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                label="Number of Questions"
                                type="number"
                                value={formData.count}
                                onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel>Bloom's Taxonomy Levels</InputLabel>
                                <Select
                                    multiple
                                    value={formData.bloom_levels}
                                    onChange={(e) => setFormData({ ...formData, bloom_levels: e.target.value })}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} size="small" />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {BLOOM_LEVELS.map((level) => (
                                        <MenuItem key={level.value} value={level.value}>
                                            <Checkbox checked={formData.bloom_levels.indexOf(level.value) > -1} />
                                            <ListItemText primary={level.label} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <TextField
                            label="Additional Context / Content (Optional)"
                            multiline
                            rows={4}
                            placeholder="Paste specific lesson text here for better questions..."
                            value={formData.content_text}
                            onChange={(e) => setFormData({ ...formData, content_text: e.target.value })}
                            fullWidth
                        />
                    </Box>
                ) : (
                    <Box>
                        <List>
                            {generatedQuestions.map((q, idx) => (
                                <Box key={idx} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        Q{idx + 1}: {q.question_text}
                                    </Typography>
                                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                        <Chip size="small" label={q.bloom_level} color="primary" variant="outlined" />
                                        <Chip size="small" label={q.difficulty} color="secondary" variant="outlined" />
                                    </Box>
                                    <List dense>
                                        {q.options.map((opt, oIdx) => (
                                            <ListItem key={oIdx}>
                                                <FormControlLabel
                                                    control={<Checkbox checked={opt.is_correct} readOnly color="success" size="small" />}
                                                    label={opt.text}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="caption" color="text.secondary">
                                        Explanation: {q.explanation}
                                    </Typography>
                                </Box>
                            ))}
                        </List>
                    </Box>
                )}

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error.message || 'An error occurred'}</Alert>}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleCancel}>Cancel</Button>
                {step === 1 ? (
                    <Button
                        variant="contained"
                        onClick={handleGenerate}
                        disabled={generating}
                        startIcon={generating ? <CircularProgress size={20} /> : <AIIcon />}
                    >
                        {generating ? 'Generating...' : 'Generate Questions'}
                    </Button>
                ) : (
                    <>
                        <Button onClick={() => setStep(1)} variant="outlined">Modify Config</Button>
                        <Button onClick={handleSave} variant="contained" color="success">
                            Save to Question Bank
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default AIGeneratorModal;
