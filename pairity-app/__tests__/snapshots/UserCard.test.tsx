import React from 'react';
import { render } from '@testing-library/react-native';
import { renderWithProviders } from '@/utils/testHelpers';
import { TestDataFactory } from '@/utils/testing';
import UserCard from '@/components/discover/UserCard';

describe('UserCard Snapshot Tests', () => {
  const mockUser = TestDataFactory.createUser({
    id: 'test-user',
    name: 'Test User',
    age: 25,
    bio: 'Test bio for snapshot testing',
    photos: ['https://example.com/photo1.jpg'],
    verified: true,
    premium: false,
    interests: ['Travel', 'Food'],
  });

  it('matches snapshot for basic user card', () => {
    const { toJSON } = renderWithProviders(
      <UserCard
        user={mockUser}
        onPress={jest.fn()}
        testID="user-card"
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for verified user card', () => {
    const verifiedUser = { ...mockUser, verified: true };
    
    const { toJSON } = renderWithProviders(
      <UserCard
        user={verifiedUser}
        onPress={jest.fn()}
        testID="verified-user-card"
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for premium user card', () => {
    const premiumUser = { ...mockUser, premium: true };
    
    const { toJSON } = renderWithProviders(
      <UserCard
        user={premiumUser}
        onPress={jest.fn()}
        testID="premium-user-card"
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for user card with many interests', () => {
    const userWithManyInterests = {
      ...mockUser,
      interests: ['Travel', 'Food', 'Music', 'Sports', 'Movies', 'Art'],
    };
    
    const { toJSON } = renderWithProviders(
      <UserCard
        user={userWithManyInterests}
        onPress={jest.fn()}
        testID="user-card-many-interests"
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for user card in grid layout', () => {
    const { toJSON } = renderWithProviders(
      <UserCard
        user={mockUser}
        onPress={jest.fn()}
        layout="grid"
        testID="user-card-grid"
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for user card in list layout', () => {
    const { toJSON } = renderWithProviders(
      <UserCard
        user={mockUser}
        onPress={jest.fn()}
        layout="list"
        testID="user-card-list"
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for user card with long bio', () => {
    const userWithLongBio = {
      ...mockUser,
      bio: 'This is a very long bio that should test text truncation and layout handling in the user card component. It contains multiple sentences and should demonstrate how the component handles overflow text content.',
    };
    
    const { toJSON } = renderWithProviders(
      <UserCard
        user={userWithLongBio}
        onPress={jest.fn()}
        testID="user-card-long-bio"
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for user card with no interests', () => {
    const userWithNoInterests = {
      ...mockUser,
      interests: [],
    };
    
    const { toJSON } = renderWithProviders(
      <UserCard
        user={userWithNoInterests}
        onPress={jest.fn()}
        testID="user-card-no-interests"
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for user card with multiple photos', () => {
    const userWithMultiplePhotos = {
      ...mockUser,
      photos: [
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg',
        'https://example.com/photo3.jpg',
      ],
    };
    
    const { toJSON } = renderWithProviders(
      <UserCard
        user={userWithMultiplePhotos}
        onPress={jest.fn()}
        testID="user-card-multiple-photos"
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for selected user card', () => {
    const { toJSON } = renderWithProviders(
      <UserCard
        user={mockUser}
        onPress={jest.fn()}
        selected={true}
        testID="user-card-selected"
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });
});