import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Colors, Spacing, Radius } from '@src/constants/colors';

type CustomAlertProps = {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
};

export const CustomAlert: React.FC<CustomAlertProps> = ({ 
  visible, 
  title, 
  message, 
  onClose,
  type = 'info'
}) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: '✓', color: '#4CAF50' };
      case 'error':
        return { icon: '✕', color: '#F44336' };
      default:
        return { icon: 'ⓘ', color: Colors.primary };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.alertBox} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.iconCircle, { backgroundColor: color }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
          
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
          
          <Pressable 
            style={[styles.button, { backgroundColor: color }]} 
            onPress={onClose}
          >
            <Text style={styles.buttonText}>V redu</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  alertBox: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: Colors.grayDark,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl * 2,
    borderRadius: Radius.lg,
    minWidth: 120,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
