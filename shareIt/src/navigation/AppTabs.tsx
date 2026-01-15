import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

const AppTabs: React.FC = () => {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.grayDark,
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Domov',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="favorites" 
        options={{ 
          title: 'Priljubljeni',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="add-item" 
        options={{ 
          title: 'Dodaj',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="bookings" 
        options={{ 
          title: 'Izposoje',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="explore" 
        options={{ 
          href: null, // Hide from tabs
        }} 
      />
    </Tabs>
  );
};

export default AppTabs;
