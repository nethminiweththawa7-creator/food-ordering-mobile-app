import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' (Customer) | 'admin' (Admin)
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password.trim());
    setLoading(false);

    if (!result.success) {
      showAlert('Login Failed', result.message || 'Invalid email or password.');
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          {/* Header */}
          <Text style={styles.brandTitle}>FoodieExpress 🍟</Text>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to discover the most delicious food</Text>

          {/* Segmented Role Tabs */}
          <View style={styles.segmentedTabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                role === 'user' ? styles.tabActiveCustomer : styles.tabInactive,
              ]}
              onPress={() => {
                setRole('user');
                setEmail('');
                setPassword('');
              }}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 15, marginRight: 6 }}>👤</Text>
              <Text
                style={[
                  styles.tabText,
                  role === 'user' ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                Customer Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                role === 'admin' ? styles.tabActiveAdmin : styles.tabInactive,
              ]}
              onPress={() => {
                setRole('admin');
                setEmail('admin@foodapp.com');
                setPassword('admin123');
              }}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 15, marginRight: 6 }}>⚙️</Text>
              <Text
                style={[
                  styles.tabText,
                  role === 'admin' ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                Admin Login
              </Text>
            </TouchableOpacity>
          </View>

          {role === 'admin' && (
            <View style={styles.adminBadgeNotice}>
              <Text style={styles.adminBadgeText}>
                🔑 Default Admin Credentials: <Text style={{ fontWeight: 'bold' }}>admin@foodapp.com</Text> / <Text style={{ fontWeight: 'bold' }}>admin123</Text>
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>📧</Text>
              <TextInput
                style={styles.textInput}
                placeholder="desh@gmail.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeToggleBtn}
              >
                <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Primary Crimson Red Sign In Button */}
          <TouchableOpacity
            style={[styles.signInButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.signInButtonText}>
                Sign In as {role === 'admin' ? 'Admin' : 'Customer'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Footer Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLinkText}>Register Here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Clean Light Canvas matching Pic 3
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1.5,
    borderColor: '#FEE2E2', // Soft Red Outline matching Pic 3
    elevation: 4,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#E53935', // Crimson Red Primary Accent
    textAlign: 'center',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  segmentedTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  adminBadgeNotice: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
    alignItems: 'center',
  },
  adminBadgeText: {
    color: '#E53935',
    fontSize: 13,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 11,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActiveCustomer: {
    backgroundColor: '#E53935', // Crimson Red Active Tab matching Pic 3
  },
  tabActiveAdmin: {
    backgroundColor: '#1F2937',
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontWeight: '600',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabTextInactive: {
    color: '#6B7280',
  },
  formGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#1F2937',
    fontSize: 15,
    paddingVertical: 0,
  },
  eyeToggleBtn: {
    padding: 6,
  },
  signInButton: {
    backgroundColor: '#E53935', // Primary Crimson Red Button matching Pic 3
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 22,
    elevation: 3,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  registerLinkText: {
    color: '#E53935',
    fontWeight: '700',
    fontSize: 14,
  },
});
