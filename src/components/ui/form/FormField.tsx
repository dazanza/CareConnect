import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from 'react-native-paper';

interface FormFieldProps {
  label: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  disabled?: boolean;
  style?: any;
  testID?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  touched,
  required,
  disabled,
  style,
  testID,
  children,
}) => {
  const theme = useTheme();
  const shakeAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (error && touched) {
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error, touched]);

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.labelContainer}>
        <Text style={[
          styles.label,
          disabled && styles.disabledLabel,
          { color: theme.colors.onSurface }
        ]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      </View>
      
      <Animated.View
        style={[
          styles.inputContainer,
          { transform: [{ translateX: shakeAnimation }] }
        ]}
      >
        {children}
      </Animated.View>
      
      {error && touched && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  required: {
    color: 'red',
  },
  disabledLabel: {
    opacity: 0.5,
  },
  inputContainer: {
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
}); 