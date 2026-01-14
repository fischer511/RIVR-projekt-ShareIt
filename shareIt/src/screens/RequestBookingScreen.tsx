import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    if (!fromDate) e.fromDate = 'Required';
    if (!toDate) e.toDate = 'Required';
    setErrors(e);
    if (Object.keys(e).length) return;
    Alert.alert('Request sent (mock)');
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Request booking</Text>
        <FormField label="From date" value={fromDate} onChangeText={setFromDate} placeholder="YYYY-MM-DD" error={errors.fromDate} />
        <FormField label="To date" value={toDate} onChangeText={setToDate} placeholder="YYYY-MM-DD" error={errors.toDate} />
        <FormField label="Message (optional)" value={message} onChangeText={setMessage} placeholder="Write a note to owner" />

        <PrimaryButton title="Submit" onPress={submit} style={{ marginTop: Spacing.md }} />
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
