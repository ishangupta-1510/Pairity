import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '@/components/CustomButton';

interface Prompt {
  id: string;
  question: string;
  category: string;
}

interface AnsweredPrompt {
  id: string;
  question: string;
  answer: string;
}

const PromptsTab: React.FC = () => {
  const [answeredPrompts, setAnsweredPrompts] = useState<AnsweredPrompt[]>([
    {
      id: '1',
      question: 'My perfect Sunday involves...',
      answer: 'Sleeping in, brunch with friends, exploring a farmers market, and ending the day with a good movie and wine.',
    },
    {
      id: '2',
      question: 'The way to my heart is...',
      answer: 'Through good food, genuine laughter, and showing me your favorite hidden spots in the city.',
    },
    {
      id: '3',
      question: "I'll know it's real when...",
      answer: 'We can be completely ourselves around each other, silence feels comfortable, and we make each other better people.',
    },
  ]);

  const [promptLibrary] = useState<Prompt[]>([
    { id: '4', question: 'Two truths and a lie...', category: 'Fun' },
    { id: '5', question: 'My most irrational fear is...', category: 'Personal' },
    { id: '6', question: 'The last thing that made me laugh out loud was...', category: 'Fun' },
    { id: '7', question: 'My ideal first date...', category: 'Dating' },
    { id: '8', question: 'A shower thought I recently had...', category: 'Random' },
    { id: '9', question: 'The key to my heart is...', category: 'Dating' },
    { id: '10', question: 'My simple pleasures...', category: 'Personal' },
    { id: '11', question: 'Dating me is like...', category: 'Dating' },
    { id: '12', question: 'My love language is...', category: 'Dating' },
    { id: '13', question: 'A life goal of mine...', category: 'Personal' },
    { id: '14', question: 'My most controversial opinion is...', category: 'Fun' },
    { id: '15', question: 'Together we could...', category: 'Dating' },
  ]);

  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [promptAnswer, setPromptAnswer] = useState('');
  const [editingPrompt, setEditingPrompt] = useState<AnsweredPrompt | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = ['All', 'Fun', 'Personal', 'Dating', 'Random'];

  const filteredPrompts = filterCategory === 'All' 
    ? promptLibrary 
    : promptLibrary.filter(p => p.category === filterCategory);

  const handleAddPrompt = () => {
    setShowPromptModal(true);
    setSelectedPrompt(null);
    setPromptAnswer('');
  };

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
  };

  const handleSavePrompt = () => {
    if (selectedPrompt && promptAnswer.trim()) {
      if (editingPrompt) {
        // Update existing prompt
        setAnsweredPrompts(answeredPrompts.map(p => 
          p.id === editingPrompt.id 
            ? { ...p, answer: promptAnswer }
            : p
        ));
      } else if (answeredPrompts.length < 5) {
        // Add new prompt
        const newPrompt: AnsweredPrompt = {
          id: selectedPrompt.id,
          question: selectedPrompt.question,
          answer: promptAnswer,
        };
        setAnsweredPrompts([...answeredPrompts, newPrompt]);
      }
      setShowPromptModal(false);
      setSelectedPrompt(null);
      setPromptAnswer('');
      setEditingPrompt(null);
    }
  };

  const handleEditPrompt = (prompt: AnsweredPrompt) => {
    setEditingPrompt(prompt);
    setSelectedPrompt({ id: prompt.id, question: prompt.question, category: 'Custom' });
    setPromptAnswer(prompt.answer);
    setShowPromptModal(true);
  };

  const handleDeletePrompt = (promptId: string) => {
    setAnsweredPrompts(answeredPrompts.filter(p => p.id !== promptId));
  };

  const handlePreview = () => {
    setShowPreviewModal(true);
  };

  const renderAnsweredPrompt = (prompt: AnsweredPrompt) => (
    <View key={prompt.id} style={styles.answeredPrompt}>
      <View style={styles.promptHeader}>
        <Text style={styles.promptQuestion}>{prompt.question}</Text>
        <View style={styles.promptActions}>
          <TouchableOpacity onPress={() => handleEditPrompt(prompt)}>
            <Icon name="edit" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeletePrompt(prompt.id)} style={styles.deleteButton}>
            <Icon name="delete" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.promptAnswerText}>{prompt.answer}</Text>
    </View>
  );

  const renderPromptOption = ({ item }: { item: Prompt }) => (
    <TouchableOpacity
      style={[
        styles.promptOption,
        selectedPrompt?.id === item.id && styles.promptOptionSelected,
      ]}
      onPress={() => handleSelectPrompt(item)}
    >
      <Text style={[
        styles.promptOptionText,
        selectedPrompt?.id === item.id && styles.promptOptionTextSelected,
      ]}>
        {item.question}
      </Text>
      <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
        <Text style={styles.categoryBadgeText}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Fun': return '#FFD43B';
      case 'Personal': return '#339AF0';
      case 'Dating': return '#FF6B6B';
      case 'Random': return '#51CF66';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Prompts</Text>
          <TouchableOpacity onPress={handlePreview}>
            <Text style={styles.previewLink}>Preview</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionDescription}>
          Answer 3-5 prompts to help people get to know you better
        </Text>

        {answeredPrompts.map(renderAnsweredPrompt)}

        {answeredPrompts.length < 5 && (
          <TouchableOpacity style={styles.addPromptButton} onPress={handleAddPrompt}>
            <Icon name="add-circle-outline" size={24} color="#FF6B6B" />
            <Text style={styles.addPromptText}>Add a Prompt</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Prompt Selection Modal */}
      <Modal
        visible={showPromptModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPromptModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowPromptModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingPrompt ? 'Edit Prompt' : 'Select a Prompt'}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {!editingPrompt && (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryFilter}
                >
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        filterCategory === category && styles.categoryChipActive,
                      ]}
                      onPress={() => setFilterCategory(category)}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        filterCategory === category && styles.categoryChipTextActive,
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <FlatList
                  data={filteredPrompts}
                  renderItem={renderPromptOption}
                  keyExtractor={(item) => item.id}
                  style={styles.promptList}
                  showsVerticalScrollIndicator={false}
                />
              </>
            )}

            {(selectedPrompt || editingPrompt) && (
              <View style={styles.answerSection}>
                <Text style={styles.selectedPromptText}>
                  {selectedPrompt?.question || editingPrompt?.question}
                </Text>
                <TextInput
                  style={styles.answerInput}
                  placeholder="Type your answer here..."
                  value={promptAnswer}
                  onChangeText={setPromptAnswer}
                  multiline
                  maxLength={150}
                  textAlignVertical="top"
                />
                <Text style={styles.characterCount}>{promptAnswer.length}/150</Text>
                
                <CustomButton
                  title={editingPrompt ? "Save Changes" : "Add Prompt"}
                  onPress={handleSavePrompt}
                  variant="primary"
                  fullWidth
                  disabled={!promptAnswer.trim()}
                />
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Preview Modal */}
      <Modal
        visible={showPreviewModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <View style={styles.previewModalContainer}>
          <View style={styles.previewModalContent}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Prompt Preview</Text>
              <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.previewScroll}>
              {answeredPrompts.map(prompt => (
                <View key={prompt.id} style={styles.previewPrompt}>
                  <Text style={styles.previewQuestion}>{prompt.question}</Text>
                  <Text style={styles.previewAnswer}>{prompt.answer}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  previewLink: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  answeredPrompt: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  promptQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  promptActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 12,
  },
  promptAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  addPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderStyle: 'dashed',
    backgroundColor: '#FFF5F5',
    marginTop: 8,
  },
  addPromptText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  categoryFilter: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxHeight: 60,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#FF6B6B',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  promptList: {
    maxHeight: 300,
    paddingHorizontal: 20,
  },
  promptOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  promptOptionSelected: {
    backgroundColor: '#FFF5F5',
  },
  promptOptionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  promptOptionTextSelected: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  answerSection: {
    padding: 20,
  },
  selectedPromptText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginBottom: 16,
  },
  previewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  previewScroll: {
    padding: 20,
  },
  previewPrompt: {
    marginBottom: 20,
  },
  previewQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  previewAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default PromptsTab;