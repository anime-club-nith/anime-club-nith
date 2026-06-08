import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import client from '../services/client';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function ForgotPasswordScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const { colors, theme } = useTheme();
    const styles = createStyles(colors);

    const handleSendLink = async () => {
        if (!email) {
            showToast('Please enter your email address', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await client.post('/api/auth/forget-password/viaEmail', { email });
            showToast(response.data.message || 'Email sent successfully', 'success');
            setTimeout(() => {
                navigation.goBack();
            }, 2000);
        } catch (error: any) {
            console.error('Forgot Password error:', error);
            const message = error.response?.data?.message || error.message || 'Something went wrong';
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backText}>← Back to Login</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Reset Password</Text>
                        <Text style={styles.subtitle}>Enter your email address and we'll send you a link to reset your password.</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="john@example.com"
                                placeholderTextColor={colors.subText}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.disabledButton]}
                            onPress={handleSendLink}
                            disabled={loading}
                        >
                            <Text style={styles.submitButtonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 24,
        borderWidth: 3,
        borderColor: colors.border,
        backgroundColor: colors.cardBg,
        paddingHorizontal: 16,
        paddingVertical: 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
        zIndex: 10,
    },
    backText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    header: {
        marginBottom: 32,
        marginTop: 80,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: colors.text,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 16,
        color: colors.subText,
        lineHeight: 24,
        fontWeight: '600',
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '900',
        color: colors.text,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: colors.cardBg,
        borderWidth: 4,
        borderColor: colors.border,
        padding: 16,
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
        shadowColor: colors.shadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
    },
    submitButton: {
        backgroundColor: '#E56DB1',
        paddingVertical: 18,
        borderWidth: 4,
        borderColor: colors.border,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
});
