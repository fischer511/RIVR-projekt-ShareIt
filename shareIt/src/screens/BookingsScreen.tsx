import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '@src/constants/colors';
import PrimaryButton from '@src/components/PrimaryButton';
import SecondaryButton from '@src/components/SecondaryButton';
import { useRouter } from 'expo-router';

const BookingsScreen: React.FC = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Bookings hub</Text>
        <View style={styles.card}> 
          <PrimaryButton title="Add item" onPress={() => router.push('/(tabs)/add-item')} />
        </View>
        <View style={styles.card}> 
          <SecondaryButton title="Requests" onPress={() => router.push('/bookings/requests')} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: Spacing.md },
  title: { fontSize: 18, fontWeight: '700', color: Colors.black },
  card: { backgroundColor: Colors.white, padding: Spacing.md, borderRadius: Radius.md, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
});

export default BookingsScreen;
