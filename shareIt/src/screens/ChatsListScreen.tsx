import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '@src/constants/colors';
import { useRouter } from 'expo-router';
import { subscribeToUserChats, ChatRoom } from '@src/services/chat';

const ChatsListScreen: React.FC = () => {
  const router = useRouter();
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToUserChats((c) => {
      setChats(c);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Moji pogovori</Text>
        <FlatList
          data={chats}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/chat/${item.id}`)}>
              <Text style={styles.itemTitle}>{item.itemTitle}</Text>
              <Text style={styles.meta}>Zadnje sporočilo: {item.lastMessage ?? '—'}</Text>
              <Text style={styles.meta}>Predmet: {item.itemTitle}</Text>
            </Pressable>
          )}
          ListEmptyComponent={() => <Text style={styles.empty}>Nimate pogovorov.</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  title: { fontSize: 18, fontWeight: '700', color: Colors.black, marginBottom: Spacing.sm },
  card: { backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.sm, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: Colors.black },
  meta: { fontSize: 12, color: Colors.grayDark },
  empty: { color: Colors.grayDark, marginTop: Spacing.md },
});

export default ChatsListScreen;
