import React from 'react';
import { ActionSheetIOS, Platform } from 'react-native';
import { IOSActionSheetOptions } from '@/types/ios';

interface IOSActionSheetProps {
  visible: boolean;
  options: IOSActionSheetOptions;
  onSelect: (index: number) => void;
  onCancel?: () => void;
}

const IOSActionSheet: React.FC<IOSActionSheetProps> = ({
  visible,
  options,
  onSelect,
  onCancel,
}) => {
  React.useEffect(() => {
    if (Platform.OS === 'ios' && visible) {
      showActionSheet();
    }
  }, [visible]);

  const showActionSheet = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: options.title,
        message: options.message,
        options: options.options,
        destructiveButtonIndex: options.destructiveButtonIndex,
        cancelButtonIndex: options.cancelButtonIndex,
        tintColor: options.tintColor,
        anchor: options.anchor,
      },
      (buttonIndex) => {
        if (buttonIndex === options.cancelButtonIndex) {
          onCancel?.();
        } else {
          onSelect(buttonIndex);
        }
      }
    );
  };

  // ActionSheetIOS doesn't render anything, it's a native modal
  return null;
};

export default IOSActionSheet;