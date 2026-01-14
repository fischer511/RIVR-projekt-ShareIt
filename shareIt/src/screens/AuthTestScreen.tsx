import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@src/services/firebase';

const AuthTestScreen: React.FC = () => {
  const register = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, 'testuser1@test.com', 'test123456');
      console.log('REGISTER OK', cred.user?.uid);
      Alert.alert('User registered');
    } catch (error: any) {
      console.error(error?.message ?? error);
      Alert.alert(String(error?.code ?? 'auth/error'));
    }
  };

  const register2 = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, 'testuser2@test.com', 'test123456');
      console.log('REGISTER2 OK', cred.user?.uid);
      Alert.alert('User registered');
    } catch (error: any) {
      console.error(error?.message ?? error);
      Alert.alert(String(error?.code ?? 'auth/error'));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Pressable onPress={register} style={{ padding: 12, backgroundColor: '#eee', borderRadius: 8 }}>
          <Text>Register test user</Text>
        </Pressable>
        <View style={{ height: 12 }} />
        <Pressable onPress={register2} style={{ padding: 12, backgroundColor: '#eee', borderRadius: 8 }}>
          <Text>Register test user 2</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default AuthTestScreen;
