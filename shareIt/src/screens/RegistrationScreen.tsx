import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, SafeAreaView } from 'react-native';
import { registerUser } from '../services/auth';

const RegistrationScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');

  const handleRegister = async () => {
    const user = await registerUser(email, password, location);
    if (user) {
      // Po uspešni registraciji lahko uporabnika preusmerimo na drug zaslon,
      // npr. na prijavo ali direktno na domači zaslon.
      // Zaenkrat pustimo tako.
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{ padding: 12, backgroundColor: '#eee', borderRadius: 8, marginBottom: 12 }}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ padding: 12, backgroundColor: '#eee', borderRadius: 8, marginBottom: 12 }}
        />
        <TextInput
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
          style={{ padding: 12, backgroundColor: '#eee', borderRadius: 8, marginBottom: 12 }}
        />
        <Pressable onPress={handleRegister} style={{ padding: 12, backgroundColor: 'blue', borderRadius: 8 }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>Register</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default RegistrationScreen;
