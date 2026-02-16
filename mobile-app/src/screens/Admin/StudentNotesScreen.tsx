import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    RefreshControl,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, RADIUS, SHADOWS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { studentService } from '@/services/api';

// Types
interface Note {
    id: string;
    student: string;
    note_type: 'ACADEMIC' | 'BEHAVIORAL' | 'DISCIPLINARY' | 'ACHIEVEMENT' | 'CONCERN' | 'GENERAL';
    title: string;
    content: string;
    is_confidential: boolean;
    created_at: string;
    created_by_name?: string;
}

const NOTE_TYPES = [
    { label: 'General', value: 'GENERAL', color: COLORS.gray500 },
    { label: 'Academic', value: 'ACADEMIC', color: COLORS.primary },
    { label: 'Behavioral', value: 'BEHAVIORAL', color: COLORS.warning },
    { label: 'Achievement', value: 'ACHIEVEMENT', color: COLORS.success },
    { label: 'Concern', value: 'CONCERN', color: COLORS.error },
    { label: 'Disciplinary', value: 'DISCIPLINARY', color: COLORS.error },
];

const StudentNotesScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { studentId, studentName } = route.params || {};

    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [noteType, setNoteType] = useState('GENERAL');
    const [isConfidential, setIsConfidential] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (studentId) {
            loadNotes();
        }
    }, [studentId]);

    const loadNotes = async () => {
        try {
            setLoading(true);
            const data = await studentService.getStudentNotes(studentId);
            // Sort by date desc
            const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setNotes(sorted);
        } catch (error) {
            console.error('Error loading notes:', error);
            Alert.alert('Error', 'Failed to load notes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAddNote = async () => {
        if (!noteTitle.trim() || !noteContent.trim()) {
            Alert.alert('Validation Error', 'Please enter both title and content');
            return;
        }

        try {
            setSubmitting(true);
            await studentService.createStudentNote({
                student: studentId,
                title: noteTitle,
                content: noteContent,
                note_type: noteType as any,
                is_confidential: isConfidential
            });

            // Reset and reload
            setModalVisible(false);
            setNoteTitle('');
            setNoteContent('');
            setNoteType('GENERAL');
            setIsConfidential(false);
            loadNotes();
            Alert.alert('Success', 'Note added successfully');
        } catch (error) {
            console.error('Error creating note:', error);
            Alert.alert('Error', 'Failed to save note');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteNote = (noteId: string) => {
        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await studentService.deleteStudentNote(noteId);
                            setNotes(prev => prev.filter(n => n.id !== noteId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete note');
                        }
                    }
                }
            ]
        );
    };

    const getNoteColor = (type: string) => {
        return NOTE_TYPES.find(t => t.value === type)?.color || COLORS.gray500;
    };

    const renderNote = ({ item }: { item: Note }) => (
        <Card style={[styles.noteCard, { borderLeftColor: getNoteColor(item.note_type) }]} elevation="sm">
            <View style={styles.noteHeader}>
                <View style={styles.noteTypeContainer}>
                    <Icon name="label" size={14} color={getNoteColor(item.note_type)} />
                    <Text style={[styles.noteType, { color: getNoteColor(item.note_type) }]}>
                        {NOTE_TYPES.find(t => t.value === item.note_type)?.label || item.note_type}
                    </Text>
                    {item.is_confidential && (
                        <View style={styles.confidentialBadge}>
                            <Icon name="eye-off" size={12} color={COLORS.gray600} />
                            <Text style={styles.confidentialText}>Confidential</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.noteDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>

            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteContent}>{item.content}</Text>

            <View style={styles.noteFooter}>
                <Text style={styles.authorText}>By: {item.created_by_name || 'Staff'}</Text>
                <TouchableOpacity onPress={() => handleDeleteNote(item.id)}>
                    <Icon name="delete-outline" size={20} color={COLORS.gray400} />
                </TouchableOpacity>
            </View>
        </Card>
    );

    return (
        <ScreenWrapper>
            <Header
                title="Student Notes"
                subtitle={`Notes for ${studentName || 'Student'}`}
                showBackButton
            />

            <View style={styles.container}>
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <FlatList
                        data={notes}
                        renderItem={renderNote}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotes(); }} />
                        }
                        ListEmptyComponent={
                            <EmptyState
                                icon="note-text-outline"
                                title="No notes found"
                                description="Add notes to track student behavior or progress."
                            />
                        }
                    />
                )}
            </View>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Icon name="plus" size={24} color={COLORS.white} />
            </TouchableOpacity>

            {/* Add Note Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Note</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={24} color={COLORS.gray600} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.label}>Category</Text>
                            <View style={styles.typeGrid}>
                                {NOTE_TYPES.map(type => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={[
                                            styles.typeChip,
                                            noteType === type.value && { backgroundColor: type.color + '20', borderColor: type.color }
                                        ]}
                                        onPress={() => setNoteType(type.value)}
                                    >
                                        <Text style={[
                                            styles.typeText,
                                            noteType === type.value && { color: type.color, fontWeight: 'bold' }
                                        ]}>{type.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Short subject"
                                value={noteTitle}
                                onChangeText={setNoteTitle}
                            />

                            <Text style={styles.label}>Details</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Enter detailed note..."
                                value={noteContent}
                                onChangeText={setNoteContent}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />

                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => setIsConfidential(!isConfidential)}
                            >
                                <Icon
                                    name={isConfidential ? "checkbox-marked" : "checkbox-blank-outline"}
                                    size={24}
                                    color={COLORS.primary}
                                />
                                <Text style={styles.checkboxLabel}>Mark as Confidential</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.saveButton, submitting && { opacity: 0.7 }]}
                            onPress={handleAddNote}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <Text style={styles.saveButtonText}>Saving...</Text>
                            ) : (
                                <Text style={styles.saveButtonText}>Save Note</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray50,
    },
    listContent: {
        padding: SPACING.md,
        paddingBottom: 80, // Space for FAB
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.md,
    },
    noteCard: {
        marginBottom: SPACING.md,
        borderLeftWidth: 4,
        padding: SPACING.md,
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    noteTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    noteType: {
        fontSize: FONTS.sm,
        fontFamily: FONTS.bold,
        textTransform: 'uppercase',
    },
    confidentialBadge: {
        backgroundColor: COLORS.gray100,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginLeft: 8,
    },
    confidentialText: {
        fontSize: 10,
        color: COLORS.gray600,
        fontFamily: FONTS.medium,
    },
    noteDate: {
        fontSize: FONTS.xs,
        color: COLORS.gray500,
    },
    noteTitle: {
        fontSize: FONTS.md,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
        marginBottom: 4,
    },
    noteContent: {
        fontSize: FONTS.sm,
        color: COLORS.gray700,
        lineHeight: 20,
        marginBottom: SPACING.md,
    },
    noteFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
        paddingTop: SPACING.sm,
    },
    authorText: {
        fontSize: FONTS.xs,
        color: COLORS.gray500,
        fontStyle: 'italic',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: RADIUS.lg,
        borderTopRightRadius: RADIUS.lg,
        padding: SPACING.lg,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    modalTitle: {
        fontSize: FONTS.xl,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
    },
    modalBody: {
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: FONTS.sm,
        fontFamily: FONTS.bold,
        color: COLORS.gray700,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    input: {
        backgroundColor: COLORS.gray50,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        fontSize: FONTS.md,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    textArea: {
        minHeight: 100,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    typeChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.gray300,
    },
    typeText: {
        fontSize: FONTS.xs,
        color: COLORS.gray600,
        fontFamily: FONTS.medium,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.lg,
        gap: SPACING.sm,
    },
    checkboxLabel: {
        fontSize: FONTS.md,
        color: COLORS.gray800,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        marginBottom: 20, // Safe area
    },
    saveButtonText: {
        color: COLORS.white,
        fontFamily: FONTS.bold,
        fontSize: FONTS.md,
    },
});

export default StudentNotesScreen;
