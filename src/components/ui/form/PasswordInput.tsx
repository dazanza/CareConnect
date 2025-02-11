import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FormInput } from './FormInput';
import { IconButton, Text, ProgressBar, List } from 'react-native-paper';

interface PasswordRequirement {
  label: string;
  validator: (password: string) => boolean;
  description?: string;
}

interface PasswordInputProps {
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
  showStrengthIndicator?: boolean;
  showRequirements?: boolean;
  customRequirements?: PasswordRequirement[];
  strengthLabels?: string[];
  minStrength?: number;
  onStrengthChange?: (strength: number) => void;
}

const defaultRequirements: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    validator: (password: string) => password.length >= 8,
    description: 'Password must be at least 8 characters long',
  },
  {
    label: 'Contains uppercase letter',
    validator: (password: string) => /[A-Z]/.test(password),
    description: 'Include at least one uppercase letter',
  },
  {
    label: 'Contains lowercase letter',
    validator: (password: string) => /[a-z]/.test(password),
    description: 'Include at least one lowercase letter',
  },
  {
    label: 'Contains number',
    validator: (password: string) => /\d/.test(password),
    description: 'Include at least one number',
  },
  {
    label: 'Contains special character',
    validator: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    description: 'Include at least one special character',
  },
];

const defaultStrengthLabels = [
  'Very Weak',
  'Weak',
  'Fair',
  'Good',
  'Strong',
];

export const PasswordInput: React.FC<PasswordInputProps> = ({
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
  showStrengthIndicator = true,
  showRequirements = true,
  customRequirements,
  strengthLabels = defaultStrengthLabels,
  minStrength = 3,
  onStrengthChange,
}) => {
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);
  const [localError, setLocalError] = React.useState<string | undefined>();

  const requirements = customRequirements || defaultRequirements;

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const calculateStrength = (password: string): number => {
    if (!password) return 0;

    let score = 0;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
      password.length >= 12,
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/.test(password),
    ];

    score = checks.filter(Boolean).length;
    return Math.min(Math.floor((score / checks.length) * strengthLabels.length), strengthLabels.length - 1);
  };

  const getStrengthColor = (strength: number): string => {
    const colors = ['#ef4444', '#f59e0b', '#fbbf24', '#34d399', '#10b981'];
    return colors[strength] || colors[0];
  };

  const handleChange = (text: string) => {
    onChangeText(text);
    
    const strength = calculateStrength(text);
    onStrengthChange?.(strength);

    if (text && strength < minStrength) {
      setLocalError('Password is not strong enough');
    } else {
      setLocalError(undefined);
    }
  };

  const strength = calculateStrength(value);
  const strengthColor = getStrengthColor(strength);
  const strengthLabel = strengthLabels[strength];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <FormInput
          label={label}
          value={value}
          onChangeText={handleChange}
          onBlur={onBlur}
          error={localError || error}
          touched={touched}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          testID={testID}
          style={styles.input}
        />
        <IconButton
          icon={secureTextEntry ? 'eye' : 'eye-off'}
          onPress={toggleSecureEntry}
          style={styles.icon}
          testID={`${testID}-toggle`}
        />
      </View>

      {showStrengthIndicator && value && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthHeader}>
            <Text variant="bodySmall">Password Strength:</Text>
            <Text
              variant="bodySmall"
              style={{ color: strengthColor }}
            >
              {strengthLabel}
            </Text>
          </View>
          <ProgressBar
            progress={(strength + 1) / strengthLabels.length}
            color={strengthColor}
            style={styles.strengthBar}
          />
        </View>
      )}

      {showRequirements && (
        <View style={styles.requirementsContainer}>
          {requirements.map((req, index) => {
            const isValid = req.validator(value);
            return (
              <List.Item
                key={index}
                title={req.label}
                description={req.description}
                left={props => (
                  <List.Icon
                    {...props}
                    icon={isValid ? 'check-circle' : 'circle-outline'}
                    color={isValid ? '#10b981' : '#9ca3af'}
                  />
                )}
                titleStyle={[
                  styles.requirementTitle,
                  isValid && styles.validRequirement,
                ]}
                descriptionStyle={styles.requirementDescription}
              />
            );
          })}
        </View>
      )}
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
    paddingRight: 44,
  },
  icon: {
    position: 'absolute',
    right: 0,
    top: 8,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
  },
  requirementsContainer: {
    marginTop: 8,
  },
  requirementTitle: {
    fontSize: 14,
  },
  requirementDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  validRequirement: {
    color: '#10b981',
  },
}); 