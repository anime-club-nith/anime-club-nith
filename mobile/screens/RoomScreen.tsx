import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, FlatList, Dimensions, StatusBar as RNStatusBar, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import client from '../services/client'; // Import client
import { Room } from '../types'; // Import Room type
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

// UI Helper to map generic rooms to icons/colors if they don't have them
const getRoomStyle = (index: number) => {
  const styles = [
    { icon: 'box', color: '#6366f1' },
    { icon: 'hash', color: '#8b5cf6' },
    { icon: 'cpu', color: '#ec4899' },
    { icon: 'cloud', color: '#0ea5e9' },
    { icon: 'pen-tool', color: '#f43f5e' },
    { icon: 'layout', color: '#10b981' },
    { icon: 'server', color: '#f59e0b' },
  ];
  return styles[index % styles.length] as { icon: keyof typeof Feather.glyphMap; color: string };
};

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

export default function RoomScreen({ navigation }: any) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { colors, theme, toggleTheme } = useTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await client.get('/api/room/allRooms');
      setRooms(response.data.rooms);
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      showToast('Failed to load rooms', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.replace('Welcome');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleJoinRoom = async (room: Room) => {
    try {
      await client.get(`/api/room/${room.roomId}/join`);
    } catch (error) {
      console.log("Join room silent fail (maybe already joined or error)", error);
    }

    navigation.navigate('Chat', {
      roomTitle: room.title,
      roomId: room.roomId
    });
  };

  const renderRoomCard = ({ item, index }: { item: Room; index: number }) => {
    const style = getRoomStyle(index);
    const iconName = item.iconName ? (item.iconName as keyof typeof Feather.glyphMap) : style.icon;
    const color = item.color || style.color;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleJoinRoom(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Feather name={iconName} size={24} color={color} />
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.joinText}>Join</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.text} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.title}>Choose a Room</Text>
        </View>
        <View style={styles.headerButtons}>
          {/* Theme Toggling */}
          <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
            <Feather name={theme === 'dark' ? "sun" : "moon"} size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
            <View style={styles.logoutContainer}>
              <Feather name="log-out" size={18} color="#ef4444" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E56DB1" />
        </View>
      ) : (
        <FlatList
          data={rooms}
          renderItem={renderRoomCard}
          keyExtractor={item => item._id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ color: colors.text, textAlign: 'center', marginTop: 50, fontWeight: '700' }}>No active rooms found.</Text>
          }
        />
      )}

    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: 14,
    color: colors.subText,
    marginBottom: 4,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    color: colors.text,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  themeButton: {
    width: 40,
    height: 40,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  profileButton: {
    padding: 0,
  },
  logoutContainer: {
    width: 40,
    height: 40,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: COLUMN_WIDTH,
    backgroundColor: colors.cardBg,
    borderWidth: 4,
    borderColor: colors.border,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  cardDesc: {
    fontSize: 13,
    color: colors.subText,
    lineHeight: 18,
    marginBottom: 16,
    height: 36,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  joinText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.text,
    textTransform: 'uppercase',
  },
});