// Script to add test data to Firestore
// Run with: node scripts/addTestData.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config - uses same config as your app
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test items data
const testItems = [
  {
    title: "Električna žaga Bosch",
    description: "Profesionalna električna žaga, odlično stanje. Primerna za rezanje lesa.",
    category: "Orodje",
    pricePerDay: 15,
    city: "Ljubljana",
    location: { lat: 46.0569, lng: 14.5058 },
    images: ["https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400"],
    status: "available",
    ownerUid: "demo-user-1",
  },
  {
    title: "Električni vrtalnik Makita",
    description: "Zmogljiv vrtalnik z baterijo. Vključeni dodatki.",
    category: "Orodje",
    pricePerDay: 10,
    city: "Ljubljana",
    location: { lat: 46.0511, lng: 14.5051 },
    images: ["https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400"],
    status: "available",
    ownerUid: "demo-user-1",
  },
  {
    title: "Lestev 5m",
    description: "Aluminijasta lestev, nosilnost 150kg. Idealna za višja dela.",
    category: "Orodje",
    pricePerDay: 8,
    city: "Maribor",
    location: { lat: 46.5547, lng: 15.6459 },
    images: ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400"],
    status: "available",
    ownerUid: "demo-user-2",
  },
  {
    title: "Šotor za 4 osebe",
    description: "Družinski šotor, vodoodporen. Idealen za kampiranje.",
    category: "Šport",
    pricePerDay: 20,
    city: "Ljubljana",
    location: { lat: 46.0489, lng: 14.5065 },
    images: ["https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400"],
    status: "available",
    ownerUid: "demo-user-1",
  },
  {
    title: "Kolo za otroke (5-8 let)",
    description: "Modro otroško kolo z podpornimi kolesi. Zelo dobro ohranjeno.",
    category: "Šport",
    pricePerDay: 5,
    city: "Celje",
    location: { lat: 46.2396, lng: 15.2675 },
    images: ["https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400"],
    status: "available",
    ownerUid: "demo-user-3",
  },
  {
    title: "Projektorski sistem",
    description: "Full HD projektor s platnom. Odličen za dogodki ali filme doma.",
    category: "Elektronika",
    pricePerDay: 30,
    city: "Ljubljana",
    location: { lat: 46.0568, lng: 14.5078 },
    images: ["https://images.unsplash.com/photo-1560109947-543149eceb16?w=400"],
    status: "available",
    ownerUid: "demo-user-2",
  },
  {
    title: "Profesionalna kamera Canon EOS",
    description: "DSLR kamera s objektivi 18-55mm in 50mm. Idealna za fotografiranje dogodkov.",
    category: "Elektronika",
    pricePerDay: 40,
    city: "Maribor",
    location: { lat: 46.5577, lng: 15.6455 },
    images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400"],
    status: "available",
    ownerUid: "demo-user-3",
  },
  {
    title: "Mixer KitchenAid",
    description: "Planetarni mešalnik za peko. Moč 300W, več nastavkov.",
    category: "Kuhinja",
    pricePerDay: 12,
    city: "Kranj",
    location: { lat: 46.2389, lng: 14.3555 },
    images: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400"],
    status: "available",
    ownerUid: "demo-user-1",
  },
];

async function addTestData() {
  console.log('🔄 Adding test data to Firestore...\n');
  
  try {
    const itemsRef = collection(db, 'items');
    
    for (const item of testItems) {
      const docRef = await addDoc(itemsRef, {
        ...item,
        createdAt: serverTimestamp(),
      });
      console.log(`✅ Added: "${item.title}" (ID: ${docRef.id})`);
    }
    
    console.log(`\n✨ Successfully added ${testItems.length} test items!`);
    console.log('You can now see them in your app.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding test data:', error);
    process.exit(1);
  }
}

addTestData();
