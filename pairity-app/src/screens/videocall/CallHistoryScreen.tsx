import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import moment from 'moment';

import {
  removeCallFromHistory,
  clearCallHistory,
} from '@/store/slices/videoCallSlice';
import { CallHistory, CallStatus } from '@/types/videocall';

const CallHistoryScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { callHistory } = useSelector((state: RootState) => state.videoCall);
  
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'missed' | 'incoming' | 'outgoing'>('all');

  const getFilteredHistory = () => {
    switch (selectedFilter) {
      case 'missed':
        return callHistory.filter(call => call.status === CallStatus.MISSED);
      case 'incoming':
        return callHistory.filter(call => call.type === 'incoming');
      case 'outgoing':
        return callHistory.filter(call => call.type === 'outgoing');
      default:
        return callHistory;
    }
  };

  const getCallStatusIcon = (call: CallHistory) => {
    if (call.status === CallStatus.MISSED) {
      return { name: 'call-missed', color: '#FF3B30' };
    } else if (call.type === 'incoming') {
      return { name: 'call-received', color: '#34C759' };
    } else {
      return { name: 'call-made', color: theme.colors.primary };
    }
  };

  const formatCallDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatCallTime = (timestamp: Date) => {
    const now = moment();
    const callTime = moment(timestamp);
    
    if (now.diff(callTime, 'days') === 0) {
      return callTime.format('HH:mm');
    } else if (now.diff(callTime, 'days') === 1) {
      return 'Yesterday';
    } else if (now.diff(callTime, 'days') < 7) {
      return callTime.format('dddd');
    } else {
      return callTime.format('MM/DD/YY');
    }
  };

  const handleCallBack = (call: CallHistory) => {
    navigation.navigate('PreCall' as never, {
      participantId: call.participantId,
      participantName: call.participantName,
      participantAvatar: call.participantAvatar,
      callType: 'video',
    } as never);
  };

  const handleDeleteCall = (callId: string) => {
    Alert.alert(
      'Delete Call',
      'Remove this call from history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(removeCallFromHistory(callId)),
        },
      ]
    );
  };

  const handleClearAllHistory = () => {
    Alert.alert(
      'Clear All History',
      'This will permanently delete all call history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => dispatch(clearCallHistory()),
        },
      ]
    );
  };

  const renderCallItem = ({ item }: { item: CallHistory }) => {
    const statusIcon = getCallStatusIcon(item);
    
    return (
      <View style={[styles.callItem, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.callContent}>
          {/* Avatar */}
          <Image
            source={{ uri: item.participantAvatar }}
            style={styles.avatar}
            defaultSource={require('@/assets/images/default-avatar.png')}
          />
          
          {/* Call Info */}
          <View style={styles.callInfo}>
            <View style={styles.callHeader}>
              <Text style={[styles.participantName, { color: theme.colors.text }]} numberOfLines={1}>
                {item.participantName}
              </Text>
              <Icon name={statusIcon.name} size={16} color={statusIcon.color} />
            </View>
            
            <View style={styles.callDetails}>
              <Text style={[styles.callTime, { color: theme.colors.textSecondary }]}>
                {formatCallTime(item.startTime)}
              </Text>
              {item.duration > 0 && (
                <>
                  <Text style={[styles.separator, { color: theme.colors.textSecondary }]}>•</Text>
                  <Text style={[styles.callDuration, { color: theme.colors.textSecondary }]}>
                    {formatCallDuration(item.duration)}
                  </Text>
                </>
              )}
              {item.status === CallStatus.MISSED && (
                <>
                  <Text style={[styles.separator, { color: theme.colors.textSecondary }]}>•</Text>
                  <Text style={[styles.missedText, { color: '#FF3B30' }]}>
                    Missed
                  </Text>
                </>
              )}
            </View>
          </View>
          
          {/* Actions */}
          <View style={styles.callActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCallBack(item)}
            >
              <Icon name="videocam" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteCall(item.id)}
            >
              <Icon name="delete-outline" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="call" size={60} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Call History
      </Text>
      <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
        Your video call history will appear here
      </Text>
    </View>
  );

  const filteredHistory = getFilteredHistory();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Call History
        </Text>
        {callHistory.length > 0 && (
          <TouchableOpacity onPress={handleClearAllHistory} style={styles.clearButton}>
            <Icon name="delete-sweep" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      {callHistory.length > 0 && (
        <View style={[styles.filterTabs, { backgroundColor: theme.colors.surface }]}>
          {[
            { key: 'all', label: 'All' },
            { key: 'missed', label: 'Missed' },
            { key: 'incoming', label: 'Incoming' },
            { key: 'outgoing', label: 'Outgoing' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                selectedFilter === filter.key && { backgroundColor: theme.colors.primaryLight },
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color: selectedFilter === filter.key 
                      ? theme.colors.primary 
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Call History List */}
      <FlatList
        data={filteredHistory}
        renderItem={renderCallItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={filteredHistory.length === 0 ? styles.emptyContainer : styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  callItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  callContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  callInfo: {
    flex: 1,
  },
  callHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callTime: {
    fontSize: 14,
  },
  separator: {
    fontSize: 12,
  },
  callDuration: {
    fontSize: 14,
  },
  missedText: {
    fontSize: 14,
    fontWeight: '500',
  },
  callActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
});

export default CallHistoryScreen;