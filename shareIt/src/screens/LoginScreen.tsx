import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginUser } from '../services/auth';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    await loginUser(email, password);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <TextInput
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{ padding: 12, backgroundColor: '#eee', borderRadius: 8, marginBottom: 12 }}
        />
        <TextInput
          placeholder="Geslo"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ padding: 12, backgroundColor: '#eee', borderRadius: 8, marginBottom: 12 }}
        />
        <Pressable onPress={handleLogin} style={{ padding: 12, backgroundColor: 'blue', borderRadius: 8 }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>Prijava</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
