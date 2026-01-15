import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Image, TextInput, Alert } from 'react-native';
import { Colors, Spacing, Radius } from '@src/constants/colors';
import PrimaryButton from '@src/components/PrimaryButton';
import SecondaryButton from '@src/components/SecondaryButton';
import { useRouter } from 'expo-router';
import { auth } from '@src/services/firebase';
import { getUserBookings, Booking, updateBookingStatus, autoCancelExpiredBookings, submitBookingRating } from '@src/services/bookings';
import { useFocusEffect } from '@react-navigation/native';

const BookingsScreen: React.FC = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingScores, setRatingScores] = useState<Record<string, number>>({});
  const [ratingComments, setRatingComments] = useState<Record<string, string>>({});

  const fetchBookings = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      await autoCancelExpiredBookings({ renterUid: currentUser.uid });
      const userBookings = await getUserBookings(currentUser.uid);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      case 'completed': return '#6B7280';
      case 'cancelled': return '#9CA3AF';
      default: return Colors.black;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'V obdelavi';
      case 'confirmed': return 'Potrjeno';
      case 'rejected': return 'Zavrnjeno';
      case 'completed': return 'Zaključeno';
      case 'cancelled': return 'Preklicano';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Moje izposoje</Text>

        <View style={styles.card}>
          <PrimaryButton title="Dodaj predmet" onPress={() => router.push('/(tabs)/add-item')} />
        </View>

        <View style={styles.card}>
          <SecondaryButton title="Prošnje za moje predmete" onPress={() => router.push('/bookings/requests')} />
        </View>

        <Text style={styles.sectionTitle}>Moje prošnje</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : bookings.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Trenutno ni izposoj</Text>
          </View>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              {booking.itemImage && (
                <Image source={{ uri: booking.itemImage }} style={styles.itemImage} />
              )}
              <View style={styles.bookingInfo}>
                <Text style={styles.itemTitle}>{booking.itemTitle}</Text>
                <Text style={styles.dates}>
                  {booking.dates.length} dan/dni - {booking.totalPrice} EUR
                </Text>
                <Text style={styles.dateRange}>
                  {new Date(booking.dates[0]).toLocaleDateString()} - {new Date(booking.dates[booking.dates.length - 1]).toLocaleDateString()}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
                </View>

                <View style={styles.actions}>
                  <SecondaryButton
                    title="Odpri klepet"
                    onPress={() => router.push(`/chat/${booking.id}`)}
                  />
                  {booking.status === 'pending' ? (
                    <SecondaryButton
                      title="Prekliči prošnjo"
                      onPress={async () => {
                        if (!booking.id) return;
                        await updateBookingStatus(booking.id, 'cancelled', auth.currentUser?.uid);
                        fetchBookings();
                      }}
                    />
                  ) : null}
                  {booking.status === 'confirmed' ? (
                    <SecondaryButton
                      title="Označi kot vrnjeno"
                      onPress={async () => {
                        if (!booking.id) return;
                        await updateBookingStatus(booking.id, 'completed', auth.currentUser?.uid);
                        fetchBookings();
                      }}
                    />
                  ) : null}
                </View>

                {booking.status === 'completed' ? (
                  booking.rating ? (
                    <Text style={styles.ratingText}>Tvoja ocena: {booking.rating.score}/5</Text>
                  ) : (
                    <View style={styles.ratingBox}>
                      <Text style={styles.metaLabel}>Oceni izposojo</Text>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Text
                            key={star}
                            style={[styles.star, (ratingScores[booking.id as string] || 0) >= star && styles.starActive]}
                            onPress={() => setRatingScores((prev) => ({ ...prev, [booking.id as string]: star }))}
                          >
                            ★
                          </Text>
                        ))}
                      </View>
                      <TextInput
                        value={ratingComments[booking.id as string] || ''}
                        onChangeText={(t) => setRatingComments((prev) => ({ ...prev, [booking.id as string]: t }))}
                        placeholder="Komentar (neobvezno)"
                        style={styles.commentInput}
                      />
                      <PrimaryButton
                        title="Shrani oceno"
                        onPress={async () => {
                          if (!booking.id || !booking.itemId) return;
                          if (!auth.currentUser) {
                            Alert.alert('Za oceno se prijavi');
                            return;
                          }
                          const score = ratingScores[booking.id] || 0;
                          if (score < 1) {
                            Alert.alert('Izberi oceno');
                            return;
                          }
                          await submitBookingRating(booking.id, booking.itemId, score, ratingComments[booking.id], auth.currentUser.uid);
                          fetchBookings();
                        }}
                      />
                    </View>
                  )
                ) : null}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  title: { fontSize: 24, fontWeight: '700', color: Colors.black, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.black, marginTop: Spacing.lg, marginBottom: Spacing.md },
  card: { backgroundColor: Colors.white, padding: Spacing.md, borderRadius: Radius.md, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1, marginBottom: Spacing.md },
  loader: { marginTop: Spacing.xl },
  empty: { padding: Spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: 16, color: Colors.gray, textAlign: 'center' },
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: Radius.sm,
    marginRight: Spacing.md,
  },
  bookingInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  dates: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  dateRange: {
    fontSize: 13,
    color: Colors.gray,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  ratingBox: { marginTop: Spacing.sm, gap: Spacing.sm },
  starsRow: { flexDirection: 'row', gap: 6 },
  star: { fontSize: 18, color: Colors.grayDark },
  starActive: { color: '#f59e0b' },
  commentInput: { borderWidth: 1, borderColor: Colors.grayLight, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm },
  metaLabel: { fontSize: 12, color: Colors.grayDark },
  ratingText: { marginTop: Spacing.sm, color: Colors.grayDark },
});

export default BookingsScreen;
