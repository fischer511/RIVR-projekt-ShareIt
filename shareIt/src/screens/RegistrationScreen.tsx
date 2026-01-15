import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerUser } from '../services/auth';

const RegistrationScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');

  const handleRegister = async () => {
    await registerUser(email, password, location);
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
        <TextInput
          placeholder="Lokacija"
          value={location}
          onChangeText={setLocation}
          style={{ padding: 12, backgroundColor: '#eee', borderRadius: 8, marginBottom: 12 }}
        />
        <Pressable onPress={handleRegister} style={{ padding: 12, backgroundColor: 'blue', borderRadius: 8 }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>Registracija</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default RegistrationScreen;
