import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';

const FEEDBACK_TYPES: { id: FeedbackType; label: string; icon: string; color: string }[] = [
  { id: 'bug', label: 'Bug Report', icon: 'bug', color: COLORS.error },
  { id: 'feature', label: 'Feature Request', icon: 'lightbulb', color: COLORS.warning },
  { id: 'improvement', label: 'Improvement', icon: 'chart-line', color: COLORS.success },
  { id: 'other', label: 'Other', icon: 'message-text', color: COLORS.info },
];

const FeedbackScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedType) {
      newErrors.type = 'Please select a feedback type';
    }

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Please provide at least 10 characters';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // TODO: Call API to submit feedback
      // await feedbackService.submitFeedback({
      //   type: selectedType,
      //   subject,
      //   description,
      //   email: email || undefined,
      //   rating,
      // });

      // Mock submission
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted successfully. We appreciate your input!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

      // Reset form
      setSelectedType(null);
      setSubject('');
      setDescription('');
      setEmail('');
      setRating(0);
    } catch (error: any) {
      console.error('Failed to submit feedback:', error);
      Alert.alert('Error', error.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const TypeSelector: React.FC = () => (
    <View style={styles.typesGrid}>
      {FEEDBACK_TYPES.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.typeCard,
            selectedType === type.id && styles.typeCardActive,
          ]}
          onPress={() => {
            setSelectedType(type.id);
            if (errors.type) setErrors({ ...errors, type: '' });
          }}
        >
          <View
            style={[
              styles.typeIcon,
              { backgroundColor: type.color + '15' },
              selectedType === type.id && { backgroundColor: type.color + '25' },
            ]}
          >
            <Icon
              name={type.icon}
              size={28}
              color={type.color}
            />
          </View>
          <Text
            style={[
              styles.typeLabel,
              selectedType === type.id && styles.typeLabelActive,
            ]}
          >
            {type.label}
          </Text>
          {selectedType === type.id && (
            <View style={styles.checkmark}>
              <Icon name="check-circle" size={20} color={COLORS.primary} />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const RatingStars: React.FC = () => (
    <View style={styles.ratingContainer}>
      <Text style={styles.ratingLabel}>Rate your experience (optional)</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Icon
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color={star <= rating ? COLORS.warning : COLORS.gray300}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <Header
        title="Send Feedback"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <Card style={styles.infoCard} elevation="none" padding={SPACING.md}>
          <View style={styles.infoContent}>
            <Icon name="information" size={24} color={COLORS.info} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>
                Your feedback helps us improve the app. Let us know about bugs, suggest features, or share your thoughts!
              </Text>
            </View>
          </View>
        </Card>

        {/* Feedback Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            What type of feedback? <Text style={styles.required}>*</Text>
          </Text>
          <TypeSelector />
          {errors.type && (
            <Text style={styles.errorText}>{errors.type}</Text>
          )}
        </View>

        {/* Form */}
        <Card elevation="sm" padding={SPACING.lg} style={styles.formCard}>
          <Input
            label="Subject"
            placeholder="Brief summary of your feedback"
            value={subject}
            onChangeText={(text) => {
              setSubject(text);
              if (errors.subject) setErrors({ ...errors, subject: '' });
            }}
            leftIcon="text-short"
            error={errors.subject}
            required
          />

          <View style={styles.textAreaContainer}>
            <Text style={styles.textAreaLabel}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.textAreaWrapper, errors.description && styles.textAreaError]}>
              <TextInput
                style={styles.textArea}
                placeholder="Please describe your feedback in detail..."
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor={COLORS.gray400}
              />
              <Text style={styles.characterCount}>
                {description.length} / 500
              </Text>
            </View>
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>

          <Input
            label="Email (Optional)"
            placeholder="Your email for follow-up"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            leftIcon="email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            style={styles.input}
          />

          <RatingStars />
        </Card>

        {/* Submit Button */}
        <Button
          title={loading ? 'Submitting...' : 'Submit Feedback'}
          onPress={handleSubmit}
          disabled={loading}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  infoCard: {
    backgroundColor: COLORS.info + '10',
    borderWidth: 1,
    borderColor: COLORS.info + '30',
    marginBottom: SPACING.lg,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTextContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  infoText: {
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    fontSize: FONTS.sm,
    lineHeight: 20,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  required: {
    color: COLORS.error,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  typeCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray200,
    position: 'relative',
  },
  typeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  typeLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
    textAlign: 'center',
  },
  typeLabelActive: {
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  checkmark: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
  },
  formCard: {
    marginBottom: SPACING.lg,
  },
  input: {
    marginTop: SPACING.md,
  },
  textAreaContainer: {
    marginTop: SPACING.md,
  },
  textAreaLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  textAreaWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    padding: SPACING.md,
  },
  textAreaError: {
    borderColor: COLORS.error,
  },
  textArea: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.gray900,
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray400,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  errorText: {
    fontSize: FONTS.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  ratingContainer: {
    marginTop: SPACING.lg,
  },
  ratingLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  starButton: {
    padding: SPACING.xs,
  },
  submitButton: {
    marginBottom: SPACING.xl,
  },
});

export default FeedbackScreen;
