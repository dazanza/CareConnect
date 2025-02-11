import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DatePicker } from '../DatePicker';
import { Platform } from 'react-native';

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(),
}));

describe('DatePicker', () => {
  const mockOnChange = jest.fn();
  const mockOnBlur = jest.fn();

  const defaultProps = {
    label: 'Test Date',
    value: '2024-02-11',
    onChange: mockOnChange,
    onBlur: mockOnBlur,
    testID: 'test-date-picker',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with required props', () => {
    const { getByText, getByTestId } = render(<DatePicker {...defaultProps} />);

    expect(getByText('Test Date')).toBeTruthy();
    expect(getByTestId('test-date-picker')).toBeTruthy();
  });

  it('shows formatted date in the input', () => {
    const { getByText } = render(<DatePicker {...defaultProps} />);
    expect(getByText('February 11, 2024')).toBeTruthy();
  });

  it('shows error message when error prop is provided and touched is true', () => {
    const { getByText } = render(
      <DatePicker
        {...defaultProps}
        error="Date is required"
        touched={true}
      />
    );

    expect(getByText('Date is required')).toBeTruthy();
  });

  it('does not show error message when touched is false', () => {
    const { queryByText } = render(
      <DatePicker
        {...defaultProps}
        error="Date is required"
        touched={false}
      />
    );

    expect(queryByText('Date is required')).toBeNull();
  });

  it('shows required asterisk when required prop is true', () => {
    const { getByText } = render(
      <DatePicker {...defaultProps} required={true} />
    );

    expect(getByText('*')).toBeTruthy();
  });

  it('disables input when disabled prop is true', () => {
    const { getByTestId } = render(
      <DatePicker {...defaultProps} disabled={true} />
    );

    const input = getByTestId('test-date-picker');
    expect(input.props.disabled).toBe(true);
  });

  it('opens date picker when input is pressed', () => {
    Platform.OS = 'ios';
    const { getByTestId } = render(<DatePicker {...defaultProps} />);

    fireEvent.press(getByTestId('test-date-picker'));
    expect(getByTestId('test-date-picker-picker')).toBeTruthy();
  });

  it('calls onChange when date is selected', () => {
    Platform.OS = 'ios';
    const { getByTestId } = render(<DatePicker {...defaultProps} />);

    fireEvent.press(getByTestId('test-date-picker'));
    const datePicker = getByTestId('test-date-picker-picker');
    
    const newDate = new Date('2024-02-12');
    fireEvent(datePicker, 'onChange', { nativeEvent: { timestamp: newDate.getTime() } });
    
    expect(mockOnChange).toHaveBeenCalledWith('2024-02-12');
  });

  it('respects maximum date constraint', () => {
    const maxDate = new Date('2024-02-15');
    const { getByTestId } = render(
      <DatePicker {...defaultProps} maximumDate={maxDate} />
    );

    fireEvent.press(getByTestId('test-date-picker'));
    const datePicker = getByTestId('test-date-picker-picker');
    
    expect(datePicker.props.maximumDate).toBe(maxDate);
  });

  it('respects minimum date constraint', () => {
    const minDate = new Date('2024-02-01');
    const { getByTestId } = render(
      <DatePicker {...defaultProps} minimumDate={minDate} />
    );

    fireEvent.press(getByTestId('test-date-picker'));
    const datePicker = getByTestId('test-date-picker-picker');
    
    expect(datePicker.props.minimumDate).toBe(minDate);
  });

  it('calls onBlur when picker is closed', () => {
    Platform.OS = 'ios';
    const { getByTestId } = render(<DatePicker {...defaultProps} />);

    fireEvent.press(getByTestId('test-date-picker'));
    const datePicker = getByTestId('test-date-picker-picker');
    
    // Simulate picker dismiss
    fireEvent(datePicker, 'blur');
    
    expect(mockOnBlur).toHaveBeenCalled();
  });
}); 