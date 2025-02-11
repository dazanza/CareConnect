import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { SearchInput } from '../SearchInput';

jest.useFakeTimers();

describe('SearchInput', () => {
  it('renders correctly with default props', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchInput value="" onChangeText={onChangeText} />
    );

    expect(getByPlaceholderText('Search...')).toBeTruthy();
  });

  it('renders with custom placeholder', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchInput 
        value="" 
        onChangeText={onChangeText} 
        placeholder="Custom search..." 
      />
    );

    expect(getByPlaceholderText('Custom search...')).toBeTruthy();
  });

  it('calls onChangeText with debounce', async () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchInput 
        value="" 
        onChangeText={onChangeText} 
        debounceMs={300} 
      />
    );

    const input = getByPlaceholderText('Search...');
    fireEvent.changeText(input, 'test');

    // Verify that onChangeText hasn't been called yet
    expect(onChangeText).not.toHaveBeenCalled();

    // Fast-forward timers
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    // Verify that onChangeText has been called with the correct value
    expect(onChangeText).toHaveBeenCalledWith('test');
  });

  it('uses testID correctly', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <SearchInput 
        value="" 
        onChangeText={onChangeText} 
        testID="search-input" 
      />
    );

    expect(getByTestId('search-input')).toBeTruthy();
  });
}); 