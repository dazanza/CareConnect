import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Checkbox, Text } from 'react-native-paper';

interface Option {
  label: string;
  value: string;
  children?: Option[];
  disabled?: boolean;
  description?: string;
}

interface CheckboxGroupProps {
  options: Option[];
  value: string[];
  onChange: (values: string[]) => void;
  label?: string;
  error?: string;
  required?: boolean;
  testID?: string;
  disabled?: boolean;
  indentation?: number;
  showSelectAll?: boolean;
  selectAllLabel?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  value,
  onChange,
  label,
  error,
  required,
  testID,
  disabled = false,
  indentation = 24,
  showSelectAll = false,
  selectAllLabel = 'Select All',
}) => {
  const getAllValues = (opts: Option[]): string[] => {
    return opts.reduce((acc: string[], option) => {
      acc.push(option.value);
      if (option.children) {
        acc.push(...getAllValues(option.children));
      }
      return acc;
    }, []);
  };

  const getSelectableValues = (opts: Option[]): string[] => {
    return opts.reduce((acc: string[], option) => {
      if (!option.disabled) {
        acc.push(option.value);
        if (option.children) {
          acc.push(...getSelectableValues(option.children));
        }
      }
      return acc;
    }, []);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    
    const allValues = getSelectableValues(options);
    const allSelected = allValues.every(v => value.includes(v));
    
    if (allSelected) {
      onChange([]);
    } else {
      onChange(allValues);
    }
  };

  const getOptionState = (option: Option, parentSelected = false): 'checked' | 'unchecked' | 'indeterminate' => {
    if (option.children) {
      const selectableChildren = option.children.filter(child => !child.disabled);
      const selectedChildren = selectableChildren.filter(child => value.includes(child.value));
      
      if (selectedChildren.length === 0) return 'unchecked';
      if (selectedChildren.length === selectableChildren.length) return 'checked';
      return 'indeterminate';
    }

    return value.includes(option.value) ? 'checked' : 'unchecked';
  };

  const handleToggle = (option: Option) => {
    if (disabled || option.disabled) return;

    let newValues = [...value];
    const isChecked = value.includes(option.value);

    if (option.children) {
      const childValues = getAllValues([option]);
      if (isChecked) {
        newValues = newValues.filter(v => !childValues.includes(v));
      } else {
        const selectableChildren = childValues.filter(v => 
          !options.find(o => o.value === v)?.disabled
        );
        newValues = [...new Set([...newValues, ...selectableChildren])];
      }
    } else {
      if (isChecked) {
        newValues = newValues.filter(v => v !== option.value);
      } else {
        newValues.push(option.value);
      }
    }
    
    onChange(newValues);
  };

  const renderOption = (option: Option, level = 0) => {
    const marginLeft = level * indentation;
    const state = getOptionState(option);

    return (
      <React.Fragment key={option.value}>
        <View 
          style={[
            styles.optionRow,
            { marginLeft },
          ]}
        >
          <Checkbox.Android
            status={state}
            onPress={() => handleToggle(option)}
            disabled={disabled || option.disabled}
            testID={`${testID}-option-${option.value}`}
          />
          <View style={styles.optionContent}>
            <Text
              onPress={() => handleToggle(option)}
              style={[
                styles.optionLabel,
                (disabled || option.disabled) && styles.disabledText
              ]}
            >
              {option.label}
            </Text>
            {option.description && (
              <Text style={styles.optionDescription}>
                {option.description}
              </Text>
            )}
          </View>
        </View>
        {option.children?.map(child => renderOption(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <View testID={testID}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={styles.optionsContainer}>
        {showSelectAll && options.length > 0 && (
          <>
            <View style={styles.optionRow}>
              <Checkbox.Android
                status={
                  value.length === 0
                    ? 'unchecked'
                    : value.length === getSelectableValues(options).length
                    ? 'checked'
                    : 'indeterminate'
                }
                onPress={handleSelectAll}
                disabled={disabled}
                testID={`${testID}-select-all`}
              />
              <Text
                onPress={handleSelectAll}
                style={[
                  styles.optionLabel,
                  disabled && styles.disabledText
                ]}
              >
                {selectAllLabel}
              </Text>
            </View>
            <View style={styles.divider} />
          </>
        )}
        {options.map(option => renderOption(option))}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  required: {
    color: '#E53935',
  },
  optionsContainer: {
    marginTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  optionContent: {
    flex: 1,
    marginLeft: 8,
  },
  optionLabel: {
    fontSize: 14,
  },
  optionDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  disabledText: {
    opacity: 0.5,
  },
  error: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
}); 