import React from 'react';
import { Platform, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FormInput } from './FormInput';
import { format, isValid, isBefore, isAfter } from 'date-fns';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  disabled?: boolean;
  maximumDate?: Date;
  minimumDate?: Date;
  testID?: string;
  style?: any;
  format?: string;
  mode?: 'date' | 'time' | 'datetime';
  is24Hour?: boolean;
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
  timeZoneOffsetInMinutes?: number;
  locale?: string;
  validateDate?: (date: Date) => string | undefined;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required,
  disabled,
  maximumDate,
  minimumDate,
  testID,
  style,
  format: dateFormat = 'MMMM d, yyyy',
  mode = 'date',
  is24Hour = false,
  minuteInterval = 1,
  timeZoneOffsetInMinutes,
  locale,
  validateDate,
}) => {
  const [show, setShow] = React.useState(false);
  const [date, setDate] = React.useState<Date>(() => {
    return value ? new Date(value) : new Date();
  });
  const [localError, setLocalError] = React.useState<string | undefined>();

  const validateSelectedDate = (selectedDate: Date): string | undefined => {
    if (!isValid(selectedDate)) {
      return 'Invalid date';
    }

    if (minimumDate && isBefore(selectedDate, minimumDate)) {
      return `Date must be after ${format(minimumDate, dateFormat)}`;
    }

    if (maximumDate && isAfter(selectedDate, maximumDate)) {
      return `Date must be before ${format(maximumDate, dateFormat)}`;
    }

    return validateDate?.(selectedDate);
  };

  const handleChange = (_: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
    
    const validationError = validateSelectedDate(currentDate);
    setLocalError(validationError);
    
    if (!validationError) {
      onChange(format(currentDate, 'yyyy-MM-dd'));
    }
  };

  const showDatepicker = () => {
    if (!disabled) {
      setShow(true);
    }
  };

  const formattedValue = value ? format(new Date(value), dateFormat) : '';

  return (
    <>
      <Pressable onPress={showDatepicker} disabled={disabled}>
        <FormInput
          label={label}
          value={formattedValue}
          onChangeText={() => {}}
          onBlur={onBlur}
          error={localError || error}
          touched={touched}
          required={required}
          disabled={disabled}
          style={style}
          editable={false}
          pointerEvents="none"
          testID={testID}
        />
      </Pressable>

      {show && (
        <DateTimePicker
          testID={`${testID}-picker`}
          value={date}
          mode={mode}
          is24Hour={is24Hour}
          display="default"
          onChange={handleChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          minuteInterval={minuteInterval}
          timeZoneOffsetInMinutes={timeZoneOffsetInMinutes}
          locale={locale}
        />
      )}
    </>
  );
}; 