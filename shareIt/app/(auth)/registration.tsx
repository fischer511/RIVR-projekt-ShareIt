import React, { useState } from 'react';
import { View, Text, TextInput, SafeAreaView, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { registerUser } from '../../src/services/auth';
import PrimaryButton from '../../src/components/PrimaryButton';
import { CustomAlert } from '../../src/components/CustomAlert';
import { Colors, Spacing } from '../../src/constants/colors';

const RegistrationScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ message: '', type: 'info' as 'success' | 'error' | 'info' });

  const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
    setAlertConfig({ message, type });
    setAlertVisible(true);
  };

  const handleRegister = async () => {
    const result = await registerUser(email, password, location);
    showAlert(result.message, result.type || 'info');

    if (result.success) {
      setEmail('');
      setPassword('');
      setLocation('');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Ustvari račun</Text>
        <Text style={styles.hint}>E-mail naslov:</Text>
        <TextInput
          placeholder="ime@domena.si"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <Text style={styles.hint}>Geslo (vsaj 8 znakov):</Text>
        <Text style={styles.requirements}>- Vsaj 1 črka{'\n'}- Vsaj 1 številka{'\n'}- Vsaj 1 poseben znak (!@#$%^&*)</Text>
        <TextInput
          placeholder="Geslo"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <Text style={styles.hint}>Mesto:</Text>
        <TextInput
          placeholder="Tvoje mesto"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
        />
        <PrimaryButton title="Ustvari račun" onPress={handleRegister} />
        <Link href="/(auth)/login" style={styles.link}>
          Že imate račun? <Text style={styles.linkText}>Prijavite se</Text>
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
  container: { flex: 1, padding: Spacing.md, justifyContent: 'center', gap: Spacing.sm },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.md },
  hint: { fontSize: 14, fontWeight: '600', color: Colors.black, marginTop: Spacing.xs },
  requirements: { fontSize: 12, color: Colors.grayDark, marginBottom: Spacing.xs, lineHeight: 18 },
  input: { padding: Spacing.md, backgroundColor: Colors.grayLight, borderRadius: 8 },
  link: { textAlign: 'center', marginTop: Spacing.md },
  linkText: { fontWeight: 'bold', color: Colors.primary },
});

export default RegistrationScreen;
