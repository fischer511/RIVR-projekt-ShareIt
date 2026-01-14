import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { registerUser } from '../../src/services/auth';
import PrimaryButton from '../../src/components/PrimaryButton';
import { Colors, Spacing } from '../../src/constants/colors';

const RegistrationScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          placeholder="Password (min. 6 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          placeholder="Your City"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
        />
        <PrimaryButton title="Create Account" onPress={() => registerUser(email, password, location)} />
        <Link href="/(auth)/login" style={styles.link}>Already have an account? <Text style={styles.linkText}>Log in</Text></Link>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, padding: Spacing.md, justifyContent: 'center', gap: Spacing.md },
  input: { padding: Spacing.md, backgroundColor: Colors.grayLight, borderRadius: 8 },
  link: { textAlign: 'center', marginTop: Spacing.md },
  linkText: { fontWeight: 'bold', color: Colors.primary },
});

export default RegistrationScreen;
