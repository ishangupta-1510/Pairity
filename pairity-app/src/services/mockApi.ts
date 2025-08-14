import { TestDataFactory, MockApiHelper } from '@/utils/testing';
import { TestUser, TestMatch, TestMessage, TestChat, MockApiResponse } from '@/types/testing';

class MockApiService {
  private users: TestUser[] = [];
  private matches: TestMatch[] = [];
  private chats: TestChat[] = [];
  private messages: TestMessage[] = [];
  private currentUser: TestUser | null = null;
  private isOnline: boolean = true;
  private networkDelay: number = 200; // Default network delay in ms

  constructor() {
    this.initializeMockData();
  }

  // Initialize with sample data
  private initializeMockData(): void {
    // Create test users
    this.users = TestDataFactory.createUserList(50);
    
    // Set current user
    this.currentUser = TestDataFactory.createUser({
      id: 'current-user',
      email: 'test@example.com',
      name: 'Current User',
    });

    // Create some matches
    this.matches = [
      TestDataFactory.createMatch(this.currentUser.id, this.users[0].id),
      TestDataFactory.createMatch(this.currentUser.id, this.users[1].id),
      TestDataFactory.createMatch(this.currentUser.id, this.users[2].id),
    ];

    // Create chats for matches
    this.chats = this.matches.map(match => 
      TestDataFactory.createChat([match.user1Id, match.user2Id], {
        id: `chat_${match.id}`,
      })
    );

    // Create messages for chats
    this.chats.forEach(chat => {
      const messageCount = Math.floor(Math.random() * 20) + 5;
      const chatMessages = TestDataFactory.createMessageThread(chat.id, messageCount);
      this.messages.push(...chatMessages);
    });
  }

  // Network simulation methods
  setNetworkStatus(online: boolean): void {
    this.isOnline = online;
  }

  setNetworkDelay(delay: number): void {
    this.networkDelay = delay;
  }

  private async simulateNetworkDelay(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Network error. Please check your connection.');
    }
    
