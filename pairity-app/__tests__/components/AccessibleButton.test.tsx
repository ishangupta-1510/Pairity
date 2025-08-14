import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders, accessibilityTestHelpers, componentTestHelpers } from '@/utils/testHelpers';
import AccessibleButton from '@/components/accessibility/AccessibleButton';

describe('AccessibleButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders with title and responds to press', () => {
      const { getByText } = renderWithProviders(
        <AccessibleButton title="Test Button" onPress={mockOnPress} />
      );

      const button = getByText('Test Button');
      expect(button).toBeTruthy();

      fireEvent.press(button);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('renders with icon and title', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <AccessibleButton
          title="With Icon"
          icon="star"
          onPress={mockOnPress}
          testID="icon-button"
        />
      );

      expect(getByText('With Icon')).toBeTruthy();
      expect(getByTestId('icon-button')).toBeTruthy();
    });

    it('handles disabled state correctly', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Disabled Button"
          onPress={mockOnPress}
          disabled={true}
          testID="disabled-button"
        />
      );

      const button = getByTestId('disabled-button');
      fireEvent.press(button);

      expect(mockOnPress).not.toHaveBeenCalled();
      componentTestHelpers.expectButtonToBeDisabled(getByTestId, 'disabled-button');
    });

    it('handles loading state correctly', () => {
      const { getByTestId, queryByText } = renderWithProviders(
        <AccessibleButton
          title="Loading Button"
          onPress={mockOnPress}
          loading={true}
          testID="loading-button"
        />
      );

      const button = getByTestId('loading-button');
      fireEvent.press(button);

      expect(mockOnPress).not.toHaveBeenCalled();
      expect(queryByText('Loading Button')).toBeFalsy(); // Text should be hidden during loading
    });
  });

  describe('Variant Styles', () => {
    it('renders primary variant correctly', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Primary"
          variant="primary"
          onPress={mockOnPress}
          testID="primary-button"
        />
      );

      const button = getByTestId('primary-button');
      expect(button).toBeTruthy();
    });

    it('renders secondary variant correctly', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Secondary"
          variant="secondary"
          onPress={mockOnPress}
          testID="secondary-button"
        />
      );

      const button = getByTestId('secondary-button');
      expect(button).toBeTruthy();
    });

    it('renders outline variant correctly', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Outline"
          variant="outline"
          onPress={mockOnPress}
          testID="outline-button"
        />
      );

      const button = getByTestId('outline-button');
      expect(button).toBeTruthy();
    });
  });

  describe('Size Variants', () => {
    it('renders small size correctly', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Small"
          size="small"
          onPress={mockOnPress}
          testID="small-button"
        />
      );

      const button = getByTestId('small-button');
      expect(button).toBeTruthy();
    });

    it('renders large size correctly', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Large"
          size="large"
          onPress={mockOnPress}
          testID="large-button"
        />
      );

      const button = getByTestId('large-button');
      expect(button).toBeTruthy();
    });
  });

  describe('Accessibility Features', () => {
    it('has correct accessibility label', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Accessible Button"
          onPress={mockOnPress}
          accessibilityLabel="Custom accessibility label"
          testID="accessible-button"
        />
      );

      accessibilityTestHelpers.expectAccessibilityLabel(
        getByTestId,
        'accessible-button',
        'Custom accessibility label'
      );
    });

    it('has correct accessibility hint', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Button with Hint"
          onPress={mockOnPress}
          accessibilityHint="This button performs an action"
          testID="button-with-hint"
        />
      );

      accessibilityTestHelpers.expectAccessibilityHint(
        getByTestId,
        'button-with-hint',
        'This button performs an action'
      );
    });

    it('has correct accessibility role', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Button Role"
          onPress={mockOnPress}
          testID="button-role"
        />
      );

      accessibilityTestHelpers.expectAccessibilityRole(
        getByTestId,
        'button-role',
        'button'
      );
    });

    it('handles accessibility state correctly', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="State Button"
          onPress={mockOnPress}
          disabled={true}
          selected={true}
          testID="state-button"
        />
      );

      accessibilityTestHelpers.expectAccessibilityState(
        getByTestId,
        'state-button',
        expect.objectContaining({
          disabled: true,
          selected: true,
        })
      );
    });

    it('generates default accessibility label from title', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Default Label"
          onPress={mockOnPress}
          testID="default-label-button"
        />
      );

      const button = getByTestId('default-label-button');
      expect(button.props.accessibilityLabel).toBe('Default Label');
    });

    it('includes loading state in accessibility label', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Loading Button"
          onPress={mockOnPress}
          loading={true}
          testID="loading-accessible-button"
        />
      );

      const button = getByTestId('loading-accessible-button');
      expect(button.props.accessibilityLabel).toContain('Loading');
    });

    it('includes selected state in accessibility label', () => {
      const { getByTestID } = renderWithProviders(
        <AccessibleButton
          title="Selected Button"
          onPress={mockOnPress}
          selected={true}
          testID="selected-accessible-button"
        />
      );

      const button = getByTestID('selected-accessible-button');
      expect(button.props.accessibilityLabel).toContain('Selected');
    });
  });

  describe('Icon Positioning', () => {
    it('renders icon on the left by default', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Left Icon"
          icon="star"
          onPress={mockOnPress}
          testID="left-icon-button"
        />
      );

      const button = getByTestId('left-icon-button');
      expect(button).toBeTruthy();
    });

    it('renders icon on the right when specified', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Right Icon"
          icon="arrow-forward"
          iconPosition="right"
          onPress={mockOnPress}
          testID="right-icon-button"
        />
      );

      const button = getByTestId('right-icon-button');
      expect(button).toBeTruthy();
    });
  });

  describe('Full Width Option', () => {
    it('renders full width when specified', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Full Width"
          onPress={mockOnPress}
          fullWidth={true}
          testID="full-width-button"
        />
      );

      const button = getByTestId('full-width-button');
      expect(button).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('adapts to bold text setting', () => {
      const mockStore = {
        preloadedState: {
          accessibility: {
            settings: {
              isBoldTextEnabled: true,
              fontScale: 1.2,
            },
          },
        },
      };

      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Bold Text"
          onPress={mockOnPress}
          testID="bold-text-button"
        />,
        mockStore
      );

      const button = getByTestId('bold-text-button');
      expect(button).toBeTruthy();
    });

    it('respects reduce motion setting', () => {
      const mockStore = {
        preloadedState: {
          accessibility: {
            settings: {
              isReduceMotionEnabled: true,
            },
          },
        },
      };

      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Reduced Motion"
          onPress={mockOnPress}
          testID="reduced-motion-button"
        />,
        mockStore
      );

      const button = getByTestId('reduced-motion-button');
      // Reduced motion should set activeOpacity to 1
      expect(button.props.activeOpacity).toBe(1);
    });
  });

  describe('Press Handling', () => {
    it('calls onPress when pressed and enabled', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Press Test"
          onPress={mockOnPress}
          testID="press-test-button"
        />
      );

      const button = getByTestId('press-test-button');
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Disabled Press"
          onPress={mockOnPress}
          disabled={true}
          testID="disabled-press-button"
        />
      );

      const button = getByTestId('disabled-press-button');
      fireEvent.press(button);

      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('does not call onPress when loading', () => {
      const { getByTestId } = renderWithProviders(
        <AccessibleButton
          title="Loading Press"
          onPress={mockOnPress}
          loading={true}
          testID="loading-press-button"
        />
      );

      const button = getByTestId('loading-press-button');
      fireEvent.press(button);

      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });
});