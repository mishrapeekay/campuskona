import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '@/components/common/Card';
import { COLORS, SPACING, FONTS } from '@/constants';

interface AlertBannerProps {
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  title,
  message,
  actionLabel,
  onActionPress,
}) => {
  const getColorForType = (alertType: string) => {
    switch (alertType) {
      case 'error':
        return COLORS.error;
      case 'warning':
        return COLORS.warning;
      case 'info':
        return COLORS.info;
      case 'success':
        return COLORS.success;
      default:
        return COLORS.gray500;
    }
  };

  const getIconForType = (alertType: string) => {
    switch (alertType) {
      case 'error':
        return 'alert';
      case 'warning':
        return 'alert-circle';
      case 'info':
        return 'information';
      case 'success':
        return 'check-circle';
      default:
        return 'information';
    }
  };

  const color = getColorForType(type);
  const iconName = getIconForType(type);

  return (
    <Card
      style={[
        styles.alertCard,
        {
          backgroundColor: color + '10',
          borderColor: color + '30',
        },
      ]}
      elevation="none"
      padding={SPACING.md}
    >
      <View style={styles.alertContent}>
        <Icon name={iconName} size={24} color={color} />
        <View style={styles.alertTextContainer}>
          <Text style={[styles.alertTitle, { color: COLORS.gray800 }]}>
            {title}
          </Text>
          <Text style={[styles.alertMessage, { color: COLORS.gray600 }]}>
            {message}
          </Text>
        </View>
        {actionLabel && onActionPress && (
          <TouchableOpacity
            style={[styles.alertButton, { borderColor: color }]}
            onPress={onActionPress}
          >
            <Text style={[styles.alertButtonText, { color }]}>
              {actionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  alertCard: {
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTextContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  alertTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.md,
  },
  alertMessage: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sm,
    marginTop: 2,
  },
  alertButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
  },
  alertButtonText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.bold,
  },
});

export default AlertBanner;
