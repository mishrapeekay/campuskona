/**
 * ApplicationDetailScreen - Detailed view of a single admission application
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const ApplicationDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const application = {
    id: route.params?.applicationId || '1',
    applicationNumber: 'ADM-2025-001',
    status: 'pending',
    studentName: 'Aarav Sharma',
    dateOfBirth: '15 Mar 2014',
    gender: 'Male',
    classApplied: 'Class V',
    section: 'A',
    previousSchool: 'Delhi Public School, Sector 45',
    applicationDate: '28 Jan 2025',
    fatherName: 'Rajesh Sharma',
    motherName: 'Sunita Sharma',
    phone: '+91 98765 43210',
    email: 'rajesh.sharma@email.com',
    address: '42, MG Road, Sector 12, Gurugram, Haryana - 122001',
    documents: [
      { name: 'Birth Certificate', status: 'verified', icon: 'file-certificate' },
      { name: 'Transfer Certificate', status: 'pending', icon: 'file-document' },
      { name: 'Report Card', status: 'verified', icon: 'file-chart' },
      { name: 'Aadhar Card', status: 'verified', icon: 'card-account-details' },
      { name: 'Photos (2)', status: 'verified', icon: 'image-multiple' },
      { name: 'Medical Certificate', status: 'not_uploaded', icon: 'medical-bag' },
    ],
    timeline: [
      { date: '28 Jan 2025', action: 'Application Submitted', by: 'Parent (Online)', icon: 'file-plus', color: COLORS.primary },
      { date: '28 Jan 2025', action: 'Documents Uploaded (5/6)', by: 'Parent', icon: 'file-upload', color: COLORS.info },
      { date: '29 Jan 2025', action: 'Documents Verified (3/6)', by: 'Office Staff', icon: 'file-check', color: COLORS.success },
      { date: 'Pending', action: 'Entrance Test', by: 'Scheduled', icon: 'clipboard-text', color: COLORS.warning },
      { date: 'Pending', action: 'Interview', by: 'Not Scheduled', icon: 'account-voice', color: COLORS.gray400 },
      { date: 'Pending', action: 'Final Decision', by: 'Admin', icon: 'gavel', color: COLORS.gray400 },
    ],
  };

  const getDocStatus = (status: string) => {
    switch (status) {
      case 'verified': return { color: COLORS.success, label: 'Verified', icon: 'check-circle' };
      case 'pending': return { color: COLORS.warning, label: 'Pending', icon: 'clock' };
      case 'not_uploaded': return { color: COLORS.error, label: 'Missing', icon: 'alert-circle' };
      default: return { color: COLORS.gray400, label: status, icon: 'help-circle' };
    }
  };

  const handleApprove = () => {
    Alert.alert('Approve Application', 'Are you sure you want to approve this application?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', style: 'default' },
    ]);
  };

  const handleReject = () => {
    Alert.alert('Reject Application', 'Are you sure you want to reject this application?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: COLORS.warningMuted }]}>
          <Icon name="clock-outline" size={20} color={COLORS.warning} />
          <View style={styles.bannerContent}>
            <Text style={[styles.bannerTitle, { color: COLORS.warning }]}>Pending Review</Text>
            <Text style={styles.bannerSubtext}>Application #{application.applicationNumber}</Text>
          </View>
        </View>

        {/* Student Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Student Information</Text>
          <View style={styles.infoGrid}>
            {[
              { label: 'Full Name', value: application.studentName, icon: 'account' },
              { label: 'Date of Birth', value: application.dateOfBirth, icon: 'calendar' },
              { label: 'Gender', value: application.gender, icon: 'gender-male-female' },
              { label: 'Class Applied', value: application.classApplied, icon: 'school' },
              { label: 'Previous School', value: application.previousSchool, icon: 'domain' },
              { label: 'Applied On', value: application.applicationDate, icon: 'calendar-clock' },
            ].map((info, index) => (
              <View key={index} style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Icon name={info.icon} size={16} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{info.label}</Text>
                  <Text style={styles.infoValue}>{info.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Parent Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Parent/Guardian Information</Text>
          <View style={styles.infoGrid}>
            {[
              { label: "Father's Name", value: application.fatherName, icon: 'account' },
              { label: "Mother's Name", value: application.motherName, icon: 'account' },
              { label: 'Phone', value: application.phone, icon: 'phone' },
              { label: 'Email', value: application.email, icon: 'email' },
              { label: 'Address', value: application.address, icon: 'map-marker' },
            ].map((info, index) => (
              <View key={index} style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Icon name={info.icon} size={16} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{info.label}</Text>
                  <Text style={styles.infoValue}>{info.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Documents */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Documents</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DocumentUpload', { applicationId: application.id })}>
              <Text style={styles.uploadLink}>Upload</Text>
            </TouchableOpacity>
          </View>
          {application.documents.map((doc, index) => {
            const docStatus = getDocStatus(doc.status);
            return (
              <View key={index} style={styles.docRow}>
                <Icon name={doc.icon} size={20} color={COLORS.textSecondary} />
                <Text style={styles.docName}>{doc.name}</Text>
                <View style={[styles.docBadge, { backgroundColor: docStatus.color + '15' }]}>
                  <Icon name={docStatus.icon} size={12} color={docStatus.color} />
                  <Text style={[styles.docStatus, { color: docStatus.color }]}>{docStatus.label}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Application Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Application Timeline</Text>
          {application.timeline.map((event, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLine}>
                <View style={[styles.timelineDot, { backgroundColor: event.color }]}>
                  <Icon name={event.icon} size={14} color={COLORS.white} />
                </View>
                {index < application.timeline.length - 1 && (
                  <View style={[styles.timelineConnector, { backgroundColor: event.color + '30' }]} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineAction}>{event.action}</Text>
                <Text style={styles.timelineDate}>{event.date} | {event.by}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={handleReject}>
            <Icon name="close" size={20} color={COLORS.error} />
            <Text style={[styles.actionBtnText, { color: COLORS.error }]}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.reviewBtn]} onPress={() => navigation.navigate('ApplicationReview', { applicationId: application.id })}>
            <Icon name="eye" size={20} color={COLORS.info} />
            <Text style={[styles.actionBtnText, { color: COLORS.info }]}>Review</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={handleApprove}>
            <Icon name="check" size={20} color={COLORS.white} />
            <Text style={[styles.actionBtnText, { color: COLORS.white }]}>Approve</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  statusBanner: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, marginHorizontal: SPACING.base, marginTop: SPACING.md, borderRadius: RADIUS.lg, gap: SPACING.md },
  bannerContent: { flex: 1 },
  bannerTitle: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base },
  bannerSubtext: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: 2 },
  card: { backgroundColor: COLORS.white, margin: SPACING.base, marginBottom: 0, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.lg, color: COLORS.text, marginBottom: SPACING.md },
  uploadLink: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.sm, color: COLORS.primary },
  infoGrid: { gap: SPACING.md },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  infoIcon: { width: 32, height: 32, borderRadius: RADIUS.sm, backgroundColor: COLORS.primaryMuted, justifyContent: 'center', alignItems: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted },
  infoValue: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.base, color: COLORS.text, marginTop: 2 },
  docRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider, gap: SPACING.md },
  docName: { flex: 1, fontFamily: FONTS.family.medium, fontSize: FONTS.size.sm, color: COLORS.text },
  docBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm, gap: 4 },
  docStatus: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.xs },
  timelineItem: { flexDirection: 'row', minHeight: 56 },
  timelineLine: { alignItems: 'center', width: 32, marginRight: SPACING.md },
  timelineDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  timelineConnector: { width: 2, flex: 1 },
  timelineContent: { flex: 1, paddingBottom: SPACING.md },
  timelineAction: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.sm, color: COLORS.text },
  timelineDate: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: 2 },
  actions: { flexDirection: 'row', paddingHorizontal: SPACING.base, paddingTop: SPACING.lg, gap: SPACING.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md, borderRadius: RADIUS.md, gap: SPACING.xs },
  rejectBtn: { backgroundColor: COLORS.errorMuted, borderWidth: 1, borderColor: COLORS.error + '30' },
  reviewBtn: { backgroundColor: COLORS.infoMuted, borderWidth: 1, borderColor: COLORS.info + '30' },
  approveBtn: { backgroundColor: COLORS.success },
  actionBtnText: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.sm },
});

export default ApplicationDetailScreen;