    if (this.networkDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.networkDelay));
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<MockApiResponse<{ user: TestUser; token: string }>> {
    await this.simulateNetworkDelay();

    if (email === 'test@example.com' && password === 'password123') {
      return MockApiHelper.success({
        user: this.currentUser!,
        token: 'mock_jwt_token_12345',
      });
    }

    return MockApiHelper.error('Invalid email or password');
  }

  async signup(userData: {
    name: string;
    email: string;
    password: string;
    age: number;
  }): Promise<MockApiResponse<{ user: TestUser; token: string }>> {
    await this.simulateNetworkDelay();

    // Check if email already exists
    const existingUser = this.users.find(u => u.email === userData.email);
    if (existingUser) {
      return MockApiHelper.error('An account with this email already exists');
    }

    const newUser = TestDataFactory.createUser({
      name: userData.name,
      email: userData.email,
      age: userData.age,
    });

    this.users.push(newUser);
    this.currentUser = newUser;

    return MockApiHelper.success({
      user: newUser,
      token: 'mock_jwt_token_12345',
    });
  }

  async forgotPassword(email: string): Promise<MockApiResponse<{ message: string }>> {
    await this.simulateNetworkDelay();

    // Simulate password reset for any valid email format
    if (email.includes('@') && email.includes('.')) {
      return MockApiHelper.success({
        message: 'Password reset email sent successfully',
      });
    }

    return MockApiHelper.error('Please enter a valid email address');
  }

  // User discovery endpoints
  async getDiscoverUsers(filters?: any): Promise<MockApiResponse<{ users: TestUser[] }>> {
    await this.simulateNetworkDelay();

    let filteredUsers = this.users.filter(u => u.id !== this.currentUser?.id);

    // Apply filters if provided
    if (filters) {
      if (filters.ageRange) {
        filteredUsers = filteredUsers.filter(
          u => u.age >= filters.ageRange[0] && u.age <= filters.ageRange[1]
        );
      }

      if (filters.interests && filters.interests.length > 0) {
        filteredUsers = filteredUsers.filter(u =>
          filters.interests.some((interest: string) => u.interests.includes(interest))
        );
      }

      if (filters.verified) {
        filteredUsers = filteredUsers.filter(u => u.verified);
      }
    }

    // Simulate pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    
    return MockApiHelper.paginated(filteredUsers, page, limit);
  }

  // Swipe and matching endpoints
  async swipe(swipedUserId: string, action: 'like' | 'dislike' | 'superlike'): Promise<MockApiResponse<{
    matched: boolean;
    match?: TestMatch;
  }>> {
    await this.simulateNetworkDelay();

    const swipedUser = this.users.find(u => u.id === swipedUserId);
    if (!swipedUser) {
      return MockApiHelper.error('User not found');
    }

    // Simulate match probability (30% for likes, 50% for superlikes)
    const matchProbability = action === 'superlike' ? 0.5 : action === 'like' ? 0.3 : 0;
    const isMatch = Math.random() < matchProbability;

    if (isMatch && this.currentUser) {
      const match = TestDataFactory.createMatch(this.currentUser.id, swipedUserId);
      this.matches.push(match);

      // Create a chat for the new match
      const chat = TestDataFactory.createChat([this.currentUser.id, swipedUserId], {
        id: `chat_${match.id}`,
      });
      this.chats.push(chat);

      return MockApiHelper.success({
        matched: true,
        match,
      });
    }

    return MockApiHelper.success({
      matched: false,
    });
  }

  async getMatches(): Promise<MockApiResponse<{ matches: TestMatch[]; users: TestUser[] }>> {
    await this.simulateNetworkDelay();

    const userMatches = this.matches.filter(
      m => m.user1Id === this.currentUser?.id || m.user2Id === this.currentUser?.id
    );

    const matchedUsers = userMatches.map(match => {
      const otherUserId = match.user1Id === this.currentUser?.id ? match.user2Id : match.user1Id;
      return this.users.find(u => u.id === otherUserId)!;
    }).filter(Boolean);

    return MockApiHelper.success({
      matches: userMatches,
      users: matchedUsers,
    });
  }

  // Chat endpoints
  async getChats(): Promise<MockApiResponse<{ chats: TestChat[]; users: TestUser[] }>> {
    await this.simulateNetworkDelay();

    const userChats = this.chats.filter(chat =>
      chat.participants.includes(this.currentUser?.id || '')
    );

    // Get users involved in chats
    const userIds = new Set<string>();
    userChats.forEach(chat => {
      chat.participants.forEach(id => {
        if (id !== this.currentUser?.id) {
          userIds.add(id);
        }
      });
    });

    const chatUsers = Array.from(userIds).map(id =>
      this.users.find(u => u.id === id)
    ).filter(Boolean) as TestUser[];

    return MockApiHelper.success({
      chats: userChats,
      users: chatUsers,
    });
  }

  async getMessages(chatId: string): Promise<MockApiResponse<{ messages: TestMessage[] }>> {
    await this.simulateNetworkDelay();

    const chatMessages = this.messages.filter(m => m.chatId === chatId);
    
    // Sort by timestamp
    chatMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return MockApiHelper.success({
      messages: chatMessages,
    });
  }

  async sendMessage(chatId: string, content: string, type: string = 'text'): Promise<MockApiResponse<{ message: TestMessage }>> {
    await this.simulateNetworkDelay();

    const chat = this.chats.find(c => c.id === chatId);
    if (!chat) {
      return MockApiHelper.error('Chat not found');
    }

    const message = TestDataFactory.createMessage(chatId, this.currentUser?.id, {
      content,
      type: type as any,
      timestamp: new Date().toISOString(),
    });

    this.messages.push(message);

    // Update chat's last message
    chat.lastMessage = message;
    chat.updatedAt = message.timestamp;

    return MockApiHelper.success({ message });
  }

  // Profile endpoints
  async getUserProfile(userId: string): Promise<MockApiResponse<{ user: TestUser }>> {
    await this.simulateNetworkDelay();

    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return MockApiHelper.error('User not found');
    }

    return MockApiHelper.success({ user });
  }

  async updateProfile(updates: Partial<TestUser>): Promise<MockApiResponse<{ user: TestUser }>> {
    await this.simulateNetworkDelay();

    if (!this.currentUser) {
      return MockApiHelper.error('User not authenticated');
    }

    // Update current user
    Object.assign(this.currentUser, updates);

    // Update in users array
    const userIndex = this.users.findIndex(u => u.id === this.currentUser!.id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.currentUser };
    }

    return MockApiHelper.success({ user: this.currentUser });
  }

  async uploadPhoto(photoUri: string): Promise<MockApiResponse<{ photoUrl: string }>> {
    await this.simulateNetworkDelay();

    // Simulate photo upload
    const photoUrl = `https://mock-cdn.example.com/photos/${Date.now()}.jpg`;
    
    if (this.currentUser) {
      this.currentUser.photos.push(photoUrl);
    }

    return MockApiHelper.success({ photoUrl });
  }

  // Premium endpoints
  async subscribeToPremium(plan: string): Promise<MockApiResponse<{ subscription: any }>> {
    await this.simulateNetworkDelay();

    if (!this.currentUser) {
      return MockApiHelper.error('User not authenticated');
    }

    this.currentUser.premium = true;

    return MockApiHelper.success({
      subscription: {
        plan,
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      },
    });
  }

  // Analytics endpoints
  async trackEvent(eventName: string, properties: any): Promise<MockApiResponse<{ success: boolean }>> {
    await this.simulateNetworkDelay();

    console.log('Mock Analytics Event:', eventName, properties);

    return MockApiHelper.success({ success: true });
  }

  // Utility methods for testing
  addUser(user: TestUser): void {
    this.users.push(user);
  }

  addMatch(match: TestMatch): void {
    this.matches.push(match);
  }

  addMessage(message: TestMessage): void {
    this.messages.push(message);
  }

  reset(): void {
    TestDataFactory.resetCounters();
    this.initializeMockData();
  }

  getCurrentUser(): TestUser | null {
    return this.currentUser;
  }

  setCurrentUser(user: TestUser): void {
    this.currentUser = user;
  }

  getAllUsers(): TestUser[] {
    return this.users;
  }

  getAllMatches(): TestMatch[] {
    return this.matches;
  }

  getAllMessages(): TestMessage[] {
    return this.messages;
  }

  // Error simulation methods
  simulateError(endpoint: string, error: string): void {
    // This would be used to simulate specific errors for testing
    console.log(`Mock API: Simulating error for ${endpoint}: ${error}`);
  }

  simulateSlowResponse(endpoint: string, delay: number): void {
    // This would be used to simulate slow responses for testing
    console.log(`Mock API: Simulating slow response for ${endpoint}: ${delay}ms`);
  }
}

// Export singleton instance
export const mockApi = new MockApiService();

// Export class for creating new instances in tests
export default MockApiService;