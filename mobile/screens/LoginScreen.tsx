import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import client from '../services/client'; // Import the client
import { useToast } from '../context/ToastContext';
import { syncPushToken } from '../services/notification';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();
  const { colors, theme } = useTheme();
  const styles = createStyles(colors);

  const [showGoogleMockModal, setShowGoogleMockModal] = useState(false);

  const handleMockGoogleLogin = async (mockToken: string) => {
    setShowGoogleMockModal(false);
    try {
      console.log("Mock Google Logging in with token:", mockToken);
      const response = await client.post('/api/auth/google-login-success', { accessToken: mockToken });
      console.log('Google login successful:', response.data);

      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      if (response.data.user && response.data.user._id) {
        await AsyncStorage.setItem('userId', response.data.user._id);
        await AsyncStorage.setItem('userName', response.data.user.name);
      }

      showToast('Logged in successfully with Google', 'success');
      navigation.replace('Room');

      // Sync push token
      syncPushToken();
    } catch (error: any) {
      console.error('Google login error:', error);
      const message = error.response?.data?.message || error.message || 'Google sign-in failed';
      showToast(message, 'error');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      console.log("Logging in with:", email);
      const response = await client.post('/api/auth/login', { email, password });
      console.log('Login successful:', response.data);

      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      if (response.data.user && response.data.user._id) {
        await AsyncStorage.setItem('userId', response.data.user._id);
        await AsyncStorage.setItem('userName', response.data.user.name);
      }

      showToast(response.data.message, 'success');
      navigation.replace('Room');

      // Sync push token
      syncPushToken();
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Invalid credentials';
      showToast(message, 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={20} color={colors.text} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Enter your credentials to access the workspace.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputCard}>
                <TextInput
                  style={styles.input}
                  placeholder="example@gmail.com"
                  placeholderTextColor={colors.subText}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputCard}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.subText}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={colors.subText} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={() => setShowGoogleMockModal(true)} 
              activeOpacity={0.85}
            >
              <FontAwesome name="google" size={18} color={colors.text} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showGoogleMockModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGoogleMockModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign in with Google</Text>
            <Text style={styles.modalSubtitle}>Demo mode: select a sandbox Google account.</Text>

            <View style={styles.accountsList}>
              {[
                { name: "Vismay Gawai", email: "vismay@nith.ac.in", token: "mock-access-token-otaku" },
                { name: "Anime Fan", email: "fan@nith.ac.in", token: "mock-access-token-fan" },
                { name: "Otaku Member", email: "otaku@nith.ac.in", token: "mock-access-token-otaku" },
              ].map((acc) => (
                <TouchableOpacity
                  key={acc.email}
                  onPress={() => handleMockGoogleLogin(acc.token)}
                  style={styles.accountCard}
                >
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{acc.name[0]}</Text>
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{acc.name}</Text>
                    <Text style={styles.accountEmail}>{acc.email}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={() => setShowGoogleMockModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    marginBottom: 36,
    marginTop: 72,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.subText,
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.subText,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inputCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    zIndex: 10,
  },
  loginButton: {
    backgroundColor: '#E56DB1',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#E56DB1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    color: colors.subText,
    fontSize: 14,
  },
  linkText: {
    color: '#E56DB1',
    fontSize: 14,
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#E56DB1',
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10,
    gap: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.subText,
    marginBottom: 20,
  },
  accountsList: {
    gap: 10,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E56DB1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  accountEmail: {
    fontSize: 12,
    color: colors.subText,
    marginTop: 1,
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
  },
  modalCloseText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
