import React from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  FlatList, Image, SafeAreaView, Platform
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export interface Member {
  id: string | number;
  name: string;
  avatar: string;
}

interface MembersModalProps {
  visible: boolean;
  onClose: () => void;
  members?: Member[];
  roomTitle?: string;
  currentUserId?: string;
}

const MOCK_MEMBERS: Member[] = [
  { id: 1, name: "Alex Dev", avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=Alex" },
  { id: 2, name: "Sarah Chen", avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=Sarah" },
  { id: 3, name: "Mike Ross", avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=Mike" },
  { id: 4, name: "Jessica Suits", avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=Jessica" },
  { id: 5, name: "Harvey Specter", avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=Harvey" },
];

export default function MembersModal({ visible, onClose, members = MOCK_MEMBERS, roomTitle = "Room Members", currentUserId }: MembersModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const renderMember = ({ item }: { item: Member }) => (
    <View style={styles.memberRow}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar as any} />
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.memberName}>
          {item.name} {String(item.id) === String(currentUserId) ? "(You)" : ""}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{roomTitle}</Text>
              <Text style={styles.subtitle}>{members.length} members</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* List */}
          <FlatList
            data={members}
            renderItem={renderMember}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.inviteButton}>
              <Feather name="user-plus" size={18} color="#000000" />
              <Text style={styles.inviteText}>Invite People</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    height: '80%',
    borderWidth: 4,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 4,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 14,
    color: colors.subText,
    marginTop: 2,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  listContent: {
    padding: 24,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
  },
  footer: {
    padding: 24,
    borderTopWidth: 4,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  inviteButton: {
    backgroundColor: '#E56DB1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 4,
    borderColor: colors.border,
    gap: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  inviteText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 16,
    textTransform: 'uppercase',
  },
});