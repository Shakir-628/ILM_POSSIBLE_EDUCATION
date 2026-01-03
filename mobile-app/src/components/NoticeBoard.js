import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../utils/designSystem';

const NoticeBoard = ({ notices = [] }) => {
    // Dummy data if no notices provided
    const displayNotices = notices.length > 0 ? notices : [
        {
            id: 1,
            title: 'Summer Book Fair at School Campus',
            date: '02 June 2025',
            color: '#E0E7FF', // Light Indigo
            image: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png' // Book icon
        },
        {
            id: 2,
            title: 'Annual Sports Day Registration',
            date: '15 June 2025',
            color: '#FCE7F3', // Light Pink
            image: 'https://cdn-icons-png.flaticon.com/512/2583/2583319.png' // Trophy icon
        },
        {
            id: 3,
            title: 'Parent Teacher Meeting',
            date: '20 June 2025',
            color: '#DCFCE7', // Light Green
            image: 'https://cdn-icons-png.flaticon.com/512/1256/1256650.png' // Meeting icon
        }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Notice Board</Text>
                <TouchableOpacity>
                    {/* <Text style={styles.seeAll}>See All</Text> */}
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {displayNotices.map((notice) => (
                    <TouchableOpacity
                        key={notice.id}
                        style={[styles.card, { backgroundColor: notice.color }]}
                        activeOpacity={0.9}
                    >
                        <Image
                            source={{ uri: notice.image }}
                            style={styles.cardImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.cardTitle} numberOfLines={2}>{notice.title}</Text>
                        <Text style={styles.cardDate}>{notice.date}</Text>
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
    header: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    seeAll: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: fontWeight.medium,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    card: {
        width: 200,
        height: 140,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        justifyContent: 'space-between',
        marginRight: spacing.sm,
    },
    cardImage: {
        width: 60,
        height: 60,
        marginBottom: spacing.xs,
    },
    cardTitle: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        lineHeight: 18,
    },
    cardDate: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
});

export default NoticeBoard;
