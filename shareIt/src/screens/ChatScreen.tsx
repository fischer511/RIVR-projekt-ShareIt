import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius } from '@src/constants/colors';
import { auth } from '@src/services/firebase';
import { getBookingById, Booking } from '@src/services/bookings';
import { getOrCreateChat, sendChatMessage, subscribeToChatMessages, ChatMessage } from '@src/services/chats';

const ChatScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const b = await getBookingById(id);
      if (!b) return;
      setBooking(b);
      const chat = await getOrCreateChat(b);
      setChatId(chat);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!chatId) return;
    const unsub = subscribeToChatMessages(chatId, setMessages);
    return () => unsub();
  }, [chatId]);

  const currentUid = auth.currentUser?.uid;
  const headerTitle = useMemo(() => booking?.itemTitle || 'Klepet', [booking]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>{headerTitle}</Text>
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingBottom: Spacing.md }}
          renderItem={({ item }) => {
            const isMine = item.senderUid === currentUid;
            return (
              <View style={[styles.messageRow, isMine ? styles.mine : styles.theirs]}>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            );
          }}
        />
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Napiši sporočilo..."
            style={styles.input}
          />
          <Pressable
            style={styles.sendBtn}
            onPress={async () => {
              if (!chatId || !currentUid) return;
              await sendChatMessage(chatId, currentUid, text);
              setText('');
            }}
          >
            <Text style={styles.sendText}>Pošlji</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  title: { fontSize: 18, fontWeight: '700', color: Colors.black, marginBottom: Spacing.md },
  messageRow: {
    maxWidth: '75%',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  mine: { alignSelf: 'flex-end', backgroundColor: Colors.primaryLight },
  theirs: { alignSelf: 'flex-start', backgroundColor: Colors.grayLight },
  messageText: { color: Colors.black },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: Spacing.sm },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  sendBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  sendText: { color: Colors.black, fontWeight: '700' },
});

export default ChatScreen;
