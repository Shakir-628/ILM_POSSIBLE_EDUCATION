import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useDesignSystem, spacing, borderRadius, fontSize, fontWeight } from '../utils/designSystem';

const NoticeBoard = ({ notices = [] }) => {
    const { colors, spacing, borderRadius, fontSize, fontWeight, shadows, isDarkMode } = useDesignSystem();

    if (!notices || notices.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {notices.map((notice) => (
                    <TouchableOpacity
                        key={notice.id}
                        style={[
                            styles.card,
                            {
                                backgroundColor: notice.color || (isDarkMode ? '#1e3a8a66' : '#E0E7FF'),
                                borderWidth: isDarkMode ? 1 : 0,
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: borderRadius.lg
                            }
                        ]}
                        activeOpacity={0.9}
                    >
                        <Image
                            source={{ uri: notice.image || 'https://cdn-icons-png.flaticon.com/512/2583/2583319.png' }}
                            style={styles.cardImage}
                            resizeMode="contain"
                        />
                        <Text style={[styles.cardTitle, { color: colors.textPrimary, fontSize: fontSize.sm }]} numberOfLines={2}>
                            {notice.title}
                        </Text>
                        <Text style={[styles.cardDate, { color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : colors.textSecondary, fontSize: fontSize.xs }]}>
                            {notice.date}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.xl,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    card: {
        width: 220,
        height: 150,
        padding: spacing.lg,
        justifyContent: 'space-between',
        marginRight: spacing.sm,
    },
    cardImage: {
        width: 44,
        height: 44,
        marginBottom: spacing.xs,
    },
    cardTitle: {
        fontWeight: 'bold',
        lineHeight: 18,
    },
    cardDate: {
        fontWeight: '500',
    },
});

export default NoticeBoard;
