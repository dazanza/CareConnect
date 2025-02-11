import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RadioGroup } from '../RadioGroup';

const mockOptions = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
  { label: 'Option 3', value: 'opt3' },
];

describe('RadioGroup', () => {
  it('renders all options correctly', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <RadioGroup
        options={mockOptions}
        value="opt1"
        onChange={onChange}
        label="Test Group"
      />
    );

    mockOptions.forEach(option => {
      expect(getByText(option.label)).toBeTruthy();
    });
    expect(getByText('Test Group')).toBeTruthy();
  });

  it('shows selected option', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <RadioGroup
        options={mockOptions}
        value="opt2"
        onChange={onChange}
        testID="radio-group"
      />
    );

    const selectedRadio = getByTestId('radio-group-option-opt2');
    expect(selectedRadio).toHaveProp('value', 'opt2');
    expect(selectedRadio).toHaveProp('status', 'checked');
  });

  it('handles option selection correctly', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <RadioGroup
        options={mockOptions}
        value="opt1"
        onChange={onChange}
      />
    );

    fireEvent.press(getByText('Option 2'));
    expect(onChange).toHaveBeenCalledWith('opt2');
  });

  it('displays required asterisk when required prop is true', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <RadioGroup
        options={mockOptions}
        value="opt1"
        onChange={onChange}
        label="Test Group"
        required
      />
    );

    expect(getByText('*')).toBeTruthy();
  });

  it('displays error message when error prop is provided', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <RadioGroup
        options={mockOptions}
        value="opt1"
        onChange={onChange}
        error="Please select an option"
      />
    );

    expect(getByText('Please select an option')).toBeTruthy();
  });

  it('disables all radio buttons when disabled prop is true', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <RadioGroup
        options={mockOptions}
        value="opt1"
        onChange={onChange}
        testID="radio-group"
        disabled
      />
    );

    mockOptions.forEach(option => {
      expect(getByTestId(`radio-group-option-${option.value}`)).toHaveProp('disabled', true);
    });
  });

  it('does not call onChange when disabled', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <RadioGroup
        options={mockOptions}
        value="opt1"
        onChange={onChange}
        disabled
      />
    );

    fireEvent.press(getByText('Option 2'));
    expect(onChange).not.toHaveBeenCalled();
  });
}); 