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
import { staffService } from '@/services/api';
import { StaffMember } from '@/types/models';

const StaffManagementScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDark } = useSelector((state: RootState) => state.theme);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async (pageNum = 1, search = '') => {
        try {
            setLoading(pageNum === 1);
            const response = await staffService.getStaffMembers({
                page: pageNum,
                page_size: 20,
                search: search || undefined,
            });

            // Handle both array and paginated response formats
            let staffData: StaffMember[] = [];
            let hasNextPage = false;

            if (Array.isArray(response)) {
                // Direct array response
                staffData = response;
                hasNextPage = false;
            } else if (response && response.results) {
                // Paginated response
                staffData = response.results;
                hasNextPage = !!response.next;
            } else {
                // Unexpected format
                console.warn('Unexpected API response format:', response);
                staffData = [];
            }

            if (pageNum === 1) {
                setStaff(staffData);
            } else {
                setStaff([...staff, ...staffData]);
            }

            setHasMore(hasNextPage);
            setPage(pageNum);
        } catch (error: any) {
            console.error('Error loading staff:', error);
            Alert.alert('Error', error.message || 'Failed to load staff');
            // Set empty array on error to prevent crashes
            if (pageNum === 1) {
                setStaff([]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadStaff(1, searchQuery);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.length >= 3 || query.length === 0) {
            loadStaff(1, query);
        }
    };

    const handleAddStaff = () => {
        // @ts-ignore
        navigation.navigate('AddStaff');
    };

    const handleEditStaff = (member: StaffMember) => {
        // @ts-ignore
        navigation.navigate('EditStaff', { staffId: member.id });
    };

    const handleViewStaff = (member: StaffMember) => {
        const userName = typeof member.user === 'object' ? `${member.user.first_name} ${member.user.last_name}` : 'N/A';
        const userEmail = typeof member.user === 'object' ? member.user.email : member.email;
        Alert.alert(
            'Staff Details',
            `Name: ${userName}\nEmployee ID: ${member.employee_id}\nDesignation: ${member.designation}\nDepartment: ${member.department || 'N/A'}\nEmail: ${userEmail}`,
            [{ text: 'OK' }]
        );
    };

    const handleDeleteStaff = (member: StaffMember) => {
        const userName = typeof member.user === 'object' ? `${member.user.first_name} ${member.user.last_name}` : 'this staff member';
        Alert.alert(
            'Delete Staff',
            `Are you sure you want to delete ${userName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await staffService.deleteStaffMember(member.id);
                            Alert.alert('Success', 'Staff member deleted successfully');
                            loadStaff(1, searchQuery);
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to delete staff member');
                        }
                    },
                },
            ]
        );
    };

    const getDesignationIcon = (designation: string) => {
        switch (designation) {
            case 'PRINCIPAL':
                return 'account-star';
            case 'VICE_PRINCIPAL':
                return 'account-tie';
            case 'TEACHER':
                return 'school';
            case 'LIBRARIAN':
                return 'book-open-variant';
            case 'ACCOUNTANT':
                return 'calculator';
            default:
                return 'account';
        }
    };

    const renderStaff = ({ item }: { item: StaffMember }) => (
        <Card style={styles.staffCard} elevation="sm">
            <TouchableOpacity
                onPress={() => handleViewStaff(item)}
                style={styles.staffContent}
            >
                <View style={styles.staffHeader}>
                    <View style={[styles.avatarContainer, { backgroundColor: isDark ? COLORS.secondary + '30' : COLORS.secondary + '15' }]}>
                        <Icon
                            name={getDesignationIcon(item.designation)}
                            size={40}
                            color={isDark ? COLORS.secondaryLight : COLORS.secondary}
                        />
                    </View>
                    <View style={styles.staffInfo}>
                        <Text style={[styles.staffName, { color: isDark ? COLORS.white : COLORS.gray900 }]}>
                            {typeof item.user === 'object' ? `${item.user.first_name} ${item.user.last_name}` : 'Staff Member'}
                        </Text>
                        <Text style={[styles.staffDetail, { color: isDark ? COLORS.gray400 : COLORS.gray600 }]}>
                            Employee ID: {item.employee_id}
                        </Text>
                        <Text style={[styles.staffDetail, { color: isDark ? COLORS.gray400 : COLORS.gray600 }]}>
                            {item.designation.replace(/_/g, ' ')}
                        </Text>
                        {item.department && (
                            <Text style={[styles.staffDetail, { color: isDark ? COLORS.gray400 : COLORS.gray600 }]}>
                                Dept: {item.department}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: isDark ? COLORS.info + '30' : COLORS.info + '15' }]}
                        onPress={() => handleEditStaff(item)}
                    >
                        <Icon name="pencil" size={18} color={isDark ? COLORS.infoLight : COLORS.info} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: isDark ? COLORS.error + '30' : COLORS.error + '15' }]}
                        onPress={() => handleDeleteStaff(item)}
                    >
                        <Icon name="delete" size={18} color={isDark ? COLORS.errorLight : COLORS.error} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Card>
    );

    const renderEmpty = () => {
        if (loading) {
            return <LoadingSpinner text="Loading staff..." />;
        }

        return (
            <EmptyState
                icon="account-group-outline"
                title="No staff members found"
                description={
                    searchQuery
                        ? 'Try a different search term'
                        : 'Add your first staff member to get started'
                }
                actionLabel={!searchQuery ? 'Add Staff' : undefined}
                onActionPress={!searchQuery ? handleAddStaff : undefined}
            />
        );
    };

    return (
        <ScreenWrapper>
            <Header
                title="Staff Management"
                subtitle={`${staff.length} staff members`}
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
                            placeholder="Search staff..."
                            value={searchQuery}
                            onChangeText={handleSearch}
                            leftIcon="magnify"
                            style={styles.searchInput}
                            placeholderTextColor={isDark ? COLORS.gray400 : undefined}
                        />
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddStaff}>
                        <Icon name="plus" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                {/* Staff List */}
                <FlatList
                    data={staff}
                    renderItem={renderStaff}
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
                            loadStaff(page + 1, searchQuery);
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
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: SPACING.md,
    },
    staffCard: {
        marginBottom: SPACING.md,
    },
    staffContent: {
        padding: SPACING.md,
    },
    staffHeader: {
        flexDirection: 'row',
        marginBottom: SPACING.sm,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.secondary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    staffInfo: {
        flex: 1,
    },
    staffName: {
        fontSize: FONTS.lg,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
        marginBottom: SPACING.xs,
    },
    staffDetail: {
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

export default StaffManagementScreen;
