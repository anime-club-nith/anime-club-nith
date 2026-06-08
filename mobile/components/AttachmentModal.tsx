import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, Animated } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface AttachmentModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectImage: () => void;
    onSelectCode: () => void;
}

export default function AttachmentModal({ visible, onClose, onSelectImage, onSelectCode }: AttachmentModalProps) {
    const scale = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const [showModal, setShowModal] = useState(visible);
    const { colors } = useTheme();
    const styles = createStyles(colors);

    useEffect(() => {
        if (visible) {
            setShowModal(true);
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                    damping: 15,
                    stiffness: 150,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scale, {
                    toValue: 0.5,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                })
            ]).start(() => setShowModal(false));
        }
    }, [visible]);

    if (!showModal) return null;

    return (
        <Modal
            visible={showModal}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <Animated.View style={[
                    styles.modalContent,
                    {
                        opacity,
                        transform: [{ scale }]
                    }
                ]}>
                    <TouchableOpacity style={styles.option} onPress={onSelectCode}>
                        <View style={styles.iconContainer}>
                            <Feather name="code" size={20} color={colors.text} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.option} onPress={onSelectImage}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="image" size={20} color={colors.text} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    modalContent: {
        position: 'absolute',
        bottom: 120, // Adjusted to match brutalist layout elevation
        right: 70, // Aligned with attachments button
        backgroundColor: colors.cardBg,
        borderWidth: 4,
        borderColor: colors.border,
        padding: 8,
        gap: 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 5,
    },
    option: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
    },
});
