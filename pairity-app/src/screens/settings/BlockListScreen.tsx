import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import CustomButton from '@/components/CustomButton';

interface BlockedUser {
  id: string;
  name: string;
  username: string;
  photo: string;
  blockedAt: Date;
}

const BlockListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([
    {
      id: '1',
      name: 'John Smith',
      username: '@johnsmith',
      photo: 'https://i.pravatar.cc/150?img=1',
      blockedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Mike Johnson',
      username: '@mikej',
      photo: 'https://i.pravatar.cc/150?img=2',
      blockedAt: new Date('2024-01-10'),
    },
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredUsers = blockedUsers.filter(
    user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUnblock = (user: BlockedUser) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // API call to unblock user
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              setBlockedUsers(prev => prev.filter(u => u.id !== user.id));
              Toast.show({
                type: 'success',
                text1: 'User Unblocked',
                text2: `${user.name} has been unblocked`,
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Failed to unblock user',
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUnblockAll = () => {
    Alert.alert(
      'Unblock All Users',
      'Are you sure you want to unblock all users? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock All',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // API call to unblock all
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              setBlockedUsers([]);
              Toast.show({
                type: 'success',
                text1: 'All Users Unblocked',
                text2: 'Your block list is now empty',
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Failed to unblock users',
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Fetch updated block list from API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const renderUser = ({ item }: { item: BlockedUser }) => (
    <View style={styles.userCard}>
      <Image source={{ uri: item.photo }} style={styles.userPhoto} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userUsername}>{item.username}</Text>
        <Text style={styles.blockedDate}>Blocked {formatDate(item.blockedAt)}</Text>
      </View>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblock(item)}
      >
        <Text style={styles.unblockButtonText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="block" size={64} color="#ddd" />
      <Text style={styles.emptyTitle}>No Blocked Users</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'No users match your search'
          : 'You haven\'t blocked anyone yet'}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.headerText}>
        {blockedUsers.length} blocked {blockedUsers.length === 1 ? 'user' : 'users'}
      </Text>
      {blockedUsers.length > 0 && (
        <TouchableOpacity onPress={handleUnblockAll}>
          <Text style={styles.unblockAllText}>Unblock All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Block List</Text>
        <TouchableOpacity onPress={() => navigation.navigate('BlockHelp' as never)}>
          <Icon name="help-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search blocked users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Icon name="info" size={16} color="#666" />
        <Text style={styles.infoText}>
          Blocked users can't see your profile or contact you
        </Text>
      </View>

      {/* User List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          ListHeaderComponent={filteredUsers.length > 0 ? renderHeader : null}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 14,
    color: '#666',
  },
  unblockAllText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  blockedDate: {
    fontSize: 12,
    color: '#999',
  },
  unblockButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 20,
  },
  unblockButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BlockListScreen;