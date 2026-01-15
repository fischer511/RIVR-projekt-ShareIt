import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const testItems = [
  {
    title: "Bosch Professional vrtalnik GSR 18V-21",
    description: "Akumulatorski vrtalnik, 2 bateriji 18V/2.0Ah, polnilec in kovček. Idealen za vrtanje in vijačenje. Odlično stanje, malokrat uporabljen.",
    category: "Orodje",
    pricePerDay: 12,
    city: "Ljubljana",
    location: { lat: 46.0569, lng: 14.5058 },
    images: ["https://source.unsplash.com/800x600/?drill,tool"],
    status: "available",
  },
  {
    title: "Električna verižna žaga Stihl MSE 170",
    description: "Zmogljiva električna žaga za rezanje drv in obrezovanje. Dolžina meča 35cm. Zelo dobro vzdrževana, pripravljena za uporabo.",
    category: "Orodje",
    pricePerDay: 15,
    city: "Ljubljana",
    location: { lat: 46.0511, lng: 14.5051 },
    images: ["https://source.unsplash.com/800x600/?chainsaw,saw"],
    status: "available",
  },
  {
    title: "Aluminijasta teleskopska lestev 5m",
    description: "Lahka in stabilna lestev, nosilnost do 150kg. Nastavljiva višina. Popolna za delo na višini - čiščenje oken, pleskanje, popravila.",
    category: "Orodje",
    pricePerDay: 8,
    city: "Maribor",
    location: { lat: 46.5547, lng: 15.6459 },
    images: ["https://source.unsplash.com/800x600/?ladder,tools"],
    status: "available",
  },
  {
    title: "Družinski kamp šotor za 4 osebe",
    description: "Quechua šotor 2 Seconds, avtomatsko odpiranje. Vodoodporen, z moskitiero. Vključen transportni kovček. Odličen za izlete in festivale.",
    category: "Šport",
    pricePerDay: 18,
    city: "Ljubljana",
    location: { lat: 46.0489, lng: 14.5065 },
    images: ["https://source.unsplash.com/800x600/?tent,camping"],
    status: "available",
  },
  {
    title: "Otroško kolo 20 col (6-9 let)",
    description: "Modro gorsko kolo z menjalniki. Nastavljiva višina sedeža, dobra kolesa. Popolno za prvega kolesarja!",
    category: "Šport",
    pricePerDay: 5,
    city: "Celje",
    location: { lat: 46.2396, lng: 15.2675 },
    images: ["https://source.unsplash.com/800x600/?kids-bike,bicycle"],
    status: "available",
  },
  {
    title: "Full HD projektor BenQ + platno 2m",
    description: "Projektor 1080p s 3000 ANSI lumens, vključeno prenosno projekcijsko platno. Idealno za filmske večere, predstavitve ali praznovanja.",
    category: "Elektronika",
    pricePerDay: 25,
    city: "Ljubljana",
    location: { lat: 46.0568, lng: 14.5078 },
    images: ["https://source.unsplash.com/800x600/?projector,cinema"],
    status: "available",
  },
  {
    title: "Canon EOS 2000D + 2 objektiva",
    description: "DSLR kamera 24MP, objektiva 18-55mm in 50mm f/1.8. Torba, polnilec, 2 bateriji, 32GB SD kartica. Popolna za začetnike v fotografiji.",
    category: "Elektronika",
    pricePerDay: 35,
    city: "Maribor",
    location: { lat: 46.5577, lng: 15.6455 },
    images: ["https://source.unsplash.com/800x600/?camera,canon"],
    status: "available",
  },
  {
    title: "KitchenAid planetarni mešalnik 4.8L",
    description: "Profesionalni kuhinjski robot z nastavki za mešanje, stepanje in gnetenje. 10 hitrosti. Idealen za peko tort, kruha in sladic.",
    category: "Kuhinja",
    pricePerDay: 10,
    city: "Kranj",
    location: { lat: 46.2389, lng: 14.3555 },
    images: ["https://source.unsplash.com/800x600/?mixer,kitchen"],
    status: "available",
  },
];

export const addTestData = async (userId: string) => {
  try {
    const itemsRef = collection(db, 'items');
    
    for (const item of testItems) {
      await addDoc(itemsRef, {
        ...item,
        ownerUid: userId,
        createdAt: serverTimestamp(),
      });
    }
    
    return { success: true, count: testItems.length };
  } catch (error) {
    console.error('Error adding test data:', error);
    throw error;
  }
};
