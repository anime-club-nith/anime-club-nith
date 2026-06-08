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

                {/* Logo Image */}
                <Image
                    source={require('../assets/icon.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                />

                {/* Club Name */}
                <Text style={styles.title}>
                    Anime Club <Text style={styles.titleAccent}>NITH</Text>
                </Text>

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
                >
                    <Text style={styles.buttonText}>Join the Club</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Login')}
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
        paddingHorizontal: 24,
    },
    logoImage: {
        width: 100,
        height: 100,
        marginBottom: 16,
        borderWidth: 4,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.text,
        marginBottom: 36,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    titleAccent: {
        color: '#E56DB1',
    },
    headline: {
        fontSize: 32,
        fontWeight: '900',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 40,
        textTransform: 'uppercase',
    },
    highlight: {
        color: '#E56DB1',
    },
    subtitle: {
        fontSize: 15,
        color: colors.subText,
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 24,
        fontWeight: '600',
    },
    button: {
        width: '100%',
        backgroundColor: '#E56DB1',
        paddingVertical: 18,
        borderWidth: 4,
        borderColor: colors.border,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: colors.shadow,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    buttonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    secondaryButton: {
        width: '100%',
        backgroundColor: colors.cardBg,
        borderWidth: 4,
        borderColor: colors.border,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    secondaryButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
});