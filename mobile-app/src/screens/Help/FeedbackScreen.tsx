import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const FeedbackScreen: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('');

  const categories = ['User Interface', 'Performance', 'Features', 'Bug Report', 'Other'];
  const emojis = ['😞', '😐', '🙂', '😊', '🤩'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Rating */}
          <Text style={styles.heading}>How would you rate your experience?</Text>
          <View style={styles.ratingRow}>
            {emojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.emojiButton, rating === index + 1 && styles.emojiSelected]}
                onPress={() => setRating(index + 1)}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback */}
          <Text style={styles.label}>Your Feedback</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell us what you think..."
            value={feedback}
            onChangeText={setFeedback}
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, (!rating || !feedback) && styles.disabled]}
            disabled={!rating || !feedback}
          >
            <Icon name="send" size={20} color={COLORS.white} />
            <Text style={styles.submitText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.base },
  heading: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.lg, color: COLORS.text, textAlign: 'center', marginTop: SPACING.lg },
  ratingRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.md, marginVertical: SPACING.xl },
  emojiButton: { width: 56, height: 56, borderRadius: RADIUS.full, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.border },
  emojiSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryMuted },
  emoji: { fontSize: 28 },
  label: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.md, color: COLORS.text, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  categoryChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  categoryChipActive: { backgroundColor: COLORS.primaryMuted, borderColor: COLORS.primary },
  categoryText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.sm, color: COLORS.textSecondary },
  categoryTextActive: { color: COLORS.primary },
  textArea: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, fontFamily: FONTS.family.regular, fontSize: FONTS.size.base, color: COLORS.text, minHeight: 120, marginTop: SPACING.sm },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: SPACING.base, gap: SPACING.sm, marginTop: SPACING.xl },
  disabled: { backgroundColor: COLORS.gray300 },
  submitText: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.md, color: COLORS.white },
});

export default FeedbackScreen;
