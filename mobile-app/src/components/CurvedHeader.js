import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useDesignSystem, colors, spacing, fontSize, fontWeight } from '../utils/designSystem';
import { useAuth } from '../context/AuthContext';

const CurvedHeader = ({ title, subtitle, onNotificationPress, showBack, onBack, showProfile = true }) => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const { colors, spacing, fontSize, fontWeight } = useDesignSystem();

    // Wave path configuration
    const headerHeight = 180;
    const curveHeight = 30;

    // ... (rest of path logic remains same)

    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <Svg
                height={headerHeight}
                width="100%"
                viewBox="0 0 400 150"
                preserveAspectRatio="none"
                style={styles.svg}
            >
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
                        <Stop offset="1" stopColor={colors.primaryDark} stopOpacity="1" />
                    </LinearGradient>
                </Defs>
                <Path d="M0 0 H400 V130 Q200 150 0 130 Z" fill="url(#grad)" />
            </Svg>

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    {showBack && (
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.white} />
                        </TouchableOpacity>
                    )}

                    <View style={styles.textContainer}>
                        <Text style={styles.greeting}>
                            {title || `Hi, ${user?.name?.split(' ')[0] || 'User'}! 👋`}
                        </Text>
                        <Text style={styles.subtitle}>{subtitle || 'Welcome to EduNest!'}</Text>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
                            <Ionicons name="notifications" size={24} color="#FFD700" />
                        </TouchableOpacity>
                        {!showBack && showProfile && (
                            <TouchableOpacity
                                onPress={handleProfilePress}
                                style={styles.avatarContainer}
                                activeOpacity={0.7}
                            >
                                <Image
                                    source={{ uri: user?.profilePicture || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User') + '&background=random' }}
                                    style={styles.avatar}
                                />
                            </TouchableOpacity>
                        )}
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        marginRight: spacing.md,
        padding: spacing.xs,
    },
    textContainer: {
        flex: 1,
    },
    greeting: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.white,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.sm,
        color: 'rgba(255, 255, 255, 0.8)', // Slightly darker overlay for readability
        fontWeight: '500',
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
