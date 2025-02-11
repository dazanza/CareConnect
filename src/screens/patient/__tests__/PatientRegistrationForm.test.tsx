import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PatientRegistrationForm } from '../PatientRegistrationForm';

describe('PatientRegistrationForm', () => {
  it('renders all form fields', () => {
    const { getByText, getByTestId } = render(<PatientRegistrationForm />);

    // Check for field labels
    expect(getByText('First Name')).toBeTruthy();
    expect(getByText('Last Name')).toBeTruthy();
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Phone')).toBeTruthy();
    expect(getByText('Date of Birth')).toBeTruthy();
    expect(getByText('Gender')).toBeTruthy();
    expect(getByText('Address')).toBeTruthy();
    expect(getByText('Emergency Contact')).toBeTruthy();
    expect(getByText('Medical History')).toBeTruthy();
  });

  it('shows validation errors for required fields', async () => {
    const { getByText, getByTestId } = render(<PatientRegistrationForm />);

    // Try to submit empty form
    fireEvent.press(getByText('Register Patient'));

    // Wait for validation errors
    await waitFor(() => {
      expect(getByText('First name is required')).toBeTruthy();
      expect(getByText('Last name is required')).toBeTruthy();
      expect(getByText('Email is required')).toBeTruthy();
      expect(getByText('Phone number is required')).toBeTruthy();
      expect(getByText('Date of birth is required')).toBeTruthy();
      expect(getByText('Gender is required')).toBeTruthy();
    });
  });

  it('validates email format', async () => {
    const { getByText, getByTestId } = render(<PatientRegistrationForm />);

    // Enter invalid email
    const emailInput = getByTestId('email-input');
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent(emailInput, 'blur');

    // Check for email validation error
    await waitFor(() => {
      expect(getByText('Invalid email address')).toBeTruthy();
    });

    // Enter valid email
    fireEvent.changeText(emailInput, 'valid@email.com');
    fireEvent(emailInput, 'blur');

    // Check that error is gone
    await waitFor(() => {
      expect(() => getByText('Invalid email address')).toThrow();
    });
  });

  it('allows form submission with valid data', async () => {
    const { getByText, getByTestId } = render(<PatientRegistrationForm />);

    // Fill in required fields
    fireEvent.changeText(getByTestId('firstName-input'), 'John');
    fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
    fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
    fireEvent.changeText(getByTestId('phone-input'), '1234567890');
    
    // Select gender
    fireEvent.press(getByTestId('gender-select'));
    fireEvent.press(getByText('Male'));

    // Select date of birth (this might need to be mocked depending on implementation)
    const dateInput = getByTestId('dateOfBirth-input');
    fireEvent.press(dateInput);
    // Mock date selection...

    // Submit form
    fireEvent.press(getByText('Register Patient'));

    // Check that no validation errors are shown
    await waitFor(() => {
      expect(() => getByText('First name is required')).toThrow();
      expect(() => getByText('Last name is required')).toThrow();
      expect(() => getByText('Email is required')).toThrow();
      expect(() => getByText('Phone number is required')).toThrow();
      expect(() => getByText('Date of birth is required')).toThrow();
      expect(() => getByText('Gender is required')).toThrow();
    });
  });

  it('disables submit button while submitting', async () => {
    const { getByText, getByTestId } = render(<PatientRegistrationForm />);

    // Fill in required fields
    fireEvent.changeText(getByTestId('firstName-input'), 'John');
    fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
    fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
    fireEvent.changeText(getByTestId('phone-input'), '1234567890');
    
    // Submit form
    const submitButton = getByText('Register Patient');
    fireEvent.press(submitButton);

    // Check button is disabled
    await waitFor(() => {
      expect(submitButton.props.disabled).toBe(true);
    });
  });

  it('handles optional fields correctly', async () => {
    const { getByText, getByTestId } = render(<PatientRegistrationForm />);

    // Fill in only required fields
    fireEvent.changeText(getByTestId('firstName-input'), 'John');
    fireEvent.changeText(getByTestId('lastName-input'), 'Doe');
    fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
    fireEvent.changeText(getByTestId('phone-input'), '1234567890');
    
    // Select gender
    fireEvent.press(getByTestId('gender-select'));
    fireEvent.press(getByText('Male'));

    // Select date of birth
    const dateInput = getByTestId('dateOfBirth-input');
    fireEvent.press(dateInput);
    // Mock date selection...

    // Submit form without optional fields
    fireEvent.press(getByText('Register Patient'));

    // Check that form submits successfully
    await waitFor(() => {
      expect(() => getByText('First name is required')).toThrow();
      expect(() => getByText('Last name is required')).toThrow();
      expect(() => getByText('Email is required')).toThrow();
      expect(() => getByText('Phone number is required')).toThrow();
    });
  });
}); 