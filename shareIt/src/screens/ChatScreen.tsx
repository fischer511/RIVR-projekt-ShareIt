import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '@src/constants/colors';
import { auth } from '@src/services/firebase';
import {
  Message,
  ChatRoom,
  subscribeToMessages,
  sendMessage,
  getChatRoom,
} from '@src/services/chat';
//import { getUserProfile } from '@src/services/items';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.grayLight, backgroundColor: Colors.white },
  backButton: { marginRight: Spacing.sm },
  backText: { fontSize: 18, color: Colors.primary },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.black },
  headerSubtitle: { fontSize: 13, color: Colors.grayDark },
  messagesList: { padding: Spacing.sm, flexGrow: 1 },
  messageBubble: { maxWidth: '80%', borderRadius: 12, padding: Spacing.sm, marginBottom: 8 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  otherMessage: { alignSelf: 'flex-start', backgroundColor: Colors.grayLight, borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, color: Colors.black, lineHeight: 20 },
  myMessageText: { color: Colors.black },
  messageTime: { fontSize: 10, color: Colors.grayDark, marginTop: 4, alignSelf: 'flex-end' },
  myMessageTime: { color: Colors.black, opacity: 0.7 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { color: Colors.grayDark, fontSize: 14 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.grayLight, backgroundColor: Colors.white },
  input: { flex: 1, minHeight: 40, maxHeight: 100, borderWidth: 1, borderColor: Colors.grayLight, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, fontSize: 15, color: Colors.black },
  sendButton: { marginLeft: Spacing.sm, width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: Colors.grayLight },
  sendButtonText: { fontSize: 18, color: Colors.black },
});

const ChatScreen: React.FC = () => {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  // const [otherUserEmail, setOtherUserEmail] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!chatId) return;

    // Pridobi podatke o chat sobi
    const fetchChatRoom = async () => {
      const room = await getChatRoom(chatId);
      setChatRoom(room);

      // Lahko dodaš prikaz drugega uporabnika, če želiš, npr. UID ali "Drugi uporabnik"
      setLoading(false);
    };

    fetchChatRoom();

    // Naroči se na sporočila
    const unsubscribe = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    return () => unsubscribe();
  }, [chatId, currentUserId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !chatId || sending) return;
    setSending(true);
    try {
      await sendMessage(chatId, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate?.() ?? new Date(timestamp);
    return date.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Nazaj</Text>
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {chatRoom?.itemTitle ?? 'Chat'}
            </Text>
              {/* Lahko dodaš prikaz drugega uporabnika, če želiš */}
              <Text style={styles.headerSubtitle} numberOfLines={1} />
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => {
            const isMe = item.senderId === currentUserId;
            return (
              <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
                <Text style={[styles.messageText, isMe && styles.myMessageText]}>
                  {item.text}
                </Text>
                <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Še ni sporočil. Začnite pogovor!</Text>
            </View>
          )}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Napiši sporočilo..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <Pressable
            style={styles.sendButton}
            onPress={handleSend}
            disabled={sending || !newMessage.trim()}
          >
            <Text style={styles.sendButtonText}>Pošlji</Text>
          </Pressable>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
};

export default ChatScreen;
