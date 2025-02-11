import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Text, IconButton, ActivityIndicator } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

interface FileInputProps {
  value?: string | null;
  onChange: (uri: string | null) => void;
  onError?: (error: string) => void;
  allowedTypes?: string[];
  maxSize?: number; // in bytes
  minSize?: number; // in bytes
  label?: string;
  testID?: string;
  imageOnly?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  validateFile?: (file: FileInfo) => string | undefined;
  showPreview?: boolean;
  previewSize?: number;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

interface FileInfo {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export const FileInput: React.FC<FileInputProps> = ({
  value,
  onChange,
  onError,
  allowedTypes = ['*/*'],
  maxSize = 5 * 1024 * 1024, // 5MB default
  minSize = 0,
  label = 'Upload File',
  testID,
  imageOnly = false,
  multiple = false,
  maxFiles = 1,
  validateFile,
  showPreview = true,
  previewSize = 100,
  loading = false,
  disabled = false,
  style,
}) => {
  const [files, setFiles] = React.useState<FileInfo[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    if (value) {
      getFileInfo(value).then(fileInfo => {
        if (fileInfo) {
          setFiles([fileInfo]);
        }
      });
    } else {
      setFiles([]);
    }
  }, [value]);

  const getFileInfo = async (uri: string): Promise<FileInfo | null> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) return null;

      const name = uri.split('/').pop() || 'file';
      const type = name.split('.').pop()?.toLowerCase() || '';

      return {
        uri,
        name,
        type,
        size: fileInfo.size,
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  };

  const validateFileType = (file: FileInfo): string | undefined => {
    if (imageOnly && !file.type.startsWith('image/')) {
      return 'Only image files are allowed';
    }

    if (allowedTypes[0] !== '*/*' && !allowedTypes.includes(file.type)) {
      return `Only ${allowedTypes.join(', ')} files are allowed`;
    }

    return undefined;
  };

  const validateFileSize = (file: FileInfo): string | undefined => {
    if (file.size < minSize) {
      return `File size must be at least ${formatFileSize(minSize)}`;
    }

    if (file.size > maxSize) {
      return `File size must not exceed ${formatFileSize(maxSize)}`;
    }

    return undefined;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleImagePick = async () => {
    try {
      setIsProcessing(true);
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        onError?.('Permission to access media library was denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        allowsMultipleSelection: multiple,
      });

      if (!result.canceled) {
        const selectedFiles = await Promise.all(
          result.assets.map(asset => getFileInfo(asset.uri))
        );

        const validFiles = selectedFiles.filter((file): file is FileInfo => !!file);
        
        if (validFiles.length === 0) {
          onError?.('No valid files selected');
          return;
        }

        for (const file of validFiles) {
          const typeError = validateFileType(file);
          if (typeError) {
            onError?.(typeError);
            return;
          }

          const sizeError = validateFileSize(file);
          if (sizeError) {
            onError?.(sizeError);
            return;
          }

          const customError = validateFile?.(file);
          if (customError) {
            onError?.(customError);
            return;
          }
        }

        if (multiple) {
          if (validFiles.length > maxFiles) {
            onError?.(`Maximum ${maxFiles} files allowed`);
            return;
          }
          setFiles(validFiles);
          onChange(validFiles.map(f => f.uri).join(','));
        } else {
          setFiles([validFiles[0]]);
          onChange(validFiles[0].uri);
        }
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to pick image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDocumentPick = async () => {
    try {
      setIsProcessing(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        multiple,
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        const fileInfo: FileInfo = {
          uri: result.uri,
          name: result.name,
          type: result.mimeType || '',
          size: result.size,
        };

        const typeError = validateFileType(fileInfo);
        if (typeError) {
          onError?.(typeError);
          return;
        }

        const sizeError = validateFileSize(fileInfo);
        if (sizeError) {
          onError?.(sizeError);
          return;
        }

        const customError = validateFile?.(fileInfo);
        if (customError) {
          onError?.(customError);
          return;
        }

        setFiles([fileInfo]);
        onChange(fileInfo.uri);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to pick document');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePress = () => {
    if (disabled || loading || isProcessing) return;
    
    if (imageOnly) {
      handleImagePick();
    } else {
      handleDocumentPick();
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange(newFiles.length > 0 ? newFiles.map(f => f.uri).join(',') : null);
  };

  const renderPreview = () => {
    if (!showPreview || files.length === 0) return null;

    return (
      <View style={styles.previewContainer}>
        {files.map((file, index) => (
          <View key={file.uri} style={styles.filePreview}>
            {file.type.startsWith('image/') ? (
              <Image 
                source={{ uri: file.uri }} 
                style={[styles.imagePreview, { width: previewSize, height: previewSize }]} 
              />
            ) : (
              <View style={[styles.fileIcon, { width: previewSize, height: previewSize }]}>
                <IconButton icon="file-document" size={previewSize / 2} />
              </View>
            )}
            <View style={styles.fileInfo}>
              <Text numberOfLines={1} style={styles.fileName}>{file.name}</Text>
              <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
            </View>
            <IconButton
              icon="close"
              size={20}
              onPress={() => handleRemoveFile(index)}
              style={styles.removeButton}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <View testID={testID} style={style}>
      <Text style={styles.label}>{label}</Text>
      {renderPreview()}
      {(!multiple || files.length < maxFiles) && (
        <TouchableOpacity
          onPress={handlePress}
          style={[
            styles.uploadButton,
            (disabled || loading || isProcessing) && styles.disabledButton
          ]}
          testID={`${testID}-button`}
          disabled={disabled || loading || isProcessing}
        >
          {loading || isProcessing ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text>{imageOnly ? 'Select Image' : 'Select File'}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  uploadButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  previewContainer: {
    marginBottom: 16,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  imagePreview: {
    borderRadius: 4,
  },
  fileIcon: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  fileName: {
    fontSize: 14,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#6b7280',
  },
  removeButton: {
    margin: 0,
  },
}); 
}); 