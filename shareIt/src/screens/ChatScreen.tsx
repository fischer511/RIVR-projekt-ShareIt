import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
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
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const currentUid = auth.currentUser?.uid;
  const headerTitle = useMemo(() => booking?.itemTitle || 'Klepet', [booking]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Text style={styles.title}>{headerTitle}</Text>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingBottom: Spacing.md, flexGrow: 1, justifyContent: 'flex-end' }}
          renderItem={({ item }) => {
            const isMine = item.senderUid === currentUid;
            const timestamp = item.createdAt?.toDate?.() || new Date();
            const timeStr = timestamp instanceof Date ? timestamp.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' }) : '';
            return (
              <View style={[styles.messageBubble, isMine && { alignSelf: 'flex-end' }]}>
                <View style={[styles.messageRow, isMine ? styles.mine : styles.theirs]}>
                  <Text style={styles.messageText}>{item.text}</Text>
                </View>
                <Text style={[styles.timestamp, isMine && { alignSelf: 'flex-end' }]}>{timeStr}</Text>
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
            multiline
          />
          <Pressable
            style={[styles.sendBtn, sending && { opacity: 0.6 }]}
            disabled={sending || !chatId || !currentUid || !text.trim()}
            onPress={async () => {
              if (!chatId || !currentUid || !text.trim() || sending) return;
              try {
                setSending(true);
                console.log('Sending message to chat:', chatId);
                console.log('Current user:', currentUid);
                console.log('Message text:', text);
                await sendChatMessage(chatId, currentUid, text);
                console.log('Message sent successfully');
                setText('');
              } catch (error) {
                console.error('Error sending message:', error);
                Alert.alert('Napaka pri slanju', String(error));
              } finally {
                setSending(false);
              }
            }}
          >
            <Text style={styles.sendText}>{sending ? '⏳' : '✓'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.md },
  title: { fontSize: 18, fontWeight: '700', color: Colors.black, marginBottom: Spacing.md },
  messageBubble: {
    marginBottom: Spacing.sm,
  },
  messageRow: {
    maxWidth: '75%',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: 2,
  },
  mine: { alignSelf: 'flex-end', backgroundColor: Colors.primaryLight },
  theirs: { alignSelf: 'flex-start', backgroundColor: Colors.grayLight },
  messageText: { color: Colors.black, fontSize: 14 },
  timestamp: { fontSize: 11, color: Colors.grayLight, marginHorizontal: Spacing.xs, marginTop: 2 },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', paddingVertical: Spacing.sm, paddingBottom: Spacing.lg },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    maxHeight: 100,
  },
  sendBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', minWidth: 44, minHeight: 44 },
  sendText: { color: Colors.black, fontWeight: '700', fontSize: 16 },
});

export default ChatScreen;
