import React from 'react';
import { FormInput } from './FormInput';
import { formatPhoneNumber } from '../../../utils/formatters';

interface PhoneInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  testID?: string;
  style?: any;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  required,
  disabled,
  placeholder,
  testID,
  style,
}) => {
  const handleChangeText = (text: string) => {
    // Remove all non-numeric characters
    const numericValue = text.replace(/\D/g, '');
    // Format the phone number
    const formattedValue = formatPhoneNumber(numericValue);
    onChangeText(formattedValue);
  };

  return (
    <FormInput
      label={label}
      value={value}
      onChangeText={handleChangeText}
      onBlur={onBlur}
      error={error}
      touched={touched}
      required={required}
      disabled={disabled}
      placeholder={placeholder || '(555) 555-5555'}
      keyboardType="phone-pad"
      testID={testID}
      style={style}
    />
  );
}; 