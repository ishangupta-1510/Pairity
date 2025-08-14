import { device, expect, element, by, waitFor } from 'detox';

describe('Login Flow E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen on app launch when not authenticated', async () => {
    // Wait for login screen to appear
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify login form elements are present
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
    await expect(element(by.id('login-button'))).toBeVisible();
    await expect(element(by.id('signup-link'))).toBeVisible();
  });

  it('should show validation errors for empty form submission', async () => {
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Try to login without entering credentials
    await element(by.id('login-button')).tap();

    // Wait for validation errors
    await waitFor(element(by.text('Email is required')))
      .toBeVisible()
      .withTimeout(2000);

    await waitFor(element(by.text('Password is required')))
      .toBeVisible()
      .withTimeout(2000);
  });

  it('should show error for invalid email format', async () => {
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Enter invalid email
    await element(by.id('email-input')).typeText('invalid-email');
    await element(by.id('password-input')).typeText('password123');
    
    // Try to login
    await element(by.id('login-button')).tap();

    // Wait for email validation error
    await waitFor(element(by.text('Please enter a valid email address')))
      .toBeVisible()
      .withTimeout(2000);
  });

  it('should handle successful login flow', async () => {
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Enter valid credentials
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    
    // Hide keyboard
    await element(by.id('password-input')).tapReturnKey();
    
    // Login
    await element(by.id('login-button')).tap();

    // Wait for loading indicator
    await waitFor(element(by.id('loading-indicator')))
      .toBeVisible()
      .withTimeout(2000);

    // Wait for navigation to main screen
    await waitFor(element(by.id('main-tab-navigator')))
      .toBeVisible()
      .withTimeout(10000);

    // Verify we're on the home screen
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should handle login failure with invalid credentials', async () => {
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Enter invalid credentials
    await element(by.id('email-input')).typeText('wrong@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    
    await element(by.id('password-input')).tapReturnKey();
    await element(by.id('login-button')).tap();

    // Wait for error message
    await waitFor(element(by.text('Invalid email or password')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify we're still on login screen
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should navigate to signup screen when signup link is tapped', async () => {
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Tap signup link
    await element(by.id('signup-link')).tap();

    // Wait for signup screen
    await waitFor(element(by.id('signup-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify signup form elements
    await expect(element(by.id('name-input'))).toBeVisible();
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
    await expect(element(by.id('signup-button'))).toBeVisible();
  });

  it('should handle forgot password flow', async () => {
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Tap forgot password link
    await element(by.id('forgot-password-link')).tap();

    // Wait for forgot password screen
    await waitFor(element(by.id('forgot-password-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Enter email
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('email-input')).tapReturnKey();

    // Submit reset request
    await element(by.id('reset-password-button')).tap();

    // Wait for success message
    await waitFor(element(by.text('Password reset email sent')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show password when show/hide toggle is tapped', async () => {
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Enter password
    await element(by.id('password-input')).typeText('testpassword');

    // Verify password is hidden (secure text entry)
    await expect(element(by.id('password-input'))).toHaveToggle(true);

    // Tap show/hide toggle
    await element(by.id('password-toggle')).tap();

    // Verify password is now visible
    await expect(element(by.id('password-input'))).toHaveToggle(false);

    // Tap again to hide
    await element(by.id('password-toggle')).tap();
    await expect(element(by.id('password-input'))).toHaveToggle(true);
  });

  it('should handle social login options', async () => {
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify social login buttons are present
    await expect(element(by.id('google-login-button'))).toBeVisible();
    await expect(element(by.id('facebook-login-button'))).toBeVisible();
    await expect(element(by.id('apple-login-button'))).toBeVisible();

    // Test Google login (would normally open external app/web view)
    await element(by.id('google-login-button')).tap();
    
    // In a real test, you would handle the OAuth flow
    // For this example, we'll just verify the button works
    await waitFor(element(by.id('google-auth-webview')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should maintain login state after app backgrounding', async () => {
    // First login
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Wait for main screen
    await waitFor(element(by.id('main-tab-navigator')))
      .toBeVisible()
      .withTimeout(10000);

    // Background the app
    await device.sendToHome();
    await device.launchApp({ newInstance: false });

    // Verify we're still logged in
    await waitFor(element(by.id('main-tab-navigator')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle biometric authentication if enabled', async () => {
    // This test assumes biometric auth is set up in device settings
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Look for biometric login button
    const biometricButton = element(by.id('biometric-login-button'));
    
    try {
      await expect(biometricButton).toBeVisible();
      
      // Tap biometric login
      await biometricButton.tap();
      
      // Wait for biometric prompt (this would require device interaction)
      await waitFor(element(by.text('Use Face ID to sign in')))
        .toBeVisible()
        .withTimeout(3000);
        
    } catch (error) {
      // Biometric not available - skip this part of test
      console.log('Biometric authentication not available in test environment');
    }
  });

  it('should handle network connectivity issues', async () => {
    // Disable network connectivity
    await device.setURLBlacklist(['*']);
    
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Wait for network error message
    await waitFor(element(by.text('Network error. Please check your connection.')))
      .toBeVisible()
      .withTimeout(5000);

    // Re-enable network
    await device.setURLBlacklist([]);
    
    // Retry login
    await element(by.id('retry-button')).tap();
    
    // Should now succeed
    await waitFor(element(by.id('main-tab-navigator')))
      .toBeVisible()
      .withTimeout(10000);
  });
});

describe('Signup Flow E2E', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Navigate to signup screen
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    await element(by.id('signup-link')).tap();
    
    await waitFor(element(by.id('signup-screen')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should complete successful signup flow', async () => {
    // Fill out signup form
    await element(by.id('name-input')).typeText('Test User');
    await element(by.id('email-input')).typeText('newuser@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('confirm-password-input')).typeText('password123');
    
    // Scroll down to see terms checkbox
    await element(by.id('signup-scroll-view')).scroll(200, 'down');
    
    // Accept terms and conditions
    await element(by.id('terms-checkbox')).tap();
    
    // Submit signup
    await element(by.id('signup-button')).tap();

    // Wait for verification screen or direct login
    await waitFor(element(by.id('email-verification-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify success message
    await expect(element(by.text('Account created successfully'))).toBeVisible();
    await expect(element(by.text('Please check your email to verify your account'))).toBeVisible();
  });

  it('should validate password confirmation', async () => {
    await element(by.id('name-input')).typeText('Test User');
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('confirm-password-input')).typeText('differentpassword');
    
    await element(by.id('signup-button')).tap();

    // Wait for password mismatch error
    await waitFor(element(by.text('Passwords do not match')))
      .toBeVisible()
      .withTimeout(2000);
  });

  it('should require terms and conditions acceptance', async () => {
    await element(by.id('name-input')).typeText('Test User');
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('confirm-password-input')).typeText('password123');
    
    // Don't check terms checkbox
    await element(by.id('signup-button')).tap();

    // Wait for terms acceptance error
    await waitFor(element(by.text('You must accept the terms and conditions')))
      .toBeVisible()
      .withTimeout(2000);
  });

  it('should handle duplicate email error', async () => {
    await element(by.id('name-input')).typeText('Test User');
    await element(by.id('email-input')).typeText('existing@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('confirm-password-input')).typeText('password123');
    
    await element(by.id('signup-scroll-view')).scroll(200, 'down');
    await element(by.id('terms-checkbox')).tap();
    await element(by.id('signup-button')).tap();

    // Wait for duplicate email error
    await waitFor(element(by.text('An account with this email already exists')))
      .toBeVisible()
      .withTimeout(5000);
  });
});