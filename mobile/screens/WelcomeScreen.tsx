import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function WelcomeScreen({ navigation }: any) {
    const { colors, theme } = useTheme();
    const styles = createStyles(colors);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

            <View style={styles.contentContainer}>

                {/* Club Name Tag */}
                <Text style={styles.clubTag}>Anime Club NITH</Text>

                {/* Logo Image */}
                <View style={styles.logoWrapper}>
                    <Image
                        source={require('../assets/icon.png')}
                        style={styles.logoImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Hero Text */}
                <Text style={styles.headline}>
                    Your Anime{'\n'}
                    <Text style={styles.highlight}>Community at NITH</Text>
                </Text>

                <Text style={styles.subtitle}>
                    Discuss your favourite series, share fanart, stay updated on events — all in one place.
                </Text>

                {/* Buttons */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Signup')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.buttonText}>Join the Club</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.secondaryButtonText}>Log In</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    clubTag: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 2,
        color: colors.subText,
        textTransform: 'uppercase',
        marginBottom: 28,
    },
    logoWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        marginBottom: 32,
        shadowColor: '#E56DB1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    logoImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    headline: {
        fontSize: 34,
        fontWeight: '800',
        color: colors.text,
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: 16,
        lineHeight: 42,
    },
    highlight: {
        color: '#E56DB1',
    },
    subtitle: {
        fontSize: 16,
        color: colors.subText,
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 24,
    },
    button: {
        width: '100%',
        backgroundColor: '#E56DB1',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#E56DB1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    secondaryButton: {
        width: '100%',
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    secondaryButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
});