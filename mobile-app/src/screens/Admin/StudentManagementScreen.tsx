import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, RADIUS } from '@/constants';
import { RootState } from '@/store';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { studentService } from '@/services/api';
import { Student } from '@/types/models';

const StudentManagementScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDark } = useSelector((state: RootState) => state.theme);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async (pageNum = 1, search = '') => {
        try {
            setLoading(pageNum === 1);
            const response = await studentService.getStudents({
                page: pageNum,
                page_size: 20,
                search: search || undefined,
            });

            // Handle both array and paginated response formats
            let studentData: Student[] = [];
            let hasNextPage = false;

            if (Array.isArray(response)) {
                // Direct array response
                studentData = response;
                hasNextPage = false;
            } else if (response && response.results) {
                // Paginated response
                studentData = response.results;
                hasNextPage = !!response.next;
            } else {
                // Unexpected format
                console.warn('Unexpected API response format:', response);
                studentData = [];
            }

            if (pageNum === 1) {
                setStudents(studentData);
            } else {
                setStudents([...students, ...studentData]);
            }

            setHasMore(hasNextPage);
            setPage(pageNum);
        } catch (error: any) {
            console.error('Error loading students:', error);
            Alert.alert('Error', error.message || 'Failed to load students');
            // Set empty array on error to prevent crashes
            if (pageNum === 1) {
                setStudents([]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadStudents(1, searchQuery);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.length >= 3 || query.length === 0) {
            loadStudents(1, query);
        }
    };

    const handleAddStudent = () => {
        navigation.navigate('AddStudent' as never);
    };

    const handleEditStudent = (student: Student) => {
        (navigation as any).navigate('EditStudent', { studentId: student.id });
    };

    const handleViewStudent = (student: Student) => {
        Alert.alert(
            'Student Details',
            `Name: ${student.first_name} ${student.last_name}\nAdmission No: ${student.admission_number}\nClass: ${student.current_class || 'Not assigned'}`,
            [{ text: 'OK' }]
        );
    };

    const handleDeleteStudent = (student: Student) => {
        Alert.alert(
            'Delete Student',
            `Are you sure you want to delete ${student.first_name} ${student.last_name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await studentService.deleteStudent(student.id);
                            Alert.alert('Success', 'Student deleted successfully');
                            loadStudents(1, searchQuery);
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to delete student');
                        }
                    },
                },
            ]
        );
    };

    const renderStudent = ({ item }: { item: Student }) => (
        <Card style={styles.studentCard} elevation="sm">
            <TouchableOpacity
                onPress={() => handleViewStudent(item)}
                style={styles.studentContent}
            >
                <View style={styles.studentHeader}>
                    <View style={[styles.avatarContainer, { backgroundColor: isDark ? COLORS.primary + '30' : COLORS.primary + '15' }]}>
                        <Icon name="account" size={40} color={isDark ? COLORS.primaryLight : COLORS.primary} />
                    </View>
                    <View style={styles.studentInfo}>
                        <Text style={[styles.studentName, { color: isDark ? COLORS.white : COLORS.gray900 }]}>
                            {item.first_name} {item.last_name}
                        </Text>
                        <Text style={[styles.studentDetail, { color: isDark ? COLORS.gray400 : COLORS.gray600 }]}>
                            Admission: {item.admission_number}
                        </Text>
                        <Text style={[styles.studentDetail, { color: isDark ? COLORS.gray400 : COLORS.gray600 }]}>
                            Class: {item.current_class || 'Not assigned'}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: isDark ? COLORS.info + '30' : COLORS.info + '15' }]}
                        onPress={() => handleEditStudent(item)}
                    >
                        <Icon name="pencil" size={18} color={isDark ? COLORS.infoLight : COLORS.info} />
                    </TouchableOpacity>

                    {/* Added Student Notes Button */}
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: isDark ? COLORS.warning + '30' : COLORS.warning + '15' }]}
                        onPress={() => (navigation as any).navigate('StudentNotes', {
                            studentId: item.id,
                            studentName: `${item.first_name} ${item.last_name}`
                        })}
                    >
                        <Icon name="note-text-outline" size={18} color={isDark ? COLORS.warningLight : COLORS.warning} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: isDark ? COLORS.error + '30' : COLORS.error + '15' }]}
                        onPress={() => handleDeleteStudent(item)}
                    >
                        <Icon name="delete" size={18} color={isDark ? COLORS.errorLight : COLORS.error} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Card>
    );

    const renderEmpty = () => {
        if (loading) {
            return <LoadingSpinner text="Loading students..." />;
        }

        return (
            <EmptyState
                icon="account-group-outline"
                title="No students found"
                description={
                    searchQuery
                        ? 'Try a different search term'
                        : 'Add your first student to get started'
                }
                actionLabel={!searchQuery ? 'Add Student' : undefined}
                onActionPress={!searchQuery ? handleAddStudent : undefined}
            />
        );
    };

    return (
        <ScreenWrapper>
            <Header
                title="Student Management"
                subtitle={`${students.length} students`}
                showBackButton
            />

            <View style={[styles.container, { backgroundColor: isDark ? COLORS.gray900 : COLORS.gray50 }]}>
                {/* Search and Add Button */}
                <View style={[styles.topBar, {
                    backgroundColor: isDark ? COLORS.gray800 : COLORS.white,
                    borderBottomColor: isDark ? COLORS.gray700 : COLORS.border
                }]}>
                    <View style={styles.searchContainer}>
                        <Input
                            placeholder="Search students..."
                            value={searchQuery}
                            onChangeText={handleSearch}
                            leftIcon="magnify"
                            style={styles.searchInput}
                            placeholderTextColor={isDark ? COLORS.gray400 : undefined}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: COLORS.primary }]}
                        onPress={handleAddStudent}
                    >
                        <Icon name="plus" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                {/* Students List */}
                <FlatList
                    data={students}
                    renderItem={renderStudent}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={isDark ? COLORS.white : undefined}
                        />
                    }
                    ListEmptyComponent={renderEmpty}
                    onEndReached={() => {
                        if (hasMore && !loading) {
                            loadStudents(page + 1, searchQuery);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                />
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray50,
    },
    topBar: {
        flexDirection: 'row',
        padding: SPACING.md,
        gap: SPACING.sm,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    searchContainer: {
        flex: 1,
    },
    searchInput: {
        marginBottom: 0,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: SPACING.md,
    },
    studentCard: {
        marginBottom: SPACING.md,
    },
    studentContent: {
        padding: SPACING.md,
    },
    studentHeader: {
        flexDirection: 'row',
        marginBottom: SPACING.sm,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: FONTS.lg,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
        marginBottom: SPACING.xs,
    },
    studentDetail: {
        fontSize: FONTS.sm,
        fontFamily: FONTS.regular,
        color: COLORS.gray600,
        marginBottom: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.sm,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default StudentManagementScreen;
