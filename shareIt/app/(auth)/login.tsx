import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { loginUser, resetPassword } from '../../src/services/auth';
import PrimaryButton from '../../src/components/PrimaryButton';
import { CustomAlert } from '../../src/components/CustomAlert';
import { Colors, Spacing } from '../../src/constants/colors';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ message: '', type: 'info' as 'success' | 'error' | 'info' });

  const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
    setAlertConfig({ message, type });
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    const result = await loginUser(email, password);
    if (!result.success) {
      showAlert(result.message, result.type || 'error');
    }
  };

  const handleForgotPassword = async () => {
    const result = await resetPassword(email);
    showAlert(result.message, result.type || 'info');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Dobrodošli nazaj!</Text>
        <TextInput
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          placeholder="Geslo"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <PrimaryButton title="Prijava" onPress={handleLogin} />
        <Pressable onPress={handleForgotPassword} style={styles.forgotBtn}>
          <Text style={styles.forgotPassword}>Pozabljeno geslo?</Text>
        </Pressable>
        <Link href="/(auth)/registration" style={styles.link}>
          Nimate računa? <Text style={styles.linkText}>Registrirajte se</Text>
        </Link>
      </View>

      <CustomAlert
        visible={alertVisible}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  forgotBtn: { marginTop: Spacing.sm, padding: Spacing.sm },
  forgotPassword: { textAlign: 'center', color: Colors.primary, fontSize: 14 },
  container: { flex: 1, padding: Spacing.md, justifyContent: 'center', gap: Spacing.md },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.lg },
  input: { padding: Spacing.md, backgroundColor: Colors.grayLight, borderRadius: 8 },
  link: { textAlign: 'center', marginTop: Spacing.md },
  linkText: { fontWeight: 'bold', color: Colors.primary },
});

export default LoginScreen;
