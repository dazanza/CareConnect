import React from 'react';
import { render } from '@testing-library/react-native';
import { FormField } from '../FormField';
import { Text } from 'react-native';

describe('FormField', () => {
  const defaultProps = {
    label: 'Test Field',
    children: <Text>Test Content</Text>,
  };

  it('renders correctly with required props', () => {
    const { getByText } = render(<FormField {...defaultProps} />);
    expect(getByText('Test Field')).toBeTruthy();
    expect(getByText('Test Content')).toBeTruthy();
  });

  it('shows required asterisk when required prop is true', () => {
    const { getByText } = render(
      <FormField {...defaultProps} required={true} />
    );
    expect(getByText('*')).toBeTruthy();
  });

  it('shows error message when error prop is provided and touched is true', () => {
    const { getByText } = render(
      <FormField
        {...defaultProps}
        error="This field is required"
        touched={true}
      />
    );
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('does not show error message when touched is false', () => {
    const { queryByText } = render(
      <FormField
        {...defaultProps}
        error="This field is required"
        touched={false}
      />
    );
    expect(queryByText('This field is required')).toBeNull();
  });

  it('applies disabled styles when disabled prop is true', () => {
    const { getByText } = render(
      <FormField {...defaultProps} disabled={true} />
    );
    const label = getByText('Test Field');
    expect(label.props.style).toContainEqual(
      expect.objectContaining({ opacity: 0.5 })
    );
  });

  it('applies custom styles when style prop is provided', () => {
    const customStyle = { marginBottom: 20 };
    const { container } = render(
      <FormField {...defaultProps} style={customStyle} />
    );
    expect(container.props.style).toContainEqual(customStyle);
  });

  it('triggers shake animation when error appears', () => {
    const { rerender, getByTestId } = render(
      <FormField {...defaultProps} testID="form-field" />
    );

    rerender(
      <FormField
        {...defaultProps}
        testID="form-field"
        error="Error"
        touched={true}
      />
    );

    const formField = getByTestId('form-field');
    expect(formField.props.style).toContainEqual(
      expect.objectContaining({
        transform: [{ translateX: expect.any(Object) }],
      })
    );
  });
}); 