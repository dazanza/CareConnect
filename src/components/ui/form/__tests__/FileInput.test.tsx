import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FileInput } from '../FileInput';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

// Mock expo packages
jest.mock('expo-document-picker');
jest.mock('expo-image-picker');

describe('FileInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const onChange = jest.fn();
    const { getByText } = render(<FileInput onChange={onChange} />);

    expect(getByText('Upload File')).toBeTruthy();
    expect(getByText('Select File')).toBeTruthy();
  });

  it('renders with custom label', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <FileInput onChange={onChange} label="Custom Upload" />
    );

    expect(getByText('Custom Upload')).toBeTruthy();
  });

  it('handles document selection', async () => {
    const onChange = jest.fn();
    const mockResult = {
      type: 'success',
      uri: 'file://test.pdf',
      size: 1024,
      name: 'test.pdf',
    };

    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(mockResult);

    const { getByText } = render(<FileInput onChange={onChange} />);
    
    fireEvent.press(getByText('Select File'));

    // Wait for the async operation to complete
    await new Promise(resolve => setImmediate(resolve));

    expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith('file://test.pdf');
  });

  it('handles image selection', async () => {
    const onChange = jest.fn();
    const mockPermission = { granted: true };
    const mockResult = {
      canceled: false,
      assets: [{ uri: 'file://test.jpg' }],
    };

    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce(mockPermission);
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(mockResult);

    const { getByText } = render(<FileInput onChange={onChange} imageOnly />);
    
    fireEvent.press(getByText('Select Image'));

    // Wait for the async operations to complete
    await new Promise(resolve => setImmediate(resolve));

    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith('file://test.jpg');
  });

  it('handles file size limit', async () => {
    const onChange = jest.fn();
    const onError = jest.fn();
    const mockResult = {
      type: 'success',
      uri: 'file://test.pdf',
      size: 6 * 1024 * 1024, // 6MB
      name: 'test.pdf',
    };

    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(mockResult);

    const { getByText } = render(
      <FileInput 
        onChange={onChange} 
        onError={onError}
        maxSize={5 * 1024 * 1024} // 5MB limit
      />
    );
    
    fireEvent.press(getByText('Select File'));

    // Wait for the async operation to complete
    await new Promise(resolve => setImmediate(resolve));

    expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith('File size exceeds 5MB limit');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('handles permission denial for image picker', async () => {
    const onChange = jest.fn();
    const onError = jest.fn();
    const mockPermission = { granted: false };

    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce(mockPermission);

    const { getByText } = render(
      <FileInput onChange={onChange} onError={onError} imageOnly />
    );
    
    fireEvent.press(getByText('Select Image'));

    // Wait for the async operation to complete
    await new Promise(resolve => setImmediate(resolve));

    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith('Permission to access media library was denied');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clears selected file when clear button is pressed', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <FileInput 
        onChange={onChange} 
        value="file://test.pdf"
        testID="file-input"
      />
    );

    const clearButton = getByTestId('file-input').querySelector('IconButton');
    fireEvent.press(clearButton);

    expect(onChange).toHaveBeenCalledWith(null);
  });
}); 