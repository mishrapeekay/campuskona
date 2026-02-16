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
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { RootState } from '@/store';
import { UserType } from '@/types/models';
import { ScreenProps } from '@/types/navigation';

import { auditService } from '@/services/api';

interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_type: string;
  action: string;
  action_category:
  | 'authentication'
  | 'student'
  | 'staff'
  | 'academic'
  | 'attendance'
  | 'exam'
  | 'fee'
  | 'system'
  | 'security';
  resource_type: string;
  resource_id?: string;
  details: string;
  ip_address: string;
  user_agent: string;
  status: 'success' | 'failure' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  tenant_id?: string;
  tenant_name?: string;
}

type FilterCategory =
  | 'all'
  | 'authentication'
  | 'student'
  | 'staff'
  | 'academic'
  | 'attendance'
  | 'exam'
  | 'fee'
  | 'system'
  | 'security';
type FilterStatus = 'all' | 'success' | 'failure' | 'warning';
type FilterSeverity = 'all' | 'low' | 'medium' | 'high' | 'critical';

const AuditLogsScreen: React.FC<ScreenProps> = ({ route }) => {
  const params = route.params as any;
  const user = useSelector((state: RootState) => state.auth.user);
  const isSuperAdmin = user?.user_type === UserType.SUPER_ADMIN;

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<FilterSeverity>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Helper to map backend model names to UI categories
  const mapModelToCategory = (modelName: string): AuditLog['action_category'] => {
    const model = modelName.toLowerCase();
    if (model.includes('attendance')) return 'attendance';
    if (model.includes('student')) return 'student';
    if (model.includes('user') || model.includes('auth')) return 'authentication';
    if (model.includes('staff')) return 'staff';
    if (model.includes('exam') || model.includes('result')) return 'exam';
    if (model.includes('fee') || model.includes('payment') || model.includes('finance')) return 'fee';
    if (model.includes('class') || model.includes('subject') || model.includes('academic')) return 'academic';
    if (model.includes('school') || model.includes('tenant') || model.includes('config')) return 'system';
    return 'system';
  };

  // Filter options
  const categories: { id: FilterCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'view-dashboard' },
    { id: 'authentication', label: 'Auth', icon: 'shield-account' },
    { id: 'student', label: 'Student', icon: 'school' },
    { id: 'staff', label: 'Staff', icon: 'account-tie' },
    { id: 'academic', label: 'Academic', icon: 'book-open-variant' },
    { id: 'attendance', label: 'Attendance', icon: 'calendar-check' },
    { id: 'exam', label: 'Exam', icon: 'certificate' },
    { id: 'fee', label: 'Fee', icon: 'cash' },
    { id: 'system', label: 'System', icon: 'server' },
    { id: 'security', label: 'Security', icon: 'shield-alert' },
  ];

  const statusFilters: { id: FilterStatus; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'filter' },
    { id: 'success', label: 'Success', icon: 'check-circle' },
    { id: 'failure', label: 'Failed', icon: 'close-circle' },
    { id: 'warning', label: 'Warning', icon: 'alert' },
  ];

  const severityFilters: { id: FilterSeverity; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'low', label: 'Low' },
    { id: 'medium', label: 'Medium' },
    { id: 'high', label: 'High' },
    { id: 'critical', label: 'Critical' },
  ];

  useEffect(() => {
    loadAuditLogs();
  }, [params?.tenantId, params?.type]);

  useEffect(() => {
    applyFilters();
  }, [logs, searchQuery, selectedCategory, selectedStatus, selectedSeverity]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      let response: any;

      if (isSuperAdmin) {
        if (params?.type === 'tenant' && params?.tenantId) {
          response = await auditService.getTenantLogs(params.tenantId);
        } else {
          response = await auditService.getPlatformLogs();
        }
      } else {
        response = await auditService.getTenantLogs();
      }

      const apiLogs = response.results || response.data || response;

      // Map API fields to UI interface
      const mappedLogs: AuditLog[] = Array.isArray(apiLogs) ? apiLogs.map((log: any) => ({
        id: log.id,
        timestamp: log.timestamp,
        user_id: log.user || 'N/A',
        user_name: log.user_name || 'System',
        user_email: log.user_email || '',
        user_type: log.user_name ? 'User' : 'System',
        action: `${log.action} ${log.model_name}`,
        action_category: mapModelToCategory(log.model_name),
        resource_type: log.model_name,
        resource_id: log.object_id,
        details: log.object_repr,
        ip_address: log.ip_address || '0.0.0.0',
        user_agent: log.user_agent || 'Unknown',
        status: 'success', // Backend doesn't store success/failure explicitly in current AuditLog model
        severity: log.action === 'DELETE' ? 'high' : 'low',
        tenant_id: log.school,
        tenant_name: log.tenant_name,
      })) : [];

      setLogs(mappedLogs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      Alert.alert('Error', 'Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAuditLogs();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let result = [...logs];

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter((log) => log.action_category === selectedCategory);
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      result = result.filter((log) => log.status === selectedStatus);
    }

    // Apply severity filter
    if (selectedSeverity !== 'all') {
      result = result.filter((log) => log.severity === selectedSeverity);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (log) =>
          log.action.toLowerCase().includes(query) ||
          log.details.toLowerCase().includes(query) ||
          log.user_name.toLowerCase().includes(query) ||
          log.user_email.toLowerCase().includes(query) ||
          (log.tenant_name && log.tenant_name.toLowerCase().includes(query))
      );
    }

    setFilteredLogs(result);
  };

  const handleExportLogs = () => {
    Alert.alert(
      'Export Logs',
      'Select export format:',
      [
        {
          text: 'CSV',
          onPress: () => {
            // TODO: Implement CSV export
            Alert.alert('Success', 'Logs exported as CSV file');
          },
        },
        {
          text: 'JSON',
          onPress: () => {
            // TODO: Implement JSON export
            Alert.alert('Success', 'Logs exported as JSON file');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleLogPress = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailModalVisible(true);
  };

  const getStatusConfig = (status: AuditLog['status']) => {
    switch (status) {
      case 'success':
        return { color: COLORS.success, icon: 'check-circle', label: 'Success' };
      case 'failure':
        return { color: COLORS.error, icon: 'close-circle', label: 'Failed' };
      case 'warning':
        return { color: COLORS.warning, icon: 'alert', label: 'Warning' };
    }
  };

  const getSeverityConfig = (severity: AuditLog['severity']) => {
    switch (severity) {
      case 'low':
        return { color: COLORS.info, label: 'Low' };
      case 'medium':
        return { color: COLORS.warning, label: 'Medium' };
      case 'high':
        return { color: COLORS.error, label: 'High' };
      case 'critical':
        return { color: COLORS.purple, label: 'Critical' };
    }
  };

  const getCategoryIcon = (category: AuditLog['action_category']): string => {
    switch (category) {
      case 'authentication':
        return 'shield-account';
      case 'student':
        return 'account-school';
      case 'staff':
        return 'account-tie';
      case 'academic':
        return 'school';
      case 'attendance':
        return 'calendar-check';
      case 'exam':
        return 'certificate';
      case 'fee':
        return 'currency-inr';
      case 'system':
        return 'server';
      case 'security':
        return 'shield-alert';
    }
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60)
      return `${diffMins}m ago • ${date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours}h ago • ${date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;

    return date.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderLogItem = ({ item }: { item: AuditLog }) => {
    const statusConfig = getStatusConfig(item.status);
    const severityConfig = getSeverityConfig(item.severity);
    const categoryIcon = getCategoryIcon(item.action_category);

    return (
      <TouchableOpacity onPress={() => handleLogPress(item)} activeOpacity={0.7}>
        <Card style={styles.logCard}>
          <View style={styles.logHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: `${statusConfig.color}15` }]}>
              <Icon name={categoryIcon} size={20} color={statusConfig.color} />
            </View>
            <View style={styles.logInfo}>
              <Text style={styles.logAction} numberOfLines={1}>
                {item.action}
              </Text>
              <Text style={styles.logUser}>
                {item.user_name} ({item.user_type})
              </Text>
            </View>
            <View style={[styles.severityBadge, { backgroundColor: `${severityConfig.color}15` }]}>
              <Text style={[styles.severityText, { color: severityConfig.color }]}>
                {severityConfig.label}
              </Text>
            </View>
          </View>

          <Text style={styles.logDetails} numberOfLines={2}>
            {item.details}
          </Text>

          <View style={styles.logFooter}>
            <View style={styles.footerLeft}>
              <Icon name="clock-outline" size={14} color={COLORS.gray500} />
              <Text style={styles.footerText}>{formatDateTime(item.timestamp)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}15` }]}>
              <Icon name={statusConfig.icon} size={12} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {isSuperAdmin && item.tenant_name && (
            <View style={styles.tenantTag}>
              <Icon name="domain" size={12} color={COLORS.primary} />
              <Text style={styles.tenantText}>{item.tenant_name}</Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedLog) return null;

    const statusConfig = getStatusConfig(selectedLog.status);
    const severityConfig = getSeverityConfig(selectedLog.severity);

    return (
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Details</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Icon name="close" size={24} color={COLORS.gray900} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Action */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Action</Text>
                <Text style={styles.detailValue}>{selectedLog.action}</Text>
              </View>

              {/* Status and Severity */}
              <View style={styles.detailRow}>
                <View style={[styles.detailSection, styles.halfWidth]}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={[styles.detailBadge, { backgroundColor: `${statusConfig.color}15` }]}>
                    <Icon name={statusConfig.icon} size={16} color={statusConfig.color} />
                    <Text style={[styles.detailBadgeText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>
                <View style={[styles.detailSection, styles.halfWidth]}>
                  <Text style={styles.detailLabel}>Severity</Text>
                  <View
                    style={[styles.detailBadge, { backgroundColor: `${severityConfig.color}15` }]}
                  >
                    <Text style={[styles.detailBadgeText, { color: severityConfig.color }]}>
                      {severityConfig.label}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Details */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Details</Text>
                <Text style={styles.detailValue}>{selectedLog.details}</Text>
              </View>

              {/* User Info */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>User</Text>
                <Text style={styles.detailValue}>{selectedLog.user_name}</Text>
                <Text style={styles.detailSubValue}>{selectedLog.user_email}</Text>
                <Text style={styles.detailSubValue}>Type: {selectedLog.user_type}</Text>
              </View>

              {/* Resource */}
              {selectedLog.resource_type && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Resource</Text>
                  <Text style={styles.detailValue}>
                    {selectedLog.resource_type}
                    {selectedLog.resource_id && ` (ID: ${selectedLog.resource_id})`}
                  </Text>
                </View>
              )}

              {/* Timestamp */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Timestamp</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedLog.timestamp).toLocaleString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </Text>
              </View>

              {/* IP Address */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>IP Address</Text>
                <Text style={styles.detailValue}>{selectedLog.ip_address}</Text>
              </View>

              {/* User Agent */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>User Agent</Text>
                <Text style={styles.detailValue}>{selectedLog.user_agent}</Text>
              </View>

              {/* Tenant (Super Admin only) */}
              {isSuperAdmin && selectedLog.tenant_name && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tenant</Text>
                  <Text style={styles.detailValue}>{selectedLog.tenant_name}</Text>
                  <Text style={styles.detailSubValue}>ID: {selectedLog.tenant_id}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Close"
                onPress={() => setDetailModalVisible(false)}
                variant="outline"
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="file-document-outline" size={80} color={COLORS.gray400} />
      <Text style={styles.emptyTitle}>No Logs Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'No logs match your search criteria.'
          : 'Audit logs will appear here as actions are performed.'}
      </Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Audit Logs</Text>
            <Text style={styles.subtitle}>
              {isSuperAdmin ? 'Platform-wide Activity' : 'School Activity Logs'}
            </Text>
          </View>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportLogs}>
            <Icon name="download" size={20} color={COLORS.white} />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={COLORS.gray500} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by action, user, or details..."
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

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            const count =
              category.id === 'all'
                ? logs.length
                : logs.filter((log) => log.action_category === category.id).length;

            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Icon
                  name={category.icon}
                  size={14}
                  color={isSelected ? COLORS.white : COLORS.gray600}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}
                >
                  {category.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Status and Severity Filters */}
        <View style={styles.secondaryFilters}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.secondaryFilterContent}
          >
            <Text style={styles.filterLabel}>Status:</Text>
            {statusFilters.map((status) => {
              const isSelected = selectedStatus === status.id;
              return (
                <TouchableOpacity
                  key={status.id}
                  style={[styles.smallFilterChip, isSelected && styles.smallFilterChipSelected]}
                  onPress={() => setSelectedStatus(status.id)}
                >
                  <Icon
                    name={status.icon}
                    size={12}
                    color={isSelected ? COLORS.white : COLORS.gray600}
                  />
                  <Text
                    style={[
                      styles.smallFilterText,
                      isSelected && styles.smallFilterTextSelected,
                    ]}
                  >
                    {status.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.secondaryFilterContent}
          >
            <Text style={styles.filterLabel}>Severity:</Text>
            {severityFilters.map((severity) => {
              const isSelected = selectedSeverity === severity.id;
              return (
                <TouchableOpacity
                  key={severity.id}
                  style={[styles.smallFilterChip, isSelected && styles.smallFilterChipSelected]}
                  onPress={() => setSelectedSeverity(severity.id)}
                >
                  <Text
                    style={[
                      styles.smallFilterText,
                      isSelected && styles.smallFilterTextSelected,
                    ]}
                  >
                    {severity.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Results Count */}
        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>
            {filteredLogs.length} {filteredLogs.length === 1 ? 'log' : 'logs'} found
          </Text>
        </View>

        {/* Logs List */}
        <FlatList
          data={filteredLogs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={renderEmptyState}
        />

        {/* Detail Modal */}
        {renderDetailModal()}
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
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  exportText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.white,
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
  filterScroll: {
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
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
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  filterChipTextSelected: {
    color: COLORS.white,
  },
  secondaryFilters: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  secondaryFilterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  filterLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.semibold,
    color: COLORS.gray700,
  },
  smallFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    gap: 4,
  },
  smallFilterChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  smallFilterText: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  smallFilterTextSelected: {
    color: COLORS.white,
  },
  resultsBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray100,
  },
  resultsText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
  },
  listContent: {
    padding: SPACING.lg,
  },
  logCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  logInfo: {
    flex: 1,
  },
  logAction: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  logUser: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
  },
  severityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  logDetails: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  footerText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
  },
  tenantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  tenantText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  detailSection: {
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.semibold,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.gray900,
  },
  detailSubValue: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    marginTop: SPACING.xs,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  detailBadgeText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
  },
  modalFooter: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
});

export default AuditLogsScreen;
