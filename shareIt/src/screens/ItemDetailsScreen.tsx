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

// Helpers for simple availability calendar
function parseYMD(ymd?: string) {
  if (!ymd) return null;
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function formatDateShort(ymd: string) {
  const d = parseYMD(ymd);
  if (!d) return ymd;
  return d.getDate().toString();
}

function formatDateMonth(ymd: string) {
  const d = parseYMD(ymd);
  if (!d) return '';
  return d.toLocaleString('default', { month: 'short' });
}

function getDatesBetween(from?: string, to?: string) {
  const start = parseYMD(from);
  const end = parseYMD(to);
  if (!start || !end || start > end) return [];
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}


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
            console.log('[ItemDetails] fetched item id=', id, ' photos=', (fetchedItem as any)?.photos?.slice?.(0,3));
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
        {((item as any).photos && (item as any).photos.length) ? (
          <FlatList
            data={(item as any).photos}
            keyExtractor={(url: string, idx: number) => `${url}-${idx}`}
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

          {item.availability && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Razpoložljivi dnevi</Text>
              <FlatList
                data={getDatesBetween(item.availability.fromDate, item.availability.toDate)}
                horizontal
                keyExtractor={(d) => d}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item: d }) => (
                  <View style={styles.dateChip}>
                    <Text style={styles.dateChipDay}>{formatDateShort(d)}</Text>
                    <Text style={styles.dateChipMonth}>{formatDateMonth(d)}</Text>
                  </View>
                )}
                style={{ marginTop: 8 }}
              />
            </View>
          )}
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
  dateChip: { backgroundColor: Colors.grayLight, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginRight: 8, alignItems: 'center' },
  dateChipDay: { fontSize: 16, fontWeight: '700', color: Colors.black },
  dateChipMonth: { fontSize: 12, color: Colors.grayDark },
});

export default ItemDetailsScreen;
