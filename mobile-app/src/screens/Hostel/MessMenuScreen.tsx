/**
 * MessMenuScreen - Weekly mess/cafeteria menu display
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const MessMenuScreen: React.FC = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [selectedDay, setSelectedDay] = useState(3); // Thursday

  const weeklyMenu: Record<number, { breakfast: string[]; lunch: string[]; snacks: string[]; dinner: string[] }> = {
    0: {
      breakfast: ['Poha', 'Boiled Eggs', 'Tea/Coffee', 'Bread & Butter'],
      lunch: ['Rice', 'Dal Tadka', 'Aloo Gobi', 'Roti', 'Salad', 'Curd'],
      snacks: ['Samosa', 'Tea'],
      dinner: ['Rice', 'Rajma', 'Mixed Veg', 'Roti', 'Kheer'],
    },
    1: {
      breakfast: ['Idli Sambhar', 'Chutney', 'Tea/Coffee', 'Fruits'],
      lunch: ['Rice', 'Chana Dal', 'Palak Paneer', 'Roti', 'Salad', 'Raita'],
      snacks: ['Bread Pakora', 'Juice'],
      dinner: ['Rice', 'Dal Fry', 'Chicken Curry / Paneer Butter Masala', 'Roti', 'Ice Cream'],
    },
    2: {
      breakfast: ['Paratha', 'Curd', 'Pickle', 'Tea/Coffee'],
      lunch: ['Rice', 'Arhar Dal', 'Bhindi Masala', 'Roti', 'Salad', 'Buttermilk'],
      snacks: ['Vada Pav', 'Tea'],
      dinner: ['Biryani (Veg/Non-Veg)', 'Raita', 'Salad', 'Gulab Jamun'],
    },
    3: {
      breakfast: ['Upma', 'Banana', 'Tea/Coffee', 'Bread & Jam'],
      lunch: ['Rice', 'Moong Dal', 'Matar Paneer', 'Roti', 'Salad', 'Curd'],
      snacks: ['Sandwich', 'Milkshake'],
      dinner: ['Rice', 'Dal Makhani', 'Egg Curry / Mushroom', 'Roti', 'Fruit Custard'],
    },
    4: {
      breakfast: ['Chole Bhature', 'Tea/Coffee', 'Fruits'],
      lunch: ['Rice', 'Toor Dal', 'Kadai Paneer', 'Roti', 'Salad', 'Lassi'],
      snacks: ['Pav Bhaji', 'Tea'],
      dinner: ['Pulao', 'Dal Tadka', 'Fish Fry / Paneer Tikka', 'Roti', 'Rasmalai'],
    },
    5: {
      breakfast: ['Dosa', 'Sambhar', 'Chutney', 'Tea/Coffee'],
      lunch: ['Rice', 'Mixed Dal', 'Chole', 'Roti', 'Salad', 'Sweet'],
      snacks: ['Spring Rolls', 'Juice'],
      dinner: ['Fried Rice', 'Manchurian', 'Noodles', 'Soup', 'Ice Cream'],
    },
    6: {
      breakfast: ['Aloo Paratha', 'Curd', 'Pickle', 'Tea/Coffee', 'Fruits'],
      lunch: ['Special Thali', 'Rice', 'Dal', 'Paneer', 'Sweet', 'Papad'],
      snacks: ['Cake', 'Tea/Coffee'],
      dinner: ['Butter Chicken / Shahi Paneer', 'Naan', 'Rice', 'Salad', 'Gulab Jamun'],
    },
  };

  const mealIcons: Record<string, { icon: string; color: string; time: string }> = {
    breakfast: { icon: 'coffee', color: '#F59E0B', time: '7:00 - 8:30 AM' },
    lunch: { icon: 'food', color: '#EF4444', time: '12:30 - 2:00 PM' },
    snacks: { icon: 'cookie', color: '#8B5CF6', time: '4:30 - 5:30 PM' },
    dinner: { icon: 'food-variant', color: '#3B82F6', time: '7:30 - 9:00 PM' },
  };

  const todayMenu = weeklyMenu[selectedDay];

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
        {Object.entries(todayMenu).map(([meal, items]) => {
          const config = mealIcons[meal];
          return (
            <View key={meal} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View style={[styles.mealIcon, { backgroundColor: config.color + '15' }]}>
                  <Icon name={config.icon} size={24} color={config.color} />
                </View>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
                  <Text style={styles.mealTime}>{config.time}</Text>
                </View>
              </View>
              <View style={styles.mealItems}>
                {items.map((item, idx) => (
                  <View key={idx} style={styles.menuItem}>
                    <View style={[styles.menuDot, { backgroundColor: config.color }]} />
                    <Text style={styles.menuText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  daySelector: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, gap: SPACING.xs, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  dayTab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.md },
  dayTabActive: { backgroundColor: COLORS.primary },
  dayText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.sm, color: COLORS.textSecondary },
  dayTextActive: { color: COLORS.white, fontFamily: FONTS.family.semiBold },
  mealCard: { backgroundColor: COLORS.white, margin: SPACING.base, marginBottom: 0, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.sm },
  mealHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  mealIcon: { width: 48, height: 48, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  mealInfo: { flex: 1 },
  mealName: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.lg, color: COLORS.text },
  mealTime: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.sm, color: COLORS.textMuted, marginTop: 2 },
  mealItems: { gap: SPACING.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  menuDot: { width: 6, height: 6, borderRadius: 3 },
  menuText: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.base, color: COLORS.text },
});

export default MessMenuScreen;
