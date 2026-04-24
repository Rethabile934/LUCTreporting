import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { registerUser } from '../../firebase/auth';
import InputField from '../../components/InputField';

const ROLES = [
  { label: 'Student', value: 'student' },
  { label: 'Lecturer', value: 'lecturer' },
  { label: 'Principal Lecturer (PRL)', value: 'prl' },
  { label: 'Program Leader (PL)', value: 'pl' }
];

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirm || !role) {
      Alert.alert('Missing Fields', 'Please fill in all fields and select a role.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await registerUser(email.trim(), password, role, name.trim());
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>LUCT</Text>
        <Text style={styles.logoSub}>Faculty Reporting System</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register to get started</Text>

        <InputField
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
        />

        <InputField
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@limkokwing.ac.ls"
          keyboardType="email-address"
        />

        <InputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Min. 6 characters"
          secureTextEntry
        />

        <InputField
          label="Confirm Password"
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Repeat your password"
          secureTextEntry
        />

        <Text style={styles.roleLabel}>Select Your Role</Text>
        <View style={styles.rolesGrid}>
          {ROLES.map(r => (
            <TouchableOpacity
              key={r.value}
              style={[styles.roleBtn, role === r.value && styles.roleBtnActive]}
              onPress={() => setRole(r.value)}
            >
              <Text style={[styles.roleBtnText, role === r.value && styles.roleBtnTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Create Account</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    padding: 24
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: 32
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#4A90D9',
    letterSpacing: 6
  },
  logoSub: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
    letterSpacing: 1
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20
  },
  roleBtn: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#f9f9f9'
  },
  roleBtnActive: {
    borderColor: '#4A90D9',
    backgroundColor: '#e8f0fb'
  },
  roleBtnText: {
    fontSize: 13,
    color: '#555'
  },
  roleBtnTextActive: {
    color: '#4A90D9',
    fontWeight: '700'
  },
  button: {
    backgroundColor: '#4A90D9',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  linkBtn: {
    marginTop: 18,
    alignItems: 'center'
  },
  linkText: {
    color: '#888',
    fontSize: 14
  },
  linkBold: {
    color: '#4A90D9',
    fontWeight: '700'
  }
});