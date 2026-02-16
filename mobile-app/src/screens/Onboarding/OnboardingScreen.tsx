import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONTS } from '@/constants';
import Button from '@/components/common/Button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to School Management System',
    description: 'Your all-in-one platform for seamless school operations',
    icon: 'school',
    color: COLORS.primary,
    features: [
      'Manage attendance effortlessly',
      'Track academic performance',
      'Stay connected with parents',
      'Access reports and analytics',
    ],
  },
  {
    id: '2',
    title: 'Real-time Attendance Tracking',
    description: 'Mark and monitor attendance with instant updates',
    icon: 'calendar-check',
    color: COLORS.success,
    features: [
      'Quick attendance marking',
      'Automated notifications',
      'Detailed attendance reports',
      'Leave request management',
    ],
  },
  {
    id: '3',
    title: 'Academic Excellence',
    description: 'Comprehensive exam and grade management',
    icon: 'certificate',
    color: COLORS.warning,
    features: [
      'Easy marks entry',
      'Instant result publication',
      'Progress tracking',
      'Performance analytics',
    ],
  },
  {
    id: '4',
    title: 'Smart Fee Management',
    description: 'Secure and hassle-free fee collection',
    icon: 'currency-inr',
    color: COLORS.info,
    features: [
      'Multiple payment methods',
      'Automated reminders',
      'Digital receipts',
      'Installment tracking',
    ],
  },
  {
    id: '5',
    title: 'Stay Connected',
    description: 'Seamless communication between all stakeholders',
    icon: 'message-text',
    color: COLORS.purple,
    features: [
      'Instant messaging',
      'Important announcements',
      'Parent-teacher communication',
      'Push notifications',
    ],
  },
  {
    id: '6',
    title: 'Get Started!',
    description: 'Everything you need for school management in one place',
    icon: 'rocket-launch',
    color: COLORS.primary,
    features: [
      'Offline mode support',
      'Secure & encrypted',
      'Multi-role access',
      'Regular updates',
    ],
  },
];

interface OnboardingScreenProps {
  onComplete?: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      await AsyncStorage.setItem('@app_has_launched', 'true');
      // Signal completion - AppNavigator handles the screen transition via state
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    return (
      <View style={styles.slide}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
          <Icon name={item.icon} size={120} color={item.color} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.featuresContainer}>
            {item.features.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <View style={[styles.checkIcon, { backgroundColor: item.color + '15' }]}>
                  <Icon name="check" size={16} color={item.color} />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {SLIDES.map((_, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor: SLIDES[currentIndex].color,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {currentIndex < SLIDES.length - 1 && (
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {renderPagination()}

        <View style={styles.buttonContainer}>
          {currentIndex < SLIDES.length - 1 ? (
            <Button
              title="Next"
              onPress={handleNext}
              icon="arrow-right"
              iconPosition="right"
              style={styles.nextButton}
            />
          ) : (
            <Button
              title="Get Started"
              onPress={handleGetStarted}
              icon="rocket-launch"
              style={styles.getStartedButton}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  skipText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray600,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING['3xl'],
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING['3xl'],
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONTS['2xl'],
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  featuresContainer: {
    gap: SPACING.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['3xl'],
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    width: '100%',
  },
  nextButton: {
    width: '100%',
  },
  getStartedButton: {
    width: '100%',
  },
});

export default OnboardingScreen;
