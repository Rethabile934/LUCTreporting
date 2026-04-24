import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, Image
} from 'react-native';
import { loginUser } from '../../firebase/auth';
import InputField from '../../components/InputField';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
    } catch (error) {
      Alert.alert('Login Failed', error.message);
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
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

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
          placeholder="Enter your password"
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Sign In</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkBold}>Register</Text>
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
  button: {
    backgroundColor: '#4A90D9',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8
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