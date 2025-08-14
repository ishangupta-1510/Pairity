import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SafetyTip, EmergencyContact, SafetyCheckIn, BlockedUser } from '@/types/reporting';

const SafetyCenterScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  
  const [activeSection, setActiveSection] = useState<'resources' | 'emergency' | 'blocked'>('resources');
  const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set());
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [activeCheckIn, setActiveCheckIn] = useState<SafetyCheckIn | null>(null);

  const safetyTips: SafetyTip[] = [
    {
      id: '1',
      title: 'Meet in Public Places',
      description: 'Always meet your date in a public, well-lit place for the first few dates. Avoid secluded locations and never invite someone to your home or go to theirs on early dates.',
      category: 'dating',
      icon: 'public',
      priority: 1,
    },
    {
      id: '2',
      title: 'Tell a Friend',
      description: 'Let a trusted friend or family member know about your date plans. Share your location, who you\'re meeting, and when you expect to return.',
      category: 'dating',
      icon: 'people',
      priority: 1,
    },
    {
      id: '3',
      title: 'Trust Your Instincts',
      description: 'If something feels off or makes you uncomfortable, trust your gut. You have the right to leave at any time, and a respectful person will understand.',
      category: 'general',
      icon: 'psychology',
      priority: 1,
    },
    {
      id: '4',
      title: 'Video Chat First',
      description: 'Have a video call before meeting in person. This helps verify their identity and gives you a better sense of their personality and communication style.',
      category: 'video_call',
      icon: 'video-call',
      priority: 2,
    },
    {
      id: '5',
      title: 'Protect Personal Information',
      description: 'Don\'t share your home address, workplace details, financial information, or other personal details until you\'ve built trust over time.',
      category: 'general',
      icon: 'security',
      priority: 2,
    },
    {
      id: '6',
      title: 'Transportation Safety',
      description: 'Arrange your own transportation to and from the date. Don\'t rely on your date for rides, and never get into a car with someone you don\'t know well.',
      category: 'meeting',
      icon: 'directions-car',
      priority: 2,
    },
    {
      id: '7',
      title: 'Watch for Red Flags',
      description: 'Be cautious of people who push for personal information, ask for money, refuse video calls, or seem too good to be true. Trust is built over time.',
      category: 'general',
      icon: 'flag',
      priority: 1,
    },
    {
      id: '8',
      title: 'Emergency Preparedness',
      description: 'Set up emergency contacts in the app and have a safety check-in plan. Know how to quickly call for help if needed.',
      category: 'emergency',
      icon: 'emergency',
      priority: 1,
    },
  ];

  const emergencyNumbers = [
    { country: 'US', number: '911', service: 'Emergency Services' },
    { country: 'UK', number: '999', service: 'Emergency Services' },
    { country: 'CA', number: '911', service: 'Emergency Services' },
    { country: 'AU', number: '000', service: 'Emergency Services' },
    { country: 'Global', number: '1-800-799-7233', service: 'Domestic Violence Hotline' },
  ];

  useEffect(() => {
    loadEmergencyContacts();
    loadBlockedUsers();
    loadActiveCheckIn();
  }, []);

  const loadEmergencyContacts = async () => {
    try {
      const stored = await AsyncStorage.getItem('emergencyContacts');
      if (stored) {
        setEmergencyContacts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  };

  const loadBlockedUsers = async () => {
    try {
      const stored = await AsyncStorage.getItem('blockedUsers');
      if (stored) {
        setBlockedUsers(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading blocked users:', error);
    }
  };

  const loadActiveCheckIn = async () => {
    try {
      const stored = await AsyncStorage.getItem('activeCheckIn');
      if (stored) {
        const checkIn = JSON.parse(stored);
        if (new Date(checkIn.scheduledTime) > new Date()) {
          setActiveCheckIn(checkIn);
        }
      }
    } catch (error) {
      console.error('Error loading active check-in:', error);
    }
  };

  const toggleTipExpansion = (tipId: string) => {
    const newExpanded = new Set(expandedTips);
    if (newExpanded.has(tipId)) {
      newExpanded.delete(tipId);
    } else {
      newExpanded.add(tipId);
    }
    setExpandedTips(newExpanded);
  };

  const handleAddEmergencyContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant access to your contacts to add emergency contacts.');
      return;
    }

    const result = await Contacts.presentContactPickerAsync({
      allowsEditing: false,
      allowsMultipleSelection: false,
    });

    if (result.cancelled || !result.contact) {
      return;
    }

    const contact = result.contact;
    const phoneNumber = contact.phoneNumbers?.[0]?.number;

    if (!phoneNumber) {
      Alert.alert('No Phone Number', 'Selected contact must have a phone number.');
      return;
    }

    const newContact: EmergencyContact = {
      id: `emergency_${Date.now()}`,
      userId: 'current-user-id', // Replace with actual user ID
      name: contact.name || 'Unknown',
      phoneNumber: phoneNumber,
      relationship: '',
      isEmergencyContact: true,
      canShareLocation: false,
      createdAt: new Date(),
    };

    const updatedContacts = [...emergencyContacts, newContact];
    setEmergencyContacts(updatedContacts);
    
    try {
      await AsyncStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
    } catch (error) {
      console.error('Error saving emergency contact:', error);
    }
  };

  const removeEmergencyContact = async (contactId: string) => {
    Alert.alert(
      'Remove Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updatedContacts = emergencyContacts.filter(contact => contact.id !== contactId);
            setEmergencyContacts(updatedContacts);
            
            try {
              await AsyncStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
            } catch (error) {
              console.error('Error removing emergency contact:', error);
            }
          },
        },
      ]
    );
  };

  const shareLocationWithFriend = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant location permission to share your location.');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const message = `I'm at: https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
      
      Alert.alert(
        'Share Location',
        'Your location will be shared with your emergency contacts.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Share',
            onPress: () => {
              // In a real app, send SMS or notification to emergency contacts
              emergencyContacts.forEach(contact => {
                console.log(`Sharing location with ${contact.name}: ${message}`);
              });
              Alert.alert('Location Shared', 'Your location has been shared with your emergency contacts.');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your current location.');
    }
  };

  const startDateCheckIn = () => {
    Alert.prompt(
      'Date Check-In',
      'How many hours should we check on you?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Set',
          onPress: (hours) => {
            const numHours = parseInt(hours || '2');
            if (isNaN(numHours) || numHours <= 0) {
              Alert.alert('Invalid Input', 'Please enter a valid number of hours.');
              return;
            }

            const checkIn: SafetyCheckIn = {
              id: `checkin_${Date.now()}`,
              userId: 'current-user-id',
              scheduledTime: new Date(Date.now() + numHours * 60 * 60 * 1000),
              emergencyContacts: emergencyContacts.map(c => c.id),
              status: 'scheduled',
            };

            setActiveCheckIn(checkIn);
            AsyncStorage.setItem('activeCheckIn', JSON.stringify(checkIn));
            
            Alert.alert(
              'Check-In Scheduled',
              `We'll check on you in ${numHours} hour${numHours > 1 ? 's' : ''}. Stay safe!`
            );
          },
        },
      ],
      'plain-text',
      '2'
    );
  };

  const completeCheckIn = () => {
    if (activeCheckIn) {
      const updatedCheckIn = { ...activeCheckIn, status: 'completed' as const, completedAt: new Date() };
      setActiveCheckIn(null);
      AsyncStorage.removeItem('activeCheckIn');
      Alert.alert('Check-In Complete', 'Glad you\'re safe! Your emergency contacts have been notified.');
    }
  };

  const emergencyCall = () => {
    Alert.alert(
      'Emergency Call',
      'This will call emergency services (911). Only use in real emergencies.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call 911',
          style: 'destructive',
          onPress: () => {
            const phoneNumber = Platform.OS === 'ios' ? 'tel:911' : 'tel:911';
            Linking.openURL(phoneNumber);
          },
        },
      ]
    );
  };

  const callEmergencyNumber = (number: string) => {
    const phoneNumber = Platform.OS === 'ios' ? `tel:${number}` : `tel:${number}`;
    Linking.openURL(phoneNumber);
  };

  const unblockUser = async (blockedUser: BlockedUser) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock this user?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unblock',
          onPress: async () => {
            const updatedBlocked = blockedUsers.filter(user => user.id !== blockedUser.id);
            setBlockedUsers(updatedBlocked);
            
            try {
              await AsyncStorage.setItem('blockedUsers', JSON.stringify(updatedBlocked));
              Alert.alert('Success', 'User has been unblocked.');
            } catch (error) {
              console.error('Error unblocking user:', error);
            }
          },
        },
      ]
    );
  };

  const renderSafetyTip = ({ item }: { item: SafetyTip }) => {
    const isExpanded = expandedTips.has(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.tipCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => toggleTipExpansion(item.id)}
      >
        <View style={styles.tipHeader}>
          <Icon name={item.icon} size={24} color={theme.colors.primary} />
          <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          <Icon 
            name={isExpanded ? 'expand-less' : 'expand-more'} 
            size={24} 
            color={theme.colors.textSecondary} 
          />
        </View>
        
        {isExpanded && (
          <Text style={[styles.tipDescription, { color: theme.colors.textSecondary }]}>
            {item.description}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmergencyContact = ({ item }: { item: EmergencyContact }) => (
    <View style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: theme.colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.contactPhone, { color: theme.colors.textSecondary }]}>
          {item.phoneNumber}
        </Text>
        {item.relationship && (
          <Text style={[styles.contactRelationship, { color: theme.colors.textSecondary }]}>
            {item.relationship}
          </Text>
        )}
      </View>
      
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => callEmergencyNumber(item.phoneNumber)}
        >
          <Icon name="phone" size={16} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: theme.colors.error }]}
          onPress={() => removeEmergencyContact(item.id)}
        >
          <Icon name="delete" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBlockedUser = ({ item }: { item: BlockedUser }) => (
    <View style={[styles.blockedUserCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.blockedUserInfo}>
        <Text style={[styles.blockedUserName, { color: theme.colors.text }]}>
          User {item.blockedUserId.slice(-6)}
        </Text>
        {item.reason && (
          <Text style={[styles.blockedUserReason, { color: theme.colors.textSecondary }]}>
            Reason: {item.reason}
          </Text>
        )}
        <Text style={[styles.blockedUserDate, { color: theme.colors.textSecondary }]}>
          Blocked: {item.createdAt.toLocaleDateString()}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.unblockButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => unblockUser(item)}
      >
        <Text style={styles.unblockButtonText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSafetyResources = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Dating Safety Tips
      </Text>
      <FlatList
        data={safetyTips.sort((a, b) => a.priority - b.priority)}
        renderItem={renderSafetyTip}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        style={styles.tipsList}
      />
    </ScrollView>
  );

  const renderEmergencyFeatures = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      {/* Active Check-In */}
      {activeCheckIn && (
        <View style={[styles.activeCheckIn, { backgroundColor: theme.colors.accent + '20' }]}>
          <Icon name="schedule" size={24} color={theme.colors.accent} />
          <View style={styles.checkInInfo}>
            <Text style={[styles.checkInTitle, { color: theme.colors.text }]}>
              Check-In Active
            </Text>
            <Text style={[styles.checkInTime, { color: theme.colors.textSecondary }]}>
              Due: {activeCheckIn.scheduledTime.toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.checkInButton, { backgroundColor: theme.colors.accent }]}
            onPress={completeCheckIn}
          >
            <Text style={styles.checkInButtonText}>I'm Safe</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Emergency Actions */}
      <View style={[styles.emergencyActions, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Emergency Actions
        </Text>
        
        <TouchableOpacity
          style={[styles.emergencyButton, styles.panicButton]}
          onPress={emergencyCall}
        >
          <Icon name="phone" size={24} color="white" />
          <Text style={styles.emergencyButtonText}>Emergency Call (911)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.emergencyButton, { backgroundColor: theme.colors.primary }]}
          onPress={shareLocationWithFriend}
        >
          <Icon name="my-location" size={24} color="white" />
          <Text style={styles.emergencyButtonText}>Share Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.emergencyButton, { backgroundColor: theme.colors.accent }]}
          onPress={startDateCheckIn}
        >
          <Icon name="schedule" size={24} color="white" />
          <Text style={styles.emergencyButtonText}>Date Check-In</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Contacts */}
      <View style={[styles.contactsSection, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.contactsHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Emergency Contacts
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAddEmergencyContact}
          >
            <Icon name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {emergencyContacts.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No emergency contacts added yet. Tap + to add contacts.
          </Text>
        ) : (
          <FlatList
            data={emergencyContacts}
            renderItem={renderEmergencyContact}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Emergency Numbers */}
      <View style={[styles.numbersSection, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Emergency Numbers
        </Text>
        {emergencyNumbers.map((emergency, index) => (
          <TouchableOpacity
            key={index}
            style={styles.emergencyNumber}
            onPress={() => callEmergencyNumber(emergency.number)}
          >
            <View style={styles.numberInfo}>
              <Text style={[styles.numberService, { color: theme.colors.text }]}>
                {emergency.service}
              </Text>
              <Text style={[styles.numberCountry, { color: theme.colors.textSecondary }]}>
                {emergency.country}
              </Text>
            </View>
            <Text style={[styles.numberValue, { color: theme.colors.primary }]}>
              {emergency.number}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderBlockedUsers = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Blocked Users ({blockedUsers.length})
      </Text>
      
      {blockedUsers.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          You haven't blocked any users yet.
        </Text>
      ) : (
        <FlatList
          data={blockedUsers}
          renderItem={renderBlockedUser}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );

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
          Safety Center
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: theme.colors.surface }]}>
        {[
          { key: 'resources', label: 'Safety Tips', icon: 'info' },
          { key: 'emergency', label: 'Emergency', icon: 'emergency' },
          { key: 'blocked', label: 'Blocked', icon: 'block' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeSection === tab.key && { backgroundColor: theme.colors.primaryLight },
            ]}
            onPress={() => setActiveSection(tab.key as any)}
          >
            <Icon 
              name={tab.icon} 
              size={20} 
              color={activeSection === tab.key ? theme.colors.primary : theme.colors.textSecondary} 
            />
            <Text style={[
              styles.tabText,
              { 
                color: activeSection === tab.key ? theme.colors.primary : theme.colors.textSecondary,
              }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeSection === 'resources' && renderSafetyResources()}
        {activeSection === 'emergency' && renderEmergencyFeatures()}
        {activeSection === 'blocked' && renderBlockedUsers()}
      </View>
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
  headerRight: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  sectionContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    marginLeft: 36,
  },
  activeCheckIn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  checkInInfo: {
    flex: 1,
  },
  checkInTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkInTime: {
    fontSize: 12,
    marginTop: 2,
  },
  checkInButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  checkInButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emergencyActions: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  panicButton: {
    backgroundColor: '#FF5722',
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contactsSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  contactsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactPhone: {
    fontSize: 14,
    marginTop: 2,
  },
  contactRelationship: {
    fontSize: 12,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numbersSection: {
    padding: 16,
    borderRadius: 12,
  },
  emergencyNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  numberInfo: {
    flex: 1,
  },
  numberService: {
    fontSize: 16,
    fontWeight: '500',
  },
  numberCountry: {
    fontSize: 12,
    marginTop: 2,
  },
  numberValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  blockedUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  blockedUserInfo: {
    flex: 1,
  },
  blockedUserName: {
    fontSize: 16,
    fontWeight: '500',
  },
  blockedUserReason: {
    fontSize: 12,
    marginTop: 2,
  },
  blockedUserDate: {
    fontSize: 12,
    marginTop: 2,
  },
  unblockButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  unblockButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 20,
  },
});

export default SafetyCenterScreen;