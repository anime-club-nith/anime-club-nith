import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, TextInput, Platform, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CodeSnippetModalProps {
    visible: boolean;
    onClose: () => void;
    onSend: (code: string, language?: string) => void;
}

export default function CodeSnippetModal({ visible, onClose, onSend }: CodeSnippetModalProps) {
    const [code, setCode] = useState('');
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const handleSend = () => {
        if (code.trim()) {
            onSend(code);
            setCode('');
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>New Snippet</Text>
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!code.trim()}
                            style={[styles.sendButton, !code.trim() && styles.disabledButton]}
                        >
                            <Text style={[styles.sendText, !code.trim() && styles.disabledText]}>Share</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.editorContainer}>
                        <TextInput
                            style={styles.input}
                            multiline
                            autoFocus
                            placeholder="// Type or paste your code here..."
                            placeholderTextColor={colors.subText}
                            value={code}
                            onChangeText={setCode}
                            textAlignVertical="top"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 4,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: 16,
        fontWeight: '900',
        color: colors.text,
        textTransform: 'uppercase',
    },
    closeButton: {
        padding: 8,
        marginLeft: -8,
    },
    cancelText: {
        color: colors.subText,
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    sendButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#E56DB1',
        borderWidth: 3,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
    },
    sendText: {
        color: '#000000',
        fontWeight: '900',
        fontSize: 14,
        textTransform: 'uppercase',
    },
    disabledButton: {
        backgroundColor: colors.cardBg,
        borderColor: colors.subText,
        shadowOpacity: 0,
        elevation: 0,
    },
    disabledText: {
        color: colors.subText,
    },
    editorContainer: {
        flex: 1,
        padding: 16,
    },
    input: {
        flex: 1,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
        backgroundColor: colors.cardBg,
        borderWidth: 3,
        borderColor: colors.border,
        padding: 16,
    },
});
