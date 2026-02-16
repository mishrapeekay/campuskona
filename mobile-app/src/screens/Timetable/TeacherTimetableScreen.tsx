/**
 * TeacherTimetableScreen - Teacher's daily/weekly schedule
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const TeacherTimetableScreen: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(1); // Monday

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const schedule = [
    { period: 1, time: '8:00 - 8:45', subject: 'Mathematics', class: 'X-A', room: 'Room 101', type: 'lecture' },
    { period: 2, time: '8:45 - 9:30', subject: 'Mathematics', class: 'IX-B', room: 'Room 102', type: 'lecture' },
    { period: 3, time: '9:30 - 10:15', subject: null, class: null, room: null, type: 'free' },
    { period: 4, time: '10:30 - 11:15', subject: 'Mathematics', class: 'XI-A', room: 'Room 201', type: 'lecture' },
    { period: 5, time: '11:15 - 12:00', subject: 'Mathematics', class: 'VIII-C', room: 'Room 103', type: 'lecture' },
    { period: 6, time: '12:00 - 12:45', subject: null, class: null, room: null, type: 'lunch' },
    { period: 7, time: '12:45 - 1:30', subject: 'Mathematics', class: 'X-B', room: 'Room 104', type: 'lecture' },
    { period: 8, time: '1:30 - 2:15', subject: 'Math Lab', class: 'IX-A', room: 'Lab 1', type: 'lab' },
  ];

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'lecture': return { color: COLORS.primary, icon: 'book-open-variant', label: 'Lecture' };
      case 'lab': return { color: COLORS.success, icon: 'flask', label: 'Lab' };
      case 'free': return { color: COLORS.gray400, icon: 'coffee', label: 'Free Period' };
      case 'lunch': return { color: COLORS.warning, icon: 'food', label: 'Lunch Break' };
      default: return { color: COLORS.gray400, icon: 'help', label: type };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Day Selector */}
      <View style={styles.daySelector}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dayTab, selectedDay === index && styles.dayTabActive]}
            onPress={() => setSelectedDay(index)}
          >
            <Text style={[styles.dayText, selectedDay === index && styles.dayTextActive]}>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.scheduleList}>
          {schedule.map((item, index) => {
            const config = getTypeConfig(item.type);
            return (
              <View key={index} style={styles.scheduleItem}>
                <View style={styles.timeColumn}>
                  <Text style={styles.periodNum}>P{item.period}</Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <View style={[styles.scheduleCard, item.type === 'free' || item.type === 'lunch' ? styles.freeCard : null]}>
                  <View style={[styles.typeIndicator, { backgroundColor: config.color }]} />
                  <View style={styles.scheduleContent}>
                    <Text style={styles.subjectName}>{item.subject || config.label}</Text>
                    {item.class && (
                      <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                          <Icon name="account-group" size={14} color={COLORS.textMuted} />
                          <Text style={styles.detailText}>{item.class}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Icon name="map-marker" size={14} color={COLORS.textMuted} />
                          <Text style={styles.detailText}>{item.room}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                  <Icon name={config.icon} size={22} color={config.color} />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  daySelector: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, gap: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  dayTab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.md },
  dayTabActive: { backgroundColor: COLORS.primary },
  dayText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.sm, color: COLORS.textSecondary },
  dayTextActive: { color: COLORS.white },
  scheduleList: { padding: SPACING.base },
  scheduleItem: { flexDirection: 'row', marginBottom: SPACING.sm },
  timeColumn: { width: 75, paddingTop: SPACING.base },
  periodNum: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.sm, color: COLORS.primary },
  timeText: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: 2 },
  scheduleCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, overflow: 'hidden', ...SHADOWS.sm },
  freeCard: { backgroundColor: COLORS.gray50, opacity: 0.8 },
  typeIndicator: { width: 4, height: '80%', borderRadius: 2, position: 'absolute', left: 0 },
  scheduleContent: { flex: 1, marginLeft: SPACING.sm },
  subjectName: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.text },
  detailsRow: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.xs },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  detailText: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted },
});

export default TeacherTimetableScreen;
