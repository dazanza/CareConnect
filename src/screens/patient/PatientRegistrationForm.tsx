import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { FormInput } from '../../components/ui/form/FormInput';
import { DatePicker } from '../../components/ui/form/DatePicker';
import { Select } from '../../components/ui/form/Select';
import { useForm } from '../../hooks/useForm';

interface PatientRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string;
}

const initialValues: PatientRegistrationData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  emergencyContact: '',
  medicalHistory: '',
};

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

const validate = (values: PatientRegistrationData) => {
  const errors: Partial<PatientRegistrationData> = {};

  if (!values.firstName) {
    errors.firstName = 'First name is required';
  }

  if (!values.lastName) {
    errors.lastName = 'Last name is required';
  }

  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (!values.phone) {
    errors.phone = 'Phone number is required';
  }

  if (!values.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  }

  if (!values.gender) {
    errors.gender = 'Gender is required';
  }

  return errors;
};

export const PatientRegistrationForm: React.FC = () => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } = useForm({
    initialValues,
    validate,
    onSubmit: async (formValues) => {
      try {
        // TODO: Implement API call to register patient
        console.log('Form submitted:', formValues);
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <FormInput
          label="First Name"
          value={values.firstName}
          onChangeText={handleChange('firstName')}
          onBlur={handleBlur('firstName')}
          error={errors.firstName}
          touched={touched.firstName}
          required
          testID="firstName-input"
        />

        <FormInput
          label="Last Name"
          value={values.lastName}
          onChangeText={handleChange('lastName')}
          onBlur={handleBlur('lastName')}
          error={errors.lastName}
          touched={touched.lastName}
          required
          testID="lastName-input"
        />

        <FormInput
          label="Email"
          value={values.email}
          onChangeText={handleChange('email')}
          onBlur={handleBlur('email')}
          error={errors.email}
          touched={touched.email}
          keyboardType="email-address"
          required
          testID="email-input"
        />

        <FormInput
          label="Phone"
          value={values.phone}
          onChangeText={handleChange('phone')}
          onBlur={handleBlur('phone')}
          error={errors.phone}
          touched={touched.phone}
          keyboardType="phone-pad"
          required
          testID="phone-input"
        />

        <DatePicker
          label="Date of Birth"
          value={values.dateOfBirth}
          onChange={handleChange('dateOfBirth')}
          onBlur={handleBlur('dateOfBirth')}
          error={errors.dateOfBirth}
          touched={touched.dateOfBirth}
          required
          maximumDate={new Date()}
          testID="dateOfBirth-input"
        />

        <Select
          label="Gender"
          value={values.gender}
          onValueChange={handleChange('gender')}
          onBlur={handleBlur('gender')}
          error={errors.gender}
          touched={touched.gender}
          options={genderOptions}
          required
          testID="gender-select"
        />

        <FormInput
          label="Address"
          value={values.address}
          onChangeText={handleChange('address')}
          onBlur={handleBlur('address')}
          multiline
          numberOfLines={3}
          testID="address-input"
        />

        <FormInput
          label="Emergency Contact"
          value={values.emergencyContact}
          onChangeText={handleChange('emergencyContact')}
          onBlur={handleBlur('emergencyContact')}
          placeholder="Name and phone number"
          testID="emergencyContact-input"
        />

        <FormInput
          label="Medical History"
          value={values.medicalHistory}
          onChangeText={handleChange('medicalHistory')}
          onBlur={handleBlur('medicalHistory')}
          multiline
          numberOfLines={4}
          testID="medicalHistory-input"
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.submitButton}
          testID="submit-button"
        >
          Register Patient
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
  },
  submitButton: {
    marginTop: 24,
  },
}); 