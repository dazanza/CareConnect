import React from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Text } from 'react-native-paper';
import { FormInput } from './FormInput';

interface TextAreaProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  numberOfLines?: number;
  maxLength?: number;
  minHeight?: number;
  maxHeight?: number;
  autoResize?: boolean;
  showCharacterCount?: boolean;
  characterCountPosition?: 'inside' | 'outside';
  testID?: string;
  style?: any;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  required,
  disabled,
  placeholder,
  numberOfLines = 4,
  maxLength,
  minHeight = 100,
  maxHeight = 300,
  autoResize = true,
  showCharacterCount = false,
  characterCountPosition = 'outside',
  testID,
  style,
}) => {
  const [height, setHeight] = React.useState<number>(minHeight);

  const handleContentSizeChange = (event: LayoutChangeEvent) => {
    if (!autoResize) return;

    const contentHeight = event.nativeEvent.layout.height;
    const newHeight = Math.max(
      minHeight,
      Math.min(contentHeight, maxHeight)
    );
    setHeight(newHeight);
  };

  const renderCharacterCount = () => {
    if (!showCharacterCount) return null;

    const count = value.length;
    const isNearLimit = maxLength && count >= maxLength * 0.9;
    const isAtLimit = maxLength && count >= maxLength;

    return (
      <Text
        style={[
          styles.characterCount,
          isAtLimit && styles.characterCountLimit,
          isNearLimit && styles.characterCountNearLimit,
          characterCountPosition === 'inside' && styles.characterCountInside,
        ]}
      >
        {maxLength ? `${count}/${maxLength}` : count}
      </Text>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <FormInput
          label={label}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          error={error}
          touched={touched}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          multiline
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          testID={testID}
          style={[
            styles.input,
            { height: autoResize ? height : undefined },
          ]}
          onLayout={handleContentSizeChange}
        />
        {characterCountPosition === 'inside' && renderCharacterCount()}
      </View>
      {characterCountPosition === 'outside' && renderCharacterCount()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  characterCountInside: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    marginTop: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  characterCountNearLimit: {
    color: '#f59e0b',
  },
  characterCountLimit: {
    color: '#ef4444',
  },
}); 