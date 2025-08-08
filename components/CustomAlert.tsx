import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Check, X, Camera } from 'lucide-react-native';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'primary' | 'danger';
    icon?: 'check' | 'camera' | 'x';
  }>;
  onClose: () => void;
}

export function CustomAlert({ visible, title, message, buttons, onClose }: CustomAlertProps) {
  const getButtonStyle = (style?: 'default' | 'primary' | 'danger') => {
    switch (style) {
      case 'primary':
        return [styles.button, styles.primaryButton];
      case 'danger':
        return [styles.button, styles.dangerButton];
      default:
        return [styles.button, styles.defaultButton];
    }
  };

  const getButtonTextStyle = (style?: 'default' | 'primary' | 'danger') => {
    switch (style) {
      case 'primary':
        return [styles.buttonText, styles.primaryButtonText];
      case 'danger':
        return [styles.buttonText, styles.dangerButtonText];
      default:
        return [styles.buttonText, styles.defaultButtonText];
    }
  };

  const getIcon = (iconName?: 'check' | 'camera' | 'x') => {
    switch (iconName) {
      case 'check':
        return <Check size={20} color="white" />;
      case 'camera':
        return <Camera size={20} color="#8b5cf6" />;
      case 'x':
        return <X size={20} color="#ef4444" />;
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={styles.header}>
            <View style={styles.successIcon}>
              <Check size={32} color="#10b981" />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
          
          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={getButtonStyle(button.style)}
                onPress={() => {
                  button.onPress();
                  onClose();
                }}
              >
                <View style={styles.buttonContent}>
                  {button.icon && getIcon(button.icon)}
                  <Text style={getButtonTextStyle(button.style)}>
                    {button.text}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#8b5cf6',
  },
  defaultButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dangerButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: 'white',
  },
  defaultButtonText: {
    color: '#374151',
  },
  dangerButtonText: {
    color: '#ef4444',
  },
});