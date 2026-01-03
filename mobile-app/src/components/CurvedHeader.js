import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight } from '../utils/designSystem';
import { useAuth } from '../context/AuthContext';

const CurvedHeader = ({ title, subtitle, onNotificationPress }) => {
    const { user } = useAuth();

    // Wave path configuration
    const headerHeight = 180;
    const curveHeight = 30;

    // Create a wave path
    const path = `
    M0 0 
    L0 ${headerHeight - curveHeight} 
    Q80 ${headerHeight} 150 ${headerHeight - curveHeight}
    T320 ${headerHeight - curveHeight}
    T600 ${headerHeight - curveHeight}
    L600 0 
    Z
  `;

    // Scale path horizontally for different screen widths if needed, but for now simple curve works
    // A simpler uniform curve might be safer for all widths:
    // M0 0 L0 H Q(width/2) (H+Curve) width H L width 0 Z

    // Let's use a simpler quadratic bezier for a nice robust curve
    // Assuming a standard width, but SVG viewbox handles scaling
    const simpleCurvePath = `M0 0 H1 V0.85 Q0.5 1 0 0.85 Z`;

    return (
        <View style={styles.container}>
            <Svg
                height={headerHeight}
                width="100%"
                viewBox="0 0 1 1"
                preserveAspectRatio="none"
                style={styles.svg}
            >
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
                        <Stop offset="1" stopColor={colors.primaryDark} stopOpacity="1" />
                    </LinearGradient>
                </Defs>
                <Path d={simpleCurvePath} fill="url(#grad)" />
            </Svg>

            <View style={styles.content}>
                <View style={styles.userInfo}>
                    <View>
                        <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0] || 'User'}! 👋</Text>
                        <Text style={styles.subtitle}>{subtitle || 'Welcome to EduNest!'}</Text>
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
                            <Ionicons name="notifications" size={24} color="#FFD700" />
                        </TouchableOpacity>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: user?.profilePicture || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User') + '&background=random' }}
                                style={styles.avatar}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 180,
        width: '100%',
        position: 'relative',
        marginBottom: spacing.md,
    },
    svg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    content: {
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingHorizontal: spacing.xl,
    },
    userInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.white,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.sm,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconButton: {
        padding: spacing.sm,
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
});

export default CurvedHeader;
