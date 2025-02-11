import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CheckboxGroup } from '../CheckboxGroup';

const mockOptions = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
  { label: 'Option 3', value: 'opt3' },
];

describe('CheckboxGroup', () => {
  it('renders all options correctly', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <CheckboxGroup
        options={mockOptions}
        value={[]}
        onChange={onChange}
        label="Test Group"
      />
    );

    mockOptions.forEach(option => {
      expect(getByText(option.label)).toBeTruthy();
    });
    expect(getByText('Test Group')).toBeTruthy();
  });

  it('shows selected options', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <CheckboxGroup
        options={mockOptions}
        value={['opt1', 'opt3']}
        onChange={onChange}
        testID="checkbox-group"
      />
    );

    expect(getByTestId('checkbox-group-option-opt1')).toHaveProp('status', 'checked');
    expect(getByTestId('checkbox-group-option-opt2')).toHaveProp('status', 'unchecked');
    expect(getByTestId('checkbox-group-option-opt3')).toHaveProp('status', 'checked');
  });

  it('handles option selection correctly', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <CheckboxGroup
        options={mockOptions}
        value={['opt1']}
        onChange={onChange}
      />
    );

    fireEvent.press(getByText('Option 2'));
    expect(onChange).toHaveBeenCalledWith(['opt1', 'opt2']);
  });

  it('handles option deselection correctly', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <CheckboxGroup
        options={mockOptions}
        value={['opt1', 'opt2']}
        onChange={onChange}
      />
    );

    fireEvent.press(getByText('Option 1'));
    expect(onChange).toHaveBeenCalledWith(['opt2']);
  });

  it('displays required asterisk when required prop is true', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <CheckboxGroup
        options={mockOptions}
        value={[]}
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
      <CheckboxGroup
        options={mockOptions}
        value={[]}
        onChange={onChange}
        error="This field is required"
      />
    );

    expect(getByText('This field is required')).toBeTruthy();
  });

  it('disables all checkboxes when disabled prop is true', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <CheckboxGroup
        options={mockOptions}
        value={[]}
        onChange={onChange}
        testID="checkbox-group"
        disabled
      />
    );

    mockOptions.forEach(option => {
      expect(getByTestId(`checkbox-group-option-${option.value}`)).toHaveProp('disabled', true);
    });
  });

  it('does not call onChange when disabled', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <CheckboxGroup
        options={mockOptions}
        value={[]}
        onChange={onChange}
        disabled
      />
    );

    fireEvent.press(getByText('Option 1'));
    expect(onChange).not.toHaveBeenCalled();
  });
}); 