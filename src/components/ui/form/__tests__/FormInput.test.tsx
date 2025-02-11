import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FormInput } from '../FormInput';

describe('FormInput', () => {
  const mockOnChangeText = jest.fn();
  const mockOnBlur = jest.fn();

  const defaultProps = {
    label: 'Test Input',
    value: '',
    onChangeText: mockOnChangeText,
    onBlur: mockOnBlur,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with required props', () => {
    const { getByText, getByTestId } = render(
      <FormInput {...defaultProps} testID="test-input" />
    );

    expect(getByText('Test Input')).toBeTruthy();
    expect(getByTestId('test-input')).toBeTruthy();
  });

  it('shows error message when error prop is provided and touched is true', () => {
    const { getByText } = render(
      <FormInput
        {...defaultProps}
        error="This field is required"
        touched={true}
      />
    );

    expect(getByText('This field is required')).toBeTruthy();
  });

  it('does not show error message when touched is false', () => {
    const { queryByText } = render(
      <FormInput
        {...defaultProps}
        error="This field is required"
        touched={false}
      />
    );

    expect(queryByText('This field is required')).toBeNull();
  });

  it('calls onChangeText when text is entered', () => {
    const { getByTestId } = render(
      <FormInput {...defaultProps} testID="test-input" />
    );

    fireEvent.changeText(getByTestId('test-input'), 'test value');
    expect(mockOnChangeText).toHaveBeenCalledWith('test value');
  });

  it('calls onBlur when input loses focus', () => {
    const { getByTestId } = render(
      <FormInput {...defaultProps} testID="test-input" />
    );

    fireEvent(getByTestId('test-input'), 'blur');
    expect(mockOnBlur).toHaveBeenCalled();
  });

  it('shows required asterisk when required prop is true', () => {
    const { getByText } = render(
      <FormInput {...defaultProps} required={true} />
    );

    expect(getByText('*')).toBeTruthy();
  });

  it('disables input when disabled prop is true', () => {
    const { getByTestId } = render(
      <FormInput {...defaultProps} disabled={true} testID="test-input" />
    );

    expect(getByTestId('test-input').props.disabled).toBe(true);
  });
}); 