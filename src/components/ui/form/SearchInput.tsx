import React from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import debounce from 'lodash/debounce';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  debounceMs?: number;
  testID?: string;
  style?: any;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  debounceMs = 300,
  testID,
  style,
}) => {
  // Create a debounced version of onChangeText
  const debouncedSearch = React.useMemo(
    () => debounce(onChangeText, debounceMs),
    [onChangeText, debounceMs]
  );

  // Cancel debounced call on unmount
  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleChangeText = (text: string) => {
    debouncedSearch(text);
  };

  return (
    <Searchbar
      placeholder={placeholder}
      onChangeText={handleChangeText}
      value={value}
      style={[styles.searchBar, style]}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  searchBar: {
    elevation: 2,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
}); 