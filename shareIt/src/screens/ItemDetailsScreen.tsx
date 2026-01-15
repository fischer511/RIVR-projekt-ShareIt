import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Alert, ActivityIndicator, Modal, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Radius, Spacing } from '../constants/colors';
import { Item } from '../models/Item';
import { getItemById } from '../services/items';
import { getOrCreateChatRoom } from '../services/chat';
import { auth } from '../services/firebase';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';


const ItemDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [firstMessage, setFirstMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchItem = async () => {
        setLoading(true);
        try {
          const fetchedItem = await getItemById(id);
          setItem(fetchedItem);
        } catch (error) {
          console.error("Error fetching item details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchItem();
    }
  }, [id]);

  const handleContactOwner = async () => {
    if (!auth.currentUser) {
      Alert.alert('Prijava potrebna', 'Za pošiljanje sporočil se morate prijaviti.');
      return;
    }
    if (!item || !item.ownerUid) {
      Alert.alert('Napaka', 'Ni mogoče odpreti pogovora.');
      return;
    }
    if (auth.currentUser.uid === item.ownerUid) {
      Alert.alert('Opozorilo', 'To je vaš predmet.');
      return;
    }
    setShowMessageModal(true);
  };

  const handleSendFirstMessage = async () => {
    if (!firstMessage.trim()) return;
    setSending(true);
    try {
      const chatId = await getOrCreateChatRoom(item!.id, item!.title, item!.ownerUid);
      await import('../services/chat').then(mod => mod.sendMessage(chatId, firstMessage));
      setShowMessageModal(false);
      setFirstMessage('');
      router.push(`/chat/${chatId}`);
    } catch (error) {
      Alert.alert('Napaka', 'Ni mogoče odpreti pogovora.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, styles.center]}>
          <Text style={styles.empty}>Item not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {item.images && item.images.length > 0 ? (
          <FlatList
            data={item.images}
            keyExtractor={(url, idx) => `${url}-${idx}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: url }) => (
              <Image source={{ uri: url }} style={styles.image} />
            )}
            style={styles.carousel}
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>{item.category} • €{item.pricePerDay}/day • {item.city}</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            {/* <Text style={styles.status}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text> */}
          </View>
          
          {/*
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner</Text>
            <Text style={styles.owner}>Lastnik</Text>
          </View>
          */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="Rezerviraj" onPress={() => router.push(`/request/${id}`)} />
          <SecondaryButton 
            title="Kontaktiraj lastnika" 
            onPress={handleContactOwner}
          />
        </View>
        <Modal
          visible={showMessageModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMessageModal(false)}
        >
          <View style={{ flex:1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent:'center', alignItems:'center' }}>
            <View style={{ backgroundColor:'#fff', padding:24, borderRadius:12, width:'85%' }}>
              <Text style={{ fontWeight:'bold', fontSize:16, marginBottom:8 }}>Začni pogovor</Text>
              <TextInput
                placeholder="Napišite prvo sporočilo..."
                value={firstMessage}
                onChangeText={setFirstMessage}
                style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:8, minHeight:40, marginBottom:12 }}
                multiline
                autoFocus
              />
              <View style={{ flexDirection:'row', justifyContent:'flex-end', gap:12 }}>
                <Pressable onPress={() => setShowMessageModal(false)} style={{ padding:8 }}><Text>Prekliči</Text></Pressable>
                <Pressable onPress={handleSendFirstMessage} style={{ padding:8 }} disabled={sending || !firstMessage.trim()}>
                  <Text style={{ color: sending || !firstMessage.trim() ? '#aaa' : Colors.primary, fontWeight:'bold' }}>Pošlji</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  empty: { color: Colors.grayDark },
  carousel: { height: 240, borderBottomWidth: 1, borderBottomColor: Colors.grayLight },
  image: { width: '100%', height: 240, backgroundColor: Colors.grayLight },
  imagePlaceholder: { height: 240, backgroundColor: Colors.grayLight, borderBottomWidth: 1, borderBottomColor: Colors.grayLight },
  info: { padding: Spacing.md, gap: Spacing.md, flex: 1 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.black },
  meta: { fontSize: 14, color: Colors.grayDark },
  
  section: { gap: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.grayDark },
  status: { fontSize: 15, fontWeight: 'bold', color: Colors.primary },
  owner: { fontSize: 15, color: Colors.black },
  desc: { fontSize: 15, color: Colors.black, lineHeight: 22 },

  actions: { padding: Spacing.md, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.grayLight },
});

export default ItemDetailsScreen;
