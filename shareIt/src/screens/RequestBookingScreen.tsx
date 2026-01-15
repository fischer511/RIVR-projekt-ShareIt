import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Radius, Spacing } from '@src/constants/colors';
import FormField from '@src/components/FormField';
import PrimaryButton from '@src/components/PrimaryButton';

const RequestBookingScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ fromDate?: string; toDate?: string }>({});

  const submit = () => {
    const e: typeof errors = {};
    if (!fromDate) e.fromDate = 'Obvezno';
    if (!toDate) e.toDate = 'Obvezno';
    setErrors(e);
    if (Object.keys(e).length) return;
    Alert.alert('Prošnja poslana (demo)');
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Prošnja za izposojo</Text>
        <FormField label="Od" value={fromDate} onChangeText={setFromDate} placeholder="YYYY-MM-DD" error={errors.fromDate} />
        <FormField label="Do" value={toDate} onChangeText={setToDate} placeholder="YYYY-MM-DD" error={errors.toDate} />
        <FormField label="Sporočilo (neobvezno)" value={message} onChangeText={setMessage} placeholder="Napiši sporočilo" />

        <PrimaryButton title="Pošlji" onPress={submit} style={{ marginTop: Spacing.md }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: Spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: Colors.black },
});

export default RequestBookingScreen;
