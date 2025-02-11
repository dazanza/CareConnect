// Mock Expo modules
jest.mock('expo-modules-core', () => {});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => {
      return React.createElement('DateTimePicker', {
        testID: props.testID || 'dateTimePicker',
        value: props.value || new Date(),
        mode: props.mode || 'date',
        display: props.display || 'default',
        onChange: props.onChange || (() => {}),
        maximumDate: props.maximumDate,
        minimumDate: props.minimumDate,
      });
    },
  };
});

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios),
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  const actual = jest.requireActual('react-native-paper');

  return {
    ...actual,
    TextInput: (props) => React.createElement('TextInput', props),
    Button: (props) => React.createElement('Button', props),
    Menu: {
      Item: (props) => React.createElement('MenuItem', props),
    },
    List: {
      Item: (props) => React.createElement('ListItem', props),
      Icon: (props) => React.createElement('ListIcon', props),
    },
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
  };
}); 