import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { List, Menu, Searchbar, Text, Divider } from 'react-native-paper';
import { FormField } from './FormField';

interface SelectOption {
  label: string;
  value: string;
  group?: string;
  disabled?: boolean;
}

interface SelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  disabled?: boolean;
  options: SelectOption[];
  placeholder?: string;
  testID?: string;
  style?: any;
  searchable?: boolean;
  searchPlaceholder?: string;
  maxHeight?: number;
  showGroups?: boolean;
  emptyResultText?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onValueChange,
  onBlur,
  error,
  touched,
  required,
  disabled,
  options,
  placeholder,
  testID,
  style,
  searchable = false,
  searchPlaceholder = 'Search...',
  maxHeight = 300,
  showGroups = false,
  emptyResultText = 'No options found',
}) => {
  const [visible, setVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLabel, setSelectedLabel] = React.useState('');

  React.useEffect(() => {
    const option = options.find(opt => opt.value === value);
    setSelectedLabel(option?.label || '');
  }, [value, options]);

  const openMenu = () => setVisible(true);
  const closeMenu = () => {
    setVisible(false);
    setSearchQuery('');
    onBlur?.();
  };

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    closeMenu();
  };

  const filteredOptions = React.useMemo(() => {
    let filtered = options;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = options.filter(option => 
        option.label.toLowerCase().includes(query) ||
        option.group?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [options, searchQuery]);

  const groupedOptions = React.useMemo(() => {
    if (!showGroups) return { undefined: filteredOptions };
    
    return filteredOptions.reduce((acc, option) => {
      const group = option.group || 'Other';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(option);
      return acc;
    }, {} as Record<string, SelectOption[]>);
  }, [filteredOptions, showGroups]);

  const renderOptions = () => {
    if (filteredOptions.length === 0) {
      return (
        <Menu.Item
          title={emptyResultText}
          disabled
        />
      );
    }

    return Object.entries(groupedOptions).map(([group, groupOptions]) => (
      <React.Fragment key={group}>
        {showGroups && group !== 'undefined' && (
          <>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{group}</Text>
            </View>
            <Divider />
          </>
        )}
        {groupOptions.map(option => (
          <Menu.Item
            key={option.value}
            onPress={() => handleSelect(option.value)}
            title={option.label}
            disabled={option.disabled}
          />
        ))}
        {showGroups && <Divider />}
      </React.Fragment>
    ));
  };

  return (
    <FormField
      label={label}
      error={error}
      touched={touched}
      required={required}
      disabled={disabled}
      style={style}
    >
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <List.Item
            title={selectedLabel || placeholder || 'Select...'}
            onPress={openMenu}
            disabled={disabled}
            right={props => <List.Icon {...props} icon="chevron-down" />}
            style={styles.input}
            titleStyle={[
              styles.title,
              !selectedLabel && styles.placeholder,
              disabled && styles.disabled,
            ]}
            testID={testID}
          />
        }
        contentStyle={[styles.menuContent, { maxHeight }]}
      >
        {searchable && (
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder={searchPlaceholder}
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
          </View>
        )}
        <ScrollView>
          {renderOptions()}
        </ScrollView>
      </Menu>
    </FormField>
  );
};

const styles = StyleSheet.create({
  input: {
    paddingLeft: 0,
  },
  title: {
    fontSize: 16,
  },
  placeholder: {
    color: '#9ca3af',
  },
  disabled: {
    opacity: 0.5,
  },
  menuContent: {
    marginTop: 8,
  },
  searchContainer: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f9fafb',
  },
  groupHeader: {
    padding: 8,
    backgroundColor: '#f9fafb',
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
}); 