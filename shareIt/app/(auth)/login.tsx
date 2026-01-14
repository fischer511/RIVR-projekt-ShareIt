import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, SafeAreaView, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { loginUser } from '../../src/services/auth';
import PrimaryButton from '../../src/components/PrimaryButton';
import { Colors, Spacing } from '../../src/constants/colors';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome back!</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <PrimaryButton title="Login" onPress={() => loginUser(email, password)} />
        <Link href="/(auth)/registration" style={styles.link}>Don't have an account? <Text style={styles.linkText}>Sign up</Text></Link>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, padding: Spacing.md, justifyContent: 'center', gap: Spacing.md },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.lg },
  input: { padding: Spacing.md, backgroundColor: Colors.grayLight, borderRadius: 8 },
  link: { textAlign: 'center', marginTop: Spacing.md },
  linkText: { fontWeight: 'bold', color: Colors.primary },
});

export default LoginScreen;
