import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';

interface LoadingProps {
  visible?: boolean;
  text?: string;
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  visible = true,
  text = 'Loading...',
  size = 'large',
  color = '#FF6B6B',
  overlay = false,
}) => {
  const content = (
    <View style={[styles.container, overlay && styles.overlay]}>
      <View style={styles.content}>
        <ActivityIndicator size={size} color={color} />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        statusBarTranslucent
      >
        {content}
      </Modal>
    );
  }

  return visible ? content : null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default Loading;