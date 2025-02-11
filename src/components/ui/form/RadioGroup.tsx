import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RadioButton, Text, useTheme } from 'react-native-paper';
import { FormField } from './FormField';

interface Option {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
  icon?: string;
  color?: string;
}

interface RadioGroupProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  testID?: string;
  disabled?: boolean;
  direction?: 'vertical' | 'horizontal';
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'card';
  showBorder?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  label,
  error,
  required,
  testID,
  disabled = false,
  direction = 'vertical',
  size = 'medium',
  variant = 'default',
  showBorder = false,
}) => {
  const theme = useTheme();

  const handleChange = (newValue: string) => {
    if (disabled) return;
    onChange(newValue);
  };

  const getOptionSize = () => {
    switch (size) {
      case 'small':
        return {
          radio: 20,
          text: 14,
          description: 12,
          spacing: 4,
        };
      case 'large':
        return {
          radio: 28,
          text: 18,
          description: 14,
          spacing: 8,
        };
      default:
        return {
          radio: 24,
          text: 16,
          description: 13,
          spacing: 6,
        };
    }
  };

  const optionSize = getOptionSize();

  const renderOption = (option: Option) => {
    const isSelected = value === option.value;
    const optionColor = option.color || theme.colors.primary;

    return (
      <View
        key={option.value}
        style={[
          styles.optionContainer,
          variant === 'card' && styles.cardOption,
          showBorder && styles.borderedOption,
          direction === 'horizontal' && styles.horizontalOption,
          isSelected && variant === 'card' && {
            borderColor: optionColor,
            backgroundColor: `${optionColor}10`,
          },
        ]}
      >
        <View style={styles.optionContent}>
          <View style={styles.radioContainer}>
            <RadioButton.Android
              value={option.value}
              disabled={disabled || option.disabled}
              testID={`${testID}-option-${option.value}`}
              color={optionColor}
              status={isSelected ? 'checked' : 'unchecked'}
            />
            <View style={styles.labelContainer}>
              <Text
                style={[
                  styles.label,
                  { fontSize: optionSize.text },
                  (disabled || option.disabled) && styles.disabledText,
                  isSelected && { color: optionColor },
                ]}
                onPress={() => handleChange(option.value)}
              >
                {option.label}
              </Text>
              {option.description && (
                <Text
                  style={[
                    styles.description,
                    { fontSize: optionSize.description },
                    (disabled || option.disabled) && styles.disabledText,
                  ]}
                >
                  {option.description}
                </Text>
              )}
            </View>
          </View>
          {option.icon && (
            <RadioButton.Icon
              icon={option.icon}
              size={optionSize.radio}
              color={isSelected ? optionColor : theme.colors.onSurfaceDisabled}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <FormField
      label={label}
      error={error}
      required={required}
      disabled={disabled}
      testID={testID}
    >
      <RadioButton.Group onValueChange={handleChange} value={value}>
        <View
          style={[
            styles.optionsContainer,
            direction === 'horizontal' && styles.horizontalContainer,
          ]}
        >
          {options.map(renderOption)}
        </View>
      </RadioButton.Group>
    </FormField>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    marginTop: 4,
  },
  horizontalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionContainer: {
    marginBottom: 8,
  },
  horizontalOption: {
    flex: 1,
    minWidth: 150,
    marginBottom: 0,
  },
  cardOption: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
    padding: 12,
  },
  borderedOption: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  labelContainer: {
    flex: 1,
    marginLeft: 8,
  },
  label: {
    fontWeight: '500',
  },
  description: {
    color: '#6b7280',
    marginTop: 2,
  },
  disabledText: {
    opacity: 0.5,
  },
}); 