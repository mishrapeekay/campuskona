/**
 * AuditLogsScreen - Platform-wide audit trail for Super Admin
 *
 * Displays all significant actions: tenant creation, user logins,
 * subscription changes, API errors, admin actions, etc.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInUp, FadeInRight, Layout } from 'react-native-reanimated';

import { COLORS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Badge, LoadingSpinner } from '@/components/ui';
import { tenantService } from '@/services/api';
import { TenantsStackParamList } from '@/types/navigation';

type RouteProps = RouteProp<TenantsStackParamList, 'AuditLogs'>;

// ─── Types ────────────────────────────────────────────────────────────────────

type AuditAction =
  | 'TENANT_CREATED'
  | 'TENANT_UPDATED'
  | 'TENANT_SUSPENDED'
  | 'TENANT_DELETED'
  | 'SUBSCRIPTION_UPGRADED'
  | 'SUBSCRIPTION_DOWNGRADED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'ADMIN_ACTION'
  | 'SECURITY_ALERT'
  | 'SYSTEM_EVENT'
  | 'API_ERROR';

interface AuditLog {
  id: string;
  action: AuditAction;
  actor: string;
  actor_type: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'SYSTEM';
  target_tenant?: string;
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

type FilterType = 'ALL' | 'TENANT' | 'SECURITY' | 'PAYMENT' | 'SYSTEM';
type SeverityFilter = 'ALL' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<AuditAction, { icon: string; color: string; label: string }> = {
  TENANT_CREATED:        { icon: 'domain-plus',               color: '#10b981', label: 'Tenant Created' },
  TENANT_UPDATED:        { icon: 'domain',                    color: '#6366f1', label: 'Tenant Updated' },
  TENANT_SUSPENDED:      { icon: 'domain-remove',             color: '#ef4444', label: 'Tenant Suspended' },
  TENANT_DELETED:        { icon: 'delete-forever',            color: '#ef4444', label: 'Tenant Deleted' },
  SUBSCRIPTION_UPGRADED: { icon: 'arrow-up-circle',           color: '#6366f1', label: 'Subscription Up' },
  SUBSCRIPTION_DOWNGRADED:{ icon: 'arrow-down-circle',        color: '#f59e0b', label: 'Subscription Down' },
  PAYMENT_RECEIVED:      { icon: 'cash-check',                color: '#10b981', label: 'Payment Received' },
  PAYMENT_FAILED:        { icon: 'cash-remove',               color: '#ef4444', label: 'Payment Failed' },
  USER_LOGIN:            { icon: 'login',                     color: '#3b82f6', label: 'User Login' },
  USER_LOGOUT:           { icon: 'logout',                    color: '#94a3b8', label: 'User Logout' },
  ADMIN_ACTION:          { icon: 'shield-crown',              color: '#8b5cf6', label: 'Admin Action' },
  SECURITY_ALERT:        { icon: 'shield-alert',              color: '#ef4444', label: 'Security Alert' },
  SYSTEM_EVENT:          { icon: 'cog-sync',                  color: '#64748b', label: 'System Event' },
  API_ERROR:             { icon: 'api-off',                   color: '#f97316', label: 'API Error' },
};

const SEVERITY_COLORS: Record<AuditLog['severity'], string> = {
  INFO:     '#6366f1',
  WARNING:  '#f59e0b',
  ERROR:    '#ef4444',
  CRITICAL: '#dc2626',
};

const FILTERS: { key: FilterType; label: string; icon: string }[] = [
  { key: 'ALL',      label: 'All',      icon: 'view-list' },
  { key: 'TENANT',   label: 'Tenants',  icon: 'domain' },
  { key: 'SECURITY', label: 'Security', icon: 'shield-alert' },
  { key: 'PAYMENT',  label: 'Payments', icon: 'cash' },
  { key: 'SYSTEM',   label: 'System',   icon: 'cog' },
];

const formatTimestamp = (ts: string): string => {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1)   return 'Just now';
  if (diffMins < 60)  return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
};

// ─── Mock data fallback (used when API not available) ─────────────────────────
const MOCK_LOGS: AuditLog[] = [
  { id: '1',  action: 'TENANT_CREATED',        actor: 'admin@platform.com', actor_type: 'SUPER_ADMIN', target_tenant: 'Veda Vidyalaya',         description: 'New school tenant provisioned successfully',       timestamp: new Date(Date.now() - 7200000).toISOString(),   severity: 'INFO' },
  { id: '2',  action: 'SUBSCRIPTION_UPGRADED', actor: 'System',             actor_type: 'SYSTEM',      target_tenant: 'Demo High School',        description: 'Subscription upgraded from Basic to Premium',      timestamp: new Date(Date.now() - 18000000).toISOString(),  severity: 'INFO' },
  { id: '3',  action: 'SECURITY_ALERT',        actor: 'System',             actor_type: 'SYSTEM',      target_tenant: 'Public School',           description: '5 failed login attempts detected',                 timestamp: new Date(Date.now() - 28800000).toISOString(),  severity: 'WARNING', ip_address: '103.24.18.4' },
  { id: '4',  action: 'PAYMENT_RECEIVED',      actor: 'System',             actor_type: 'SYSTEM',      target_tenant: 'Demo High School',        description: '₹25,000 monthly subscription payment received',    timestamp: new Date(Date.now() - 86400000).toISOString(),  severity: 'INFO' },
  { id: '5',  action: 'TENANT_SUSPENDED',      actor: 'admin@platform.com', actor_type: 'SUPER_ADMIN', target_tenant: 'Inactive School',         description: 'Tenant suspended due to non-payment',             timestamp: new Date(Date.now() - 172800000).toISOString(), severity: 'WARNING' },
  { id: '6',  action: 'ADMIN_ACTION',          actor: 'admin@platform.com', actor_type: 'SUPER_ADMIN', target_tenant: undefined,                 description: 'Platform-wide configuration updated',             timestamp: new Date(Date.now() - 259200000).toISOString(), severity: 'INFO' },
  { id: '7',  action: 'API_ERROR',             actor: 'System',             actor_type: 'SYSTEM',      target_tenant: 'Veda Vidyalaya',          description: 'Timetable API returned 500 — auto-retried',        timestamp: new Date(Date.now() - 3600000).toISOString(),   severity: 'ERROR' },
  { id: '8',  action: 'USER_LOGIN',            actor: 'principal@demo.edu', actor_type: 'SCHOOL_ADMIN',target_tenant: 'Demo High School',        description: 'Principal logged in from Android device',         timestamp: new Date(Date.now() - 900000).toISOString(),    severity: 'INFO' },
  { id: '9',  action: 'PAYMENT_FAILED',        actor: 'System',             actor_type: 'SYSTEM',      target_tenant: 'Sunrise Academy',         description: 'Payment gateway timeout — retry scheduled',        timestamp: new Date(Date.now() - 5400000).toISOString(),   severity: 'ERROR' },
  { id: '10', action: 'SYSTEM_EVENT',          actor: 'System',             actor_type: 'SYSTEM',      target_tenant: undefined,                 description: 'Scheduled database backup completed (12.4 GB)',    timestamp: new Date(Date.now() - 43200000).toISOString(),  severity: 'INFO' },
];

const ACTION_TO_FILTER: Record<AuditAction, FilterType> = {
  TENANT_CREATED:         'TENANT',
  TENANT_UPDATED:         'TENANT',
  TENANT_SUSPENDED:       'TENANT',
  TENANT_DELETED:         'TENANT',
  SUBSCRIPTION_UPGRADED:  'PAYMENT',
  SUBSCRIPTION_DOWNGRADED:'PAYMENT',
  PAYMENT_RECEIVED:       'PAYMENT',
  PAYMENT_FAILED:         'PAYMENT',
  USER_LOGIN:             'SECURITY',
  USER_LOGOUT:            'SECURITY',
  ADMIN_ACTION:           'SYSTEM',
  SECURITY_ALERT:         'SECURITY',
  SYSTEM_EVENT:           'SYSTEM',
  API_ERROR:              'SYSTEM',
};

// ─── Component ────────────────────────────────────────────────────────────────

const AuditLogsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const routeType = route.params?.type || 'platform';
  const routeTenantId = route.params?.tenantId;

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await (tenantService as any).getAuditLogs?.({
        type: routeType,
        tenant_id: routeTenantId,
      });
      if (response && Array.isArray(response)) {
        setLogs(response);
      } else {
        setLogs(MOCK_LOGS);
      }
    } catch {
      setLogs(MOCK_LOGS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [routeType, routeTenantId]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const onRefresh = () => { setRefreshing(true); fetchLogs(); };

  const filteredLogs = logs.filter((log) => {
    if (activeFilter !== 'ALL' && ACTION_TO_FILTER[log.action] !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.description.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        (log.target_tenant || '').toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const renderItem = ({ item, index }: { item: AuditLog; index: number }) => {
    const cfg = ACTION_CONFIG[item.action];
    const isExpanded = expandedId === item.id;
    const severityColor = SEVERITY_COLORS[item.severity];

    return (
      <Animated.View
        entering={FadeInRight.delay(index * 30).duration(400)}
        layout={Layout.springify()}
      >
        <TouchableOpacity
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
          activeOpacity={0.8}
          className="mx-4 mb-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
        >
          {/* Severity strip */}
          <View style={{ height: 3, backgroundColor: severityColor }} />

          <View className="p-4">
            <View className="flex-row items-start">
              {/* Icon */}
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3 flex-shrink-0"
                style={{ backgroundColor: cfg.color + '18' }}
              >
                <Icon name={cfg.icon} size={20} color={cfg.color} />
              </View>

              {/* Content */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: cfg.color }}>
                    {cfg.label}
                  </Text>
                  <Text className="text-[10px] text-slate-400 font-medium">
                    {formatTimestamp(item.timestamp)}
                  </Text>
                </View>

                <Text className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-5" numberOfLines={isExpanded ? undefined : 2}>
                  {item.description}
                </Text>

                {item.target_tenant && (
                  <View className="flex-row items-center mt-2">
                    <Icon name="domain" size={12} color="#94a3b8" />
                    <Text className="text-[11px] text-slate-400 font-semibold ml-1">{item.target_tenant}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Expanded Detail */}
            {isExpanded && (
              <Animated.View
                entering={FadeInUp.duration(300)}
                className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800"
              >
                <View className="flex-row flex-wrap gap-y-2">
                  <DetailChip label="Actor" value={item.actor} icon="account" />
                  <DetailChip label="Type" value={item.actor_type} icon="shield-account" />
                  <DetailChip label="Severity" value={item.severity} icon="alert-circle" valueColor={severityColor} />
                  {item.ip_address && <DetailChip label="IP" value={item.ip_address} icon="ip-network" />}
                  <DetailChip
                    label="Time"
                    value={new Date(item.timestamp).toLocaleString('en-IN')}
                    icon="clock-outline"
                  />
                </View>
              </Animated.View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ScreenWrapper>
      <Header
        title="Audit Logs"
        subtitle={routeType === 'tenant' ? 'Tenant Activity' : 'Platform Activity'}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {/* Search + Filters */}
      <View className="bg-white dark:bg-slate-900 px-4 pt-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        {/* Search */}
        <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 mb-3 border border-slate-100 dark:border-slate-700">
          <Icon name="magnify" size={18} color="#94a3b8" />
          <TextInput
            className="flex-1 py-3 ml-2 text-sm text-slate-800 dark:text-slate-100 font-semibold"
            placeholder="Search logs..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              className={`flex-row items-center px-4 py-2 rounded-xl ${
                activeFilter === f.key
                  ? 'bg-indigo-600'
                  : 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700'
              }`}
            >
              <Icon
                name={f.icon}
                size={13}
                color={activeFilter === f.key ? 'white' : '#94a3b8'}
              />
              <Text
                className={`text-[10px] font-black uppercase tracking-wider ml-1.5 ${
                  activeFilter === f.key ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Log count */}
      <View className="px-4 py-3 flex-row items-center justify-between">
        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {filteredLogs.length} {filteredLogs.length === 1 ? 'Entry' : 'Entries'}
        </Text>
        <TouchableOpacity className="flex-row items-center">
          <Icon name="export-variant" size={14} color="#6366f1" />
          <Text className="text-[10px] font-black text-indigo-600 ml-1 uppercase tracking-wider">Export</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner size="large" />
          <Text className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">
            Loading Audit Trail...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center pt-20 px-8">
              <View className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-900 items-center justify-center mb-4">
                <Icon name="file-document-outline" size={40} color="#cbd5e1" />
              </View>
              <Text className="text-xl font-black text-slate-800 dark:text-slate-100">No Logs Found</Text>
              <Text className="text-slate-400 text-sm text-center mt-2">
                {searchQuery ? `No entries match "${searchQuery}"` : 'No audit events recorded yet.'}
              </Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
};

// ─── Sub-component ────────────────────────────────────────────────────────────

const DetailChip = ({
  label,
  value,
  icon,
  valueColor,
}: {
  label: string;
  value: string;
  icon: string;
  valueColor?: string;
}) => (
  <View className="mr-4 mb-1">
    <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</Text>
    <View className="flex-row items-center">
      <Icon name={icon} size={11} color={valueColor || '#94a3b8'} />
      <Text
        className="text-[11px] font-bold ml-1"
        style={{ color: valueColor || '#475569' }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  </View>
);

export default AuditLogsScreen;
