import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Select } from '../Select';

describe('Select', () => {
  const mockOnValueChange = jest.fn();
  const mockOnBlur = jest.fn();

  const options = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ];

  const defaultProps = {
    label: 'Test Select',
    value: '',
    onValueChange: mockOnValueChange,
    onBlur: mockOnBlur,
    options,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with required props', () => {
    const { getByText, getByTestId } = render(
      <Select {...defaultProps} testID="test-select" />
    );

    expect(getByText('Test Select')).toBeTruthy();
    expect(getByTestId('test-select')).toBeTruthy();
  });

  it('shows placeholder when no value is selected', () => {
    const { getByText } = render(
      <Select {...defaultProps} placeholder="Choose an option" />
    );

    expect(getByText('Choose an option')).toBeTruthy();
  });

  it('shows selected value label', () => {
    const { getByText } = render(
      <Select {...defaultProps} value="option1" />
    );

    expect(getByText('Option 1')).toBeTruthy();
  });

  it('shows error message when error prop is provided and touched is true', () => {
    const { getByText } = render(
      <Select
        {...defaultProps}
        error="This field is required"
        touched={true}
      />
    );

    expect(getByText('This field is required')).toBeTruthy();
  });

  it('does not show error message when touched is false', () => {
    const { queryByText } = render(
      <Select
        {...defaultProps}
        error="This field is required"
        touched={false}
      />
    );

    expect(queryByText('This field is required')).toBeNull();
  });

  it('shows required asterisk when required prop is true', () => {
    const { getByText } = render(
      <Select {...defaultProps} required={true} />
    );

    expect(getByText('*')).toBeTruthy();
  });

  it('disables select when disabled prop is true', () => {
    const { getByTestId } = render(
      <Select {...defaultProps} disabled={true} testID="test-select" />
    );

    const select = getByTestId('test-select');
    expect(select.props.disabled).toBe(true);
  });

  it('opens menu when pressed', () => {
    const { getByTestId, getByText } = render(
      <Select {...defaultProps} testID="test-select" />
    );

    fireEvent.press(getByTestId('test-select'));
    options.forEach(option => {
      expect(getByText(option.label)).toBeTruthy();
    });
  });

  it('calls onValueChange when an option is selected', () => {
    const { getByTestId, getByText } = render(
      <Select {...defaultProps} testID="test-select" />
    );

    fireEvent.press(getByTestId('test-select'));
    fireEvent.press(getByText('Option 1'));

    expect(mockOnValueChange).toHaveBeenCalledWith('option1');
  });

  it('calls onBlur when menu is closed', () => {
    const { getByTestId } = render(
      <Select {...defaultProps} testID="test-select" />
    );

    fireEvent.press(getByTestId('test-select'));
    // Simulate menu dismiss
    fireEvent(getByTestId('test-select'), 'blur');

    expect(mockOnBlur).toHaveBeenCalled();
  });
}); 