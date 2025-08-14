import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const emojiCategories = [
    {
      title: 'Smileys',
      emojis: ['😀', '😁', '😂', '😃', '😄', '😅', '😆', '😇', '😈', '😉', '😊', '😋', '😌', '😍', '😎', '😏', '😐', '😑', '😒', '😓', '😔', '😕', '😖', '😗', '😘', '😙', '😚', '😛', '😜', '😝'],
    },
    {
      title: 'Hearts',
      emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '🤎', '💔', '❣️', '💕', '💖', '💗', '💓', '💘', '💝', '💞', '💟'],
    },
    {
      title: 'Gestures',
      emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤜', '👏', '🙌', '👐', '🤲', '🤝'],
    },
    {
      title: 'Activities',
      emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥍', '🎱', '🥏', '🎯', '🎪', '🎸', '🎵', '🎶', '🎷', '🥁', '🥂', '🎺', '🎹', '🎻', '🎬', '🎭'],
    },
    {
      title: 'Food',
      emojis: ['🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🥥', '🍔', '🍕', '🍖', '🥪', '🍗', '🥨', '🥩', '🍞', '🍟', '🧇', '🥧', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍺', '🍻', '🍷', '🥃', '☕'],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emojis</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {emojiCategories.map((category, categoryIndex) => (
          <View key={categoryIndex}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <View style={styles.emojiGrid}>
              {category.emojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiButton}
                  onPress={() => onSelect(emoji)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.4,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  emojiButton: {
    width: '12.5%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
});

export default EmojiPicker;