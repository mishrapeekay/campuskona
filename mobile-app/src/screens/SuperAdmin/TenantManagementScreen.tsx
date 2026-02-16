import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TenantsStackParamList } from '@/types/navigation';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

// Import from tenant service
import { tenantService } from '@/services/api/tenant.service';

interface Tenant {
  id: string;
  school_name: string;
  school_code: string;
  subdomain: string;
  status: 'active' | 'trial' | 'expired' | 'suspended';
  subscription_plan: 'basic' | 'standard' | 'premium' | 'enterprise';
  created_at: string;
  trial_ends_at?: string;
  subscription_ends_at?: string;
  stats: {
    total_students: number;
    active_users: number;
    total_classes: number;
    storage_used_mb: number;
  };
  contact: {
    admin_name: string;
    admin_email: string;
    admin_phone: string;
  };
  last_activity: string;
}

type FilterStatus = 'all' | 'active' | 'trial' | 'expired' | 'suspended';

const TenantManagementScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TenantsStackParamList>>();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('all');

  // Filter options
  const filters: { id: FilterStatus; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'view-grid' },
    { id: 'active', label: 'Active', icon: 'check-circle' },
    { id: 'trial', label: 'Trial', icon: 'clock-outline' },
    { id: 'expired', label: 'Expired', icon: 'alert-circle' },
    { id: 'suspended', label: 'Suspended', icon: 'pause-circle' },
  ];

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tenants, searchQuery, selectedFilter]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const response = await tenantService.getAllTenants();
      const schools = Array.isArray(response) ? response : (response.results || []);
      const mappedTenants: Tenant[] = schools.map((school: any) => {
        let status: Tenant['status'] = 'active';
        if (!school.is_active) status = 'suspended';
        else if (school.is_trial) status = 'trial';
        else if (school.days_until_expiry !== null && school.days_until_expiry < 0) status = 'expired';

        return {
          id: school.id,
          school_name: school.name,
          school_code: school.code,
          subdomain: school.subdomain,
          status,
          subscription_plan: (school.subscription_name?.toLowerCase() || 'basic') as any,
          created_at: school.created_at,
          subscription_ends_at: school.subscription_end_date,
          stats: {
            total_students: school.total_students || 0,
            active_users: school.active_users || 0,
            total_classes: school.total_classes || 0,
            storage_used_mb: 0 // Storage still placeholder
          },
          contact: {
            admin_name: 'Administrator',
            admin_email: school.email,
            admin_phone: school.phone
          },
          last_activity: school.updated_at || school.created_at,
        };
      });
      setTenants(mappedTenants);

    } catch (error) {
      console.error('Failed to load tenants:', error);
      Alert.alert('Error', 'Failed to load tenants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTenants();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let result = [...tenants];

    // Apply status filter
    if (selectedFilter !== 'all') {
      result = result.filter((tenant) => tenant.status === selectedFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (tenant) =>
          tenant.school_name.toLowerCase().includes(query) ||
          tenant.subdomain.toLowerCase().includes(query) ||
          tenant.school_code.toLowerCase().includes(query)
      );
    }

    setFilteredTenants(result);
  };

  const handleSuspendTenant = async (tenant: Tenant) => {
    Alert.alert(
      'Suspend School',
      `Are you sure you want to suspend ${tenant.school_name}? This will immediately disable access for all users.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend',
          style: 'destructive',
          onPress: async () => {
            try {
              await tenantService.updateTenant(tenant.id, { is_active: false });
              Alert.alert('Success', `${tenant.school_name} has been suspended.`);
              loadTenants();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to suspend school.');
            }
          },
        },
      ]
    );
  };

  const handleResumeTenant = async (tenant: Tenant) => {
    Alert.alert(
      'Resume School',
      `Resume access for ${tenant.school_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resume',
          onPress: async () => {
            try {
              await tenantService.updateTenant(tenant.id, { is_active: true });
              Alert.alert('Success', `${tenant.school_name} has been resumed.`);
              loadTenants();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to resume school.');
            }
          },
        },
      ]
    );
  };

  const handleExtendTrial = async (tenant: Tenant) => {
    Alert.alert(
      'Extend Trial',
      `Extend trial period for ${tenant.school_name} by 15 days?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Extend',
          onPress: async () => {
            // Calculate new end date (current date + 15 days)
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + 15);
            try {
              await tenantService.updateTenant(tenant.id, {
                subscription_end_date: newDate.toISOString().split('T')[0]
              });
              Alert.alert('Success', 'Trial period extended by 15 days.');
              loadTenants();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to extend trial.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteTenant = async (tenant: Tenant) => {
    Alert.alert(
      'Delete School',
      `Are you sure you want to DELETE ${tenant.school_name}?\n\n⚠️ This action is IRREVERSIBLE and will permanently delete:\n- All student data\n- All staff data\n- All academic records\n- All financial records\n\nType "${tenant.school_code}" to confirm deletion.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'Confirm Deletion',
              `Type "${tenant.school_code}" to confirm:`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async (inputText) => {
                    if (inputText === tenant.school_code) {
                      try {
                        await tenantService.deleteTenant(tenant.id);
                        Alert.alert('Success', `${tenant.school_name} has been deleted.`);
                        loadTenants();
                      } catch (error: any) {
                        Alert.alert('Error', error.message || 'Failed to delete school.');
                      }
                    } else {
                      Alert.alert('Error', 'School code does not match. Deletion cancelled.');
                    }
                  },
                },
              ],
              'plain-text'
            );
          },
        },
      ]
    );
  };

  const navigateToDetail = (tenant: Tenant) => {
    navigation.navigate('TenantDetail', { tenantId: tenant.id });
  };

  const getStatusConfig = (status: Tenant['status']) => {
    switch (status) {
      case 'active':
        return {
          color: COLORS.success,
          bgColor: `${COLORS.success}15`,
          icon: 'check-circle',
          label: 'Active',
        };
      case 'trial':
        return {
          color: COLORS.info,
          bgColor: `${COLORS.info}15`,
          icon: 'clock-outline',
          label: 'Trial',
        };
      case 'expired':
        return {
          color: COLORS.error,
          bgColor: `${COLORS.error}15`,
          icon: 'alert-circle',
          label: 'Expired',
        };
      case 'suspended':
        return {
          color: COLORS.warning,
          bgColor: `${COLORS.warning}15`,
          icon: 'pause-circle',
          label: 'Suspended',
        };
      default:
        return {
          color: COLORS.gray600,
          bgColor: `${COLORS.gray600}15`,
          icon: 'help-circle',
          label: 'Unknown',
        };
    }
  };

  const getPlanConfig = (plan: Tenant['subscription_plan']) => {
    switch (plan) {
      case 'basic':
        return { color: COLORS.gray600, label: 'Basic' };
      case 'standard':
        return { color: COLORS.info, label: 'Standard' };
      case 'premium':
        return { color: COLORS.purple, label: 'Premium' };
      case 'enterprise':
        return { color: COLORS.primary, label: 'Enterprise' };
      default:
        return { color: COLORS.gray500, label: plan || 'N/A' };
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatExpiryDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 30) return `${diffDays} days`;

    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderTenantCard = ({ item }: { item: Tenant }) => {
    const statusConfig = getStatusConfig(item.status);
    const planConfig = getPlanConfig(item.subscription_plan);

    return (
      <TouchableOpacity
        onPress={() => navigateToDetail(item)}
        activeOpacity={0.7}
        style={styles.cardTouchable}
      >
        <Card style={styles.tenantCard}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconContainer, { backgroundColor: statusConfig.bgColor }]}>
                <Icon name="school" size={24} color={statusConfig.color} />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.schoolName} numberOfLines={1}>
                  {item.school_name}
                </Text>
                <Text style={styles.subdomain}>{item.subdomain}.schoolmgmt.com</Text>
              </View>
            </View>
          </View>

          {/* Status and Plan Badges */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: statusConfig.bgColor }]}>
              <Icon name={statusConfig.icon} size={14} color={statusConfig.color} />
              <Text style={[styles.badgeText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: `${planConfig.color}15` }]}>
              <Icon name="star" size={14} color={planConfig.color} />
              <Text style={[styles.badgeText, { color: planConfig.color }]}>
                {planConfig.label}
              </Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="account-group" size={18} color={COLORS.primary} />
              <Text style={styles.statValue}>{item.stats.total_students}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="account-multiple" size={18} color={COLORS.success} />
              <Text style={styles.statValue}>{item.stats.active_users}</Text>
              <Text style={styles.statLabel}>Users</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="google-classroom" size={18} color={COLORS.info} />
              <Text style={styles.statValue}>{item.stats.total_classes}</Text>
              <Text style={styles.statLabel}>Classes</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="database" size={18} color={COLORS.warning} />
              <Text style={styles.statValue}>
                {(item.stats.storage_used_mb / 1024).toFixed(1)}GB
              </Text>
              <Text style={styles.statLabel}>Storage</Text>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.contactRow}>
            <Icon name="account-tie" size={16} color={COLORS.gray600} />
            <Text style={styles.contactText}>{item.contact.admin_name}</Text>
          </View>

          {/* Last Activity and Expiry */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Icon name="clock-outline" size={14} color={COLORS.gray500} />
              <Text style={styles.infoText}>Last active {formatDate(item.last_activity)}</Text>
            </View>
            {(item.trial_ends_at || item.subscription_ends_at) && (
              <View style={styles.infoItem}>
                <Icon name="calendar-clock" size={14} color={COLORS.gray500} />
                <Text style={styles.infoText}>
                  {item.status === 'trial' ? 'Trial ends' : 'Expires'} in{' '}
                  {formatExpiryDate(item.trial_ends_at || item.subscription_ends_at!)}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            {item.status === 'active' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.suspendButton]}
                onPress={() => handleSuspendTenant(item)}
              >
                <Icon name="pause" size={16} color={COLORS.warning} />
                <Text style={[styles.actionButtonText, { color: COLORS.warning }]}>Suspend</Text>
              </TouchableOpacity>
            )}
            {item.status === 'suspended' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.resumeButton]}
                onPress={() => handleResumeTenant(item)}
              >
                <Icon name="play" size={16} color={COLORS.success} />
                <Text style={[styles.actionButtonText, { color: COLORS.success }]}>Resume</Text>
              </TouchableOpacity>
            )}
            {item.status === 'trial' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.extendButton]}
                onPress={() => handleExtendTrial(item)}
              >
                <Icon name="clock-plus-outline" size={16} color={COLORS.info} />
                <Text style={[styles.actionButtonText, { color: COLORS.info }]}>Extend</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => navigateToDetail(item)}
            >
              <Icon name="eye" size={16} color={COLORS.primary} />
              <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>View</Text>
            </TouchableOpacity>
            {(item.status === 'expired' || item.status === 'suspended') && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteTenant(item)}
              >
                <Icon name="delete" size={16} color={COLORS.error} />
                <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="domain-off" size={80} color={COLORS.gray400} />
      <Text style={styles.emptyTitle}>No Tenants Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'No tenants match your search criteria.'
          : 'Get started by creating your first school.'}
      </Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Tenant Management</Text>
            <Text style={styles.subtitle}>{filteredTenants.length} schools</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              // TODO: Navigate to TenantSetupWizard
              // navigation.navigate('TenantSetupWizard');
            }}
          >
            <Icon name="plus" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={COLORS.gray500} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, subdomain, or code..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.gray500}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={COLORS.gray500} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          {filters.map((filter) => {
            const isSelected = selectedFilter === filter.id;
            const count =
              filter.id === 'all'
                ? tenants.length
                : tenants.filter((t) => t.status === filter.id).length;

            return (
              <TouchableOpacity
                key={filter.id}
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Icon
                  name={filter.icon}
                  size={16}
                  color={isSelected ? COLORS.white : COLORS.gray600}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}
                >
                  {filter.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tenant List */}
        <FlatList
          data={filteredTenants}
          renderItem={renderTenantCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={renderEmptyState}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: FONTS['2xl'],
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  subtitle: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    marginTop: SPACING.xs,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.gray900,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    gap: SPACING.xs,
  },
  filterChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  filterChipTextSelected: {
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  cardTouchable: {
    marginBottom: SPACING.md,
  },
  tenantCard: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  subdomain: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    gap: SPACING.xs,
  },
  badgeText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.semibold,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray200,
  },
  statItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  statLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  contactText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
    borderWidth: 1,
  },
  suspendButton: {
    borderColor: COLORS.warning,
    backgroundColor: `${COLORS.warning}10`,
  },
  resumeButton: {
    borderColor: COLORS.success,
    backgroundColor: `${COLORS.success}10`,
  },
  extendButton: {
    borderColor: COLORS.info,
    backgroundColor: `${COLORS.info}10`,
  },
  viewButton: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  deleteButton: {
    borderColor: COLORS.error,
    backgroundColor: `${COLORS.error}10`,
  },
  actionButtonText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyTitle: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.gray700,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    textAlign: 'center',
    paddingHorizontal: SPACING['2xl'],
  },
});

export default TenantManagementScreen;
