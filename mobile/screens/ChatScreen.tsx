import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity,
    SafeAreaView, Platform, FlatList, Image, StatusBar as RNStatusBar, Keyboard, Animated, ActivityIndicator, Modal, ScrollView
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Socket } from 'socket.io-client';
import { jwtDecode } from "jwt-decode";
import { StatusBar } from 'expo-status-bar';

import { initSocket, disconnectSocket } from '../services/socket';
import AttachmentModal from '../components/AttachmentModal';
import CodeSnippetModal from '../components/CodeSnippetModal';
import MembersModal from '../components/MembersModal';
import client from '../services/client'; // Import client
import { Message, User } from '../types'; // Import types
import { useToast } from '../context/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

export default function ChatScreen({ navigation, route }: any) {
    const { roomTitle, roomId } = route.params || { roomTitle: "Room", roomId: "" };

    const [text, setText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [isSending, setIsSending] = useState(false); // New state to prevent duplicates
    const [socketConnected, setSocketConnected] = useState(false); // Connection status
    const [roomMongoId, setRoomMongoId] = useState<string | null>(null); // Store actual _id for chat checks
    const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const keyboardHeight = useRef(new Animated.Value(0)).current;

    const [members, setMembers] = useState<any[]>([]); // Use appropriate type or import Member

    const { colors, theme, toggleTheme } = useTheme();
    const styles = createStyles(colors);

    const socketRef = useRef<Socket | null>(null);
    const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://anime-club-backend.onrender.com"; // Fallback or env

    const fetchRoomInfo = async () => {
        try {
            const response = await client.get(`/api/room/${roomId}`);
            const roomData = Array.isArray(response.data.room) ? response.data.room[0] : response.data.room;

            if (roomData) {
                if (roomData._id) {
                    setRoomMongoId(roomData._id);
                }

                if (roomData.members) {
                    const mappedMembers = roomData.members.map((m: any) => ({
                        id: m._id,
                        name: m.name,
                        avatar: m.avatar || `https://api.dicebear.com/7.x/initials/png?seed=${m.name}`
                    }));
                    setMembers(mappedMembers);
                }
            }
        } catch (error) {
            console.error("Error fetching room info:", error);
        }
    };

    // Get current user from storage/context
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                if (storedToken) {
                    const decoded: any = jwtDecode(storedToken);
                    setCurrentUser({
                        _id: decoded.userId || decoded._id || decoded.id,
                        name: decoded.name,
                        email: decoded.email,
                        avatar: decoded.avatar
                    });
                }
            } catch (e) {
                console.error("Failed to load user from token", e);
            }
        };
        loadUser();
    }, []);

    // Keyboard handling
    useEffect(() => {
        const showSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                Animated.timing(keyboardHeight, {
                    duration: Platform.OS === 'ios' ? e.duration : 250,
                    toValue: e.endCoordinates.height - (Platform.OS === 'ios' ? 34 : 0),
                    useNativeDriver: false,
                }).start();
            }
        );
        const hideSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            (e) => {
                Animated.timing(keyboardHeight, {
                    duration: Platform.OS === 'ios' ? e.duration : 250,
                    toValue: 0,
                    useNativeDriver: false,
                }).start();
            }
        );
        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    // Auto-scroll when keyboard opens
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 300);
        }
    }, [keyboardHeight]);

    // Auto-scroll when messages change
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 400);
        }
    }, [messages]);

    // Date separator helper functions
    const getDateLabel = (timestamp: string | Date): string => {
        const messageDate = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const resetTime = (date: Date) => {
            date.setHours(0, 0, 0, 0);
            return date;
        };

        const messageDateOnly = resetTime(new Date(messageDate));
        const todayOnly = resetTime(new Date(today));
        const yesterdayOnly = resetTime(new Date(yesterday));

        if (messageDateOnly.getTime() === todayOnly.getTime()) {
            return 'Today';
        } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
            return 'Yesterday';
        } else {
            return messageDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    };

    const groupMessagesWithDates = (messages: Message[]): any[] => {
        if (!messages || messages.length === 0) return [];

        const grouped: any[] = [];
        let lastDate: string | null = null;

        messages.forEach((message) => {
            const dateLabel = getDateLabel(message.createdAt);

            if (dateLabel !== lastDate) {
                grouped.push({
                    type: 'date-separator',
                    id: `date-${message.createdAt}`,
                    label: dateLabel
                });
                lastDate = dateLabel;
            }

            grouped.push({ ...message, type: 'message' });
        });

        return grouped;
    };

    // Fetch Messages
    const fetchMessages = async () => {
        if (!roomMongoId) return;
        try {
            const response = await client.get(`/api/chat/chat-history/${roomMongoId}`);
            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching chat:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load: Fetch room info to get _id
    useEffect(() => {
        fetchRoomInfo();
    }, [roomId]);

    useEffect(() => {
        if (roomMongoId && currentUser) {
            fetchMessages();

            // Socket Connection
            socketRef.current = initSocket();

            socketRef.current.on('connect', () => {
                setSocketConnected(true);
            });
            socketRef.current.on('disconnect', () => {
                setSocketConnected(false);
            });

            socketRef.current.emit("join_room", {
                room: roomMongoId,
                userId: currentUser?._id
            });

            socketRef.current.on("receive_message", (newMessage: Message) => {
                const senderId = typeof newMessage.sender === 'string'
                    ? newMessage.sender
                    : newMessage.sender._id;

                if (String(senderId) === String(currentUser._id)) return;

                setMessages((prevMessages) => {
                    if (prevMessages.some(m => m._id === newMessage._id)) {
                        return prevMessages;
                    }
                    return [...prevMessages, newMessage];
                });
            });

            return () => {
                disconnectSocket();
            };
        }
    }, [roomMongoId, currentUser]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0]);
            setShowAttachmentModal(false);
        }
    };

    const handleSend = async () => {
        if (!text.trim() && !selectedImage) return;
        if (isSending) return;

        setIsSending(true);
        const tempId = Date.now().toString();
        const optimisticMessage: Message = {
            _id: tempId,
            text,
            sender: {
                _id: currentUser?._id || 'me',
                name: currentUser?.name || 'Me',
                email: currentUser?.email || '',
                avatar: currentUser?.avatar
            },
            room: roomMongoId!,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'sending',
            imageURL: selectedImage ? selectedImage.uri : undefined
        };

        setMessages(prev => [...prev, optimisticMessage]);

        try {
            if (roomMongoId) {
                const formData = new FormData();
                if (text.trim()) formData.append('text', text);

                if (selectedImage) {
                    const file = {
                        uri: selectedImage.uri,
                        type: 'image/jpeg',
                        name: selectedImage.fileName || 'upload.jpg',
                    };
                    formData.append('image', file as any);
                }

                const response = await client.post(`/api/chat/${roomMongoId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                const realMessage = response.data;
                realMessage.status = 'sent';

                setMessages(prev => {
                    const exists = prev.some(m => m._id === realMessage._id);
                    if (exists) {
                        return prev.filter(m => m._id !== tempId);
                    }
                    return prev.map(m => m._id === tempId ? realMessage : m);
                });

                setText('');
                setSelectedImage(null);
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => prev.map(m => m._id === tempId ? { ...m, status: 'failed' } : m));
        } finally {
            setIsSending(false);
        }
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        if (item.type === 'date-separator') {
            return (
                <View style={styles.dateSeparatorContainer}>
                    <View style={styles.dateSeparatorLine} />
                    <Text style={styles.dateSeparatorText}>{item.label}</Text>
                    <View style={styles.dateSeparatorLine} />
                </View>
            );
        }

        const isMe = (currentUser && item.sender)
            ? String(item.sender._id || item.sender) === String(currentUser._id)
            : false;

        const groupedMessages = groupMessagesWithDates(messages);
        const prevItem = groupedMessages[index - 1];
        const prevMessage = prevItem?.type === 'message' ? prevItem : null;

        const isSequence = prevMessage && prevMessage.sender && item.sender &&
            String(prevMessage.sender._id || prevMessage.sender) === String(item.sender._id || item.sender);

        return (
            <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow, isSequence && styles.sequenceRow]}>
                {/* Avatar (only for other messages) */}
                {!isMe && (
                    <View style={styles.avatarContainer}>
                        {!isSequence && (
                            <Image
                                source={{ uri: item.sender?.avatar || `https://api.dicebear.com/7.x/initials/png?seed=${item.sender?.name || 'Unknown'}` }}
                                style={styles.avatar}
                            />
                        )}
                        {isSequence && <View style={styles.avatarPlaceholder} />}
                    </View>
                )}

                {/* Content */}
                <View style={[styles.messageContent, isMe && styles.myMessageContent]}>
                    {!isSequence && !isMe && (
                        <Text style={styles.userName}>
                            {item.sender?.name || "Unknown User"}
                        </Text>
                    )}
                    {item.imageURL && item.imageURL.trim() ? (
                        <TouchableOpacity onPress={() => setPreviewImageUrl(item.imageURL || '')}>
                            <Image
                                source={{ uri: item.imageURL }}
                                style={styles.messageImage}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    ) : (
                        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                            <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                                {item.text}
                            </Text>
                        </View>
                    )}
                    <View style={[styles.timestampRow, isMe && styles.myTimestampRow]}>
                        <Text style={styles.timestamp}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        {isMe && (
                            <View style={styles.statusContainer}>
                                {item.status === 'sending' ? (
                                    <Feather name="more-horizontal" size={12} color={colors.subText} />
                                ) : item.status === 'failed' ? (
                                    <Ionicons name="alert-circle" size={12} color="#ef4444" />
                                ) : (
                                    <Feather name="check" size={12} color="#4ade80" />
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>{roomTitle}</Text>
                    </View>

                    <View style={styles.headerActions}>
                        {/* Theme Toggling */}
                        <TouchableOpacity style={styles.headerActionButton} onPress={toggleTheme}>
                            <Feather name={theme === 'dark' ? "sun" : "moon"} size={16} color={colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.headerActionButton} onPress={() => setShowMembersModal(true)}>
                            <Feather name="users" size={16} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Message List */}
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="small" color="#E56DB1" />
                    </View>
                ) : (
                    <Animated.View style={{ flex: 1, marginBottom: keyboardHeight }}>
                        <FlatList
                            ref={flatListRef}
                            data={groupMessagesWithDates(messages)}
                            renderItem={renderItem}
                            keyExtractor={item => item.id || item._id}
                            contentContainerStyle={styles.listContent}
                            style={styles.list}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            ListEmptyComponent={
                                <Text style={{ color: colors.subText, textAlign: 'center', marginTop: 20, fontSize: 15 }}>No messages yet. Say hi!</Text>
                            }
                            ListFooterComponent={
                                <View style={{ height: 120 }} />
                            }
                        />
                    </Animated.View>
                )}
            </SafeAreaView>

            {/* Input Area */}
            <Animated.View style={[styles.inputContainer, { bottom: keyboardHeight }]}>
                {selectedImage && (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                        <TouchableOpacity
                            style={styles.removePreviewButton}
                            onPress={() => setSelectedImage(null)}
                        >
                            <Ionicons name="close-circle" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.inputWrapper}>
                    <View style={styles.combinedInput}>
                        <TextInput
                            style={styles.input}
                            value={text}
                            onChangeText={setText}
                            placeholder={`Message #${roomTitle}`}
                            placeholderTextColor={colors.subText}
                            multiline
                        />
                        <TouchableOpacity
                            style={styles.attachButton}
                            onPress={() => setShowAttachmentModal(true)}
                        >
                            <Feather name="plus" size={22} color={colors.subText} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            ((text.trim() || selectedImage) && !isSending) ? styles.sendButtonActive : styles.sendButtonInactive
                        ]}
                        onPress={handleSend}
                        disabled={(!text.trim() && !selectedImage) || isSending}
                    >
                        {isSending ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Ionicons name="send" size={16} color={((text.trim() || selectedImage) && !isSending) ? "#ffffff" : colors.subText} />
                        )}
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Modals */}
            <AttachmentModal
                visible={showAttachmentModal}
                onClose={() => setShowAttachmentModal(false)}
                onSelectImage={pickImage}
                onSelectCode={() => { setShowAttachmentModal(false); setShowCodeModal(true); }}
            />

            <CodeSnippetModal
                visible={showCodeModal}
                onClose={() => setShowCodeModal(false)}
                onSend={(code) => {
                    if (roomMongoId) {
                        client.post(`/api/chat/${roomMongoId}`, { text: code });
                        setShowCodeModal(false);
                        fetchMessages();
                    }
                }}
            />

            <MembersModal
                visible={showMembersModal}
                onClose={() => setShowMembersModal(false)}
                roomTitle={roomTitle}
                members={members}
                currentUserId={currentUser?._id}
            />

            {/* Image Preview Modal */}
            <Modal
                visible={!!previewImageUrl}
                transparent={true}
                onRequestClose={() => setPreviewImageUrl(null)}
            >
                <TouchableOpacity
                    style={styles.imagePreviewOverlay}
                    activeOpacity={1}
                    onPress={() => setPreviewImageUrl(null)}
                >
                    <SafeAreaView style={styles.imagePreviewContainer}>
                        <TouchableOpacity
                            style={styles.closePreviewButton}
                            onPress={() => setPreviewImageUrl(null)}
                        >
                            <Ionicons name="close" size={30} color="#fff" />
                        </TouchableOpacity>
                        {previewImageUrl && (
                            <Image
                                source={{ uri: previewImageUrl }}
                                style={styles.previewFullImage}
                                resizeMode="contain"
                            />
                        )}
                    </SafeAreaView>
                </TouchableOpacity>
            </Modal>

            {/* Connection Status Indicator */}
            {!socketConnected && (
                <View style={{ position: 'absolute', top: 120, alignSelf: 'center', backgroundColor: 'rgba(239, 68, 68, 0.9)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, zIndex: 100 }}>
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Disconnected — Reconnecting…</Text>
                </View>
            )}
        </View>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: 12,
        marginTop: 4,
    },
    codeBlock: {
        backgroundColor: '#0d1117',
        padding: 12,
        borderRadius: 8,
        marginTop: 4,
    },
    codeText: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 13,
        color: '#e6edf3',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        backgroundColor: colors.bg,
    },
    backButton: {
        padding: 4,
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '600',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerActionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.cardBg,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        paddingBottom: 100,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 4,
        alignItems: 'flex-end',
    },
    myMessageRow: {
        justifyContent: 'flex-end',
    },
    otherMessageRow: {
        justifyContent: 'flex-start',
    },
    sequenceRow: {
        marginBottom: 2,
    },
    avatarContainer: {
        width: 32,
        marginRight: 8,
        alignSelf: 'flex-end',
    },
    avatarPlaceholder: {
        width: 32,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.cardBg,
    },
    messageContent: {
        maxWidth: '75%',
    },
    myMessageContent: {
        alignItems: 'flex-end',
    },
    userName: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.subText,
        marginBottom: 3,
        paddingLeft: 4,
    },
    timestampRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 3,
        paddingHorizontal: 4,
    },
    myTimestampRow: {
        justifyContent: 'flex-end',
    },
    timestamp: {
        color: colors.subText,
        fontSize: 11,
    },
    statusContainer: {
        marginLeft: 2,
    },
    bubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    myBubble: {
        backgroundColor: '#E56DB1',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        shadowColor: '#E56DB1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 2,
    },
    otherBubble: {
        backgroundColor: colors.cardBg,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 18,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    myMessageText: {
        color: '#ffffff',
    },
    otherMessageText: {
        color: colors.text,
    },
    inputContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.bg,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        paddingTop: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        gap: 8,
    },
    combinedInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBg,
        borderRadius: 24,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        paddingRight: 4,
    },
    input: {
        flex: 1,
        color: colors.text,
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 16,
    },
    attachButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonActive: {
        backgroundColor: '#E56DB1',
        shadowColor: '#E56DB1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    sendButtonInactive: {
        backgroundColor: colors.border,
    },
    previewContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    previewImage: {
        width: 72,
        height: 72,
        borderRadius: 10,
        marginRight: 8,
    },
    removePreviewButton: {
        position: 'absolute',
        top: 2,
        left: 72,
    },
    imagePreviewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePreviewContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closePreviewButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    previewFullImage: {
        width: '100%',
        height: '100%',
    },
    dateSeparatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
        paddingHorizontal: 8,
    },
    dateSeparatorLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
    },
    dateSeparatorText: {
        color: colors.subText,
        fontSize: 12,
        fontWeight: '500',
        marginHorizontal: 10,
    },
});
