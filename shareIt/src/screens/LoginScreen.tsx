import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, SafeAreaView } from 'react-native';
import { loginUser } from '../services/auth';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const user = await loginUser(email, password);
    if (user) {
      // Po uspešni prijavi preusmerimo uporabnika na glavni zaslon.
      // To bomo uredili v naslednjem koraku, ko bomo delali na navigaciji.
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
        <Pressable onPress={handleLogin} style={{ padding: 12, backgroundColor: 'blue', borderRadius: 8 }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>Login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
