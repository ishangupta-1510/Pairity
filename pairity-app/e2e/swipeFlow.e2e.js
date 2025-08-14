import { device, expect, element, by, waitFor } from 'detox';

describe('Swipe Flow E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
    // Login first
    await loginHelper();
  });

  beforeEach(async () => {
    // Navigate to swipe screen
    await element(by.id('swipe-tab')).tap();
    await waitFor(element(by.id('swipe-screen')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should display swipe cards when users are available', async () => {
    // Wait for swipe cards to load
    await waitFor(element(by.id('swipe-card-stack')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify first card is visible
    await expect(element(by.id('current-swipe-card'))).toBeVisible();
    
    // Verify user information is displayed
    await expect(element(by.id('user-name'))).toBeVisible();
    await expect(element(by.id('user-age'))).toBeVisible();
    await expect(element(by.id('user-bio'))).toBeVisible();
    await expect(element(by.id('user-photo'))).toBeVisible();
  });

  it('should perform right swipe (like) gesture', async () => {
    await waitFor(element(by.id('current-swipe-card')))
      .toBeVisible()
      .withTimeout(5000);

    // Get initial card user name for verification
    const initialCard = element(by.id('current-swipe-card'));
    
    // Perform right swipe gesture
    await initialCard.swipe('right', 'fast', 0.8);

    // Verify like indicator appeared during swipe
    await waitFor(element(by.id('like-indicator')))
      .toBeVisible()
      .withTimeout(1000);

    // Wait for card animation to complete and next card to appear
    await waitFor(element(by.id('current-swipe-card')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify it's a different card (new user)
    // This would need to be implemented by checking user data
  });

  it('should perform left swipe (dislike) gesture', async () => {
    await waitFor(element(by.id('current-swipe-card')))
      .toBeVisible()
      .withTimeout(5000);

    const initialCard = element(by.id('current-swipe-card'));
    
    // Perform left swipe gesture
    await initialCard.swipe('left', 'fast', 0.8);

    // Verify dislike indicator appeared
    await waitFor(element(by.id('dislike-indicator')))
      .toBeVisible()
      .withTimeout(1000);

    // Wait for next card
    await waitFor(element(by.id('current-swipe-card')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should perform up swipe (superlike) gesture', async () => {
    await waitFor(element(by.id('current-swipe-card')))
      .toBeVisible()
      .withTimeout(5000);

    const initialCard = element(by.id('current-swipe-card'));
    
    // Perform up swipe gesture
    await initialCard.swipe('up', 'fast', 0.8);

    // Verify superlike indicator and animation
    await waitFor(element(by.id('superlike-indicator')))
      .toBeVisible()
      .withTimeout(1000);

    await waitFor(element(by.id('superlike-animation')))
      .toBeVisible()
      .withTimeout(1000);

    // Wait for next card
    await waitFor(element(by.id('current-swipe-card')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should use action buttons for swiping', async () => {
    await waitFor(element(by.id('current-swipe-card')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify action buttons are present
    await expect(element(by.id('dislike-button'))).toBeVisible();
    await expect(element(by.id('superlike-button'))).toBeVisible();
    await expect(element(by.id('like-button'))).toBeVisible();

    // Test like button
    await element(by.id('like-button')).tap();

    // Verify like action feedback
    await waitFor(element(by.id('like-indicator')))
      .toBeVisible()
      .withTimeout(1000);

    // Wait for next card
    await waitFor(element(by.id('current-swipe-card')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should show match modal when users match', async () => {
    await waitFor(element(by.id('current-swipe-card')))
      .toBeVisible()
      .withTimeout(5000);

    // Simulate a like that results in a match
    await element(by.id('like-button')).tap();

    // Wait for match modal to appear
    await waitFor(element(by.id('match-modal')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify match modal content
    await expect(element(by.id('match-celebration'))).toBeVisible();
    await expect(element(by.id('matched-user-photo'))).toBeVisible();
    await expect(element(by.id('current-user-photo'))).toBeVisible();
    await expect(element(by.text("It's a Match!"))).toBeVisible();

    // Verify action buttons in match modal
    await expect(element(by.id('start-chat-button'))).toBeVisible();
    await expect(element(by.id('keep-swiping-button'))).toBeVisible();
  });

  it('should navigate to chat from match modal', async () => {
    // Assuming we have a match modal open
    await waitFor(element(by.id('match-modal')))
      .toBeVisible()
      .withTimeout(5000);

    // Tap start chat button
    await element(by.id('start-chat-button')).tap();

    // Verify navigation to chat screen
    await waitFor(element(by.id('chat-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify chat interface elements
    await expect(element(by.id('chat-header'))).toBeVisible();
    await expect(element(by.id('message-input'))).toBeVisible();
    await expect(element(by.id('send-button'))).toBeVisible();
  });

  it('should continue swiping from match modal', async () => {
    await waitFor(element(by.id('match-modal')))
      .toBeVisible()
      .withTimeout(5000);

    // Tap keep swiping button
    await element(by.id('keep-swiping-button')).tap();

    // Verify match modal closes and swipe screen is back
    await waitFor(element(by.id('match-modal')))
      .not.toBeVisible()
      .withTimeout(2000);

    await waitFor(element(by.id('swipe-screen')))
      .toBeVisible()
      .withTimeout(2000);

    // Verify next card is available
    await expect(element(by.id('current-swipe-card'))).toBeVisible();
  });

  it('should show daily limit modal when limit is reached', async () => {
    // This test would require setting up a scenario where daily limit is reached
    // Simulate reaching daily swipe limit by performing multiple swipes
    
    for (let i = 0; i < 5; i++) {  // Assuming test limit is 5
      await waitFor(element(by.id('current-swipe-card')))
        .toBeVisible()
        .withTimeout(3000);
      
      await element(by.id('like-button')).tap();
      
      // Wait briefly between swipes
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Wait for daily limit modal
    await waitFor(element(by.id('daily-limit-modal')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify modal content
    await expect(element(by.text('Daily Limit Reached'))).toBeVisible();
    await expect(element(by.text('Come back tomorrow for more swipes'))).toBeVisible();
    await expect(element(by.id('upgrade-premium-button'))).toBeVisible();
    await expect(element(by.id('close-limit-modal-button'))).toBeVisible();
  });

  it('should show superlike limit modal when no superlikes remain', async () => {
    await waitFor(element(by.id('current-swipe-card')))
      .toBeVisible()
      .withTimeout(5000);

    // Exhaust superlike count (assuming user starts with 1 free superlike)
    await element(by.id('superlike-button')).tap();
    
    // Wait for next card
    await waitFor(element(by.id('current-swipe-card')))
      .toBeVisible()
      .withTimeout(3000);

    // Try to superlike again
    await element(by.id('superlike-button')).tap();

    // Wait for superlike limit modal
    await waitFor(element(by.id('superlike-limit-modal')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify modal content
    await expect(element(by.text('No Super Likes Left'))).toBeVisible();
    await expect(element(by.id('get-more-superlikes-button'))).toBeVisible();
  });

  it('should open user profile when card is tapped', async () => {
    await waitFor(element(by.id('current-swipe-card')))
      .toBeVisible()
      .withTimeout(5000);

    // Tap on the card (not on action buttons)
    await element(by.id('current-swipe-card')).tap();

    // Wait for profile modal/screen to open
    await waitFor(element(by.id('user-profile-modal')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify profile content
    await expect(element(by.id('profile-photos'))).toBeVisible();
    await expect(element(by.id('profile-details'))).toBeVisible();
    await expect(element(by.id('profile-interests'))).toBeVisible();

    // Verify action buttons in profile
    await expect(element(by.id('profile-dislike-button'))).toBeVisible();
    await expect(element(by.id('profile-superlike-button'))).toBeVisible();
    await expect(element(by.id('profile-like-button'))).toBeVisible();
  });

  it('should handle photo swiping in user profile', async () => {
    // Open user profile first
    await element(by.id('current-swipe-card')).tap();
    
    await waitFor(element(by.id('user-profile-modal')))
      .toBeVisible()
      .withTimeout(3000);

    const photosContainer = element(by.id('profile-photos'));
    
    // Swipe to next photo
    await photosContainer.swipe('left', 'fast', 0.5);
    
    // Verify photo indicator updated
    await waitFor(element(by.id('photo-indicator-1')))
      .toBeVisible()
      .withTimeout(1000);

    // Swipe back
    await photosContainer.swipe('right', 'fast', 0.5);
    
    await waitFor(element(by.id('photo-indicator-0')))
      .toBeVisible()
      .withTimeout(1000);
  });

  it('should handle empty swipe queue', async () => {
    // This test assumes we've swiped through all available users
    // In a real scenario, this might require specific test data setup
    
    // Continue swiping until no more cards
    let hasMoreCards = true;
    while (hasMoreCards) {
      try {
        await waitFor(element(by.id('current-swipe-card')))
          .toBeVisible()
          .withTimeout(2000);
        
        await element(by.id('like-button')).tap();
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        hasMoreCards = false;
      }
    }

    // Verify empty state is shown
    await waitFor(element(by.id('no-more-cards-message')))
      .toBeVisible()
      .withTimeout(3000);

    await expect(element(by.text('No more potential matches'))).toBeVisible();
    await expect(element(by.text('Check back later for new people'))).toBeVisible();
    await expect(element(by.id('expand-search-button'))).toBeVisible();
  });

  it('should show boost modal when boost button is tapped', async () => {
    // Look for boost button (usually in header or as floating button)
    await element(by.id('boost-button')).tap();

    // Wait for boost modal
    await waitFor(element(by.id('boost-modal')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify boost modal content
    await expect(element(by.text('Boost Your Profile'))).toBeVisible();
    await expect(element(by.id('boost-description'))).toBeVisible();
    await expect(element(by.id('activate-boost-button'))).toBeVisible();
    await expect(element(by.id('cancel-boost-button'))).toBeVisible();
  });
});

// Helper function for login
async function loginHelper() {
  await waitFor(element(by.id('login-screen')))
    .toBeVisible()
    .withTimeout(5000);

  await element(by.id('email-input')).typeText('test@example.com');
  await element(by.id('password-input')).typeText('password123');
  await element(by.id('login-button')).tap();

  await waitFor(element(by.id('main-tab-navigator')))
    .toBeVisible()
    .withTimeout(10000);
}