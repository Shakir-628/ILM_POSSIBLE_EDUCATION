import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../utils/designSystem';

const MenuGrid = ({ items = [] }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Academic Overview</Text>

            <View style={styles.grid}>
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        onPress={item.onPress}
                        activeOpacity={0.8}
                    >
                        <View style={styles.iconContainer}>
                            {/* Use Image if url provided, or Ionicons component if provided */}
                            {item.image ? (
                                <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
                            ) : (
                                item.icon
                            )}
                        </View>
                        <Text style={styles.label}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    card: {
        width: '47%', // 2 columns approx
        backgroundColor: '#F3F4F6', // Light gray background as per design
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        aspectRatio: 1, // Square cards
        ...shadows.small,
    },
    iconContainer: {
        width: 60,
        height: 60,
        marginBottom: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    label: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        textAlign: 'center',
    },
});

export default MenuGrid;
