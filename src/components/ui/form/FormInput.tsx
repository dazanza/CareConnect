import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { FormField } from './FormField';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  pointerEvents?: 'none' | 'box-none' | 'box-only' | 'auto';
  testID?: string;
  style?: any;
  maxLength?: number;
  showCharacterCount?: boolean;
  autoComplete?: string;
  autoCorrect?: boolean;
  clearButtonMode?: 'never' | 'while-editing' | 'unless-editing' | 'always';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  required,
  disabled,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  editable,
  pointerEvents,
  testID,
  style,
  maxLength,
  showCharacterCount = false,
  autoComplete,
  autoCorrect = true,
  clearButtonMode = 'never',
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
}) => {
  const [focused, setFocused] = React.useState(false);

  const handleFocus = () => setFocused(true);
  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  const showCount = showCharacterCount || (maxLength !== undefined && focused);
  const characterCount = value?.length || 0;

  return (
    <FormField
      label={label}
      error={error}
      touched={touched}
      required={required}
      disabled={disabled}
      style={style}
    >
      <View>
        <TextInput
          mode="outlined"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          disabled={disabled}
          error={!!error && touched}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          pointerEvents={pointerEvents}
          testID={testID}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          clearButtonMode={clearButtonMode}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            focused && styles.focusedInput,
          ]}
        />
        {showCount && (
          <Text style={[
            styles.characterCount,
            maxLength && characterCount >= maxLength && styles.characterCountLimit
          ]}>
            {maxLength ? `${characterCount}/${maxLength}` : characterCount}
          </Text>
        )}
      </View>
    </FormField>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'transparent',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  focusedInput: {
    borderWidth: 2,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  characterCountLimit: {
    color: '#E53935',
  },
}); 