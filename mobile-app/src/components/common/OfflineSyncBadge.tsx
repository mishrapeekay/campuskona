import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, FONTS } from '@/constants';
import offlineManager from '@/utils/offlineManager';

const OfflineSyncBadge: React.FC = () => {
    const [queueLength, setQueueLength] = useState(offlineManager.getQueueLength());
    const [isOnline, setIsOnline] = useState(offlineManager.getConnectionStatus());
    const [opacity] = useState(new Animated.Value(0));

    useEffect(() => {
        // Initial animation
        if (queueLength > 0 || !isOnline) {
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }

        const handleQueueUpdate = (length: number) => {
            setQueueLength(length);
            if (length > 0 || !isOnline) {
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            } else {
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }
        };

        const handleConnectionChange = (online: boolean) => {
            setIsOnline(online);
            if (!online || queueLength > 0) {
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            } else {
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }
        };

        offlineManager.on('queueUpdated', handleQueueUpdate);
        offlineManager.on('connectionChange', handleConnectionChange);

        return () => {
            offlineManager.off('queueUpdated', handleQueueUpdate);
            offlineManager.off('connectionChange', handleConnectionChange);
        };
    }, [queueLength, isOnline]);

    if (queueLength === 0 && isOnline) {
        return null;
    }

    const handleSyncNow = () => {
        if (isOnline && queueLength > 0) {
            offlineManager.syncOfflineQueue();
        }
    };

    return (
        <Animated.View style={[styles.container, { opacity }]}>
            <TouchableOpacity
                style={[
                    styles.badge,
                    !isOnline ? styles.offlineBadge : styles.syncBadge
                ]}
                onPress={handleSyncNow}
                disabled={!isOnline || queueLength === 0}
            >
                <Icon
                    name={!isOnline ? "cloud-off" : "sync"}
                    size={16}
                    color={COLORS.white}
                />
                <Text style={styles.text}>
                    {!isOnline
                        ? 'Offline'
                        : `${queueLength} Pending Sync`}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 20,
        gap: SPACING.xs,
        elevation: 4,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    offlineBadge: {
        backgroundColor: COLORS.error,
    },
    syncBadge: {
        backgroundColor: COLORS.warning,
    },
    text: {
        color: COLORS.white,
        fontSize: FONTS.xs,
        fontFamily: FONTS.bold,
    },
});

export default OfflineSyncBadge;
