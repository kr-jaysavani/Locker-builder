import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useCanvasStore from '../store/canvasStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ToolbarProps {
  onSave: () => void;
  onLoad: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onSave, onLoad }) => {
  const {
    addElement,
    setBackgroundColor,
    backgroundColor,
    undo,
    redo,
    historyIndex,
    history,
  } = useCanvasStore();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('System');

  const colors = [
    '#FFFFFF', '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B500', '#6C5CE7', '#00B894', '#FDCB6E', '#E17055',
  ];

  const fonts = ['System', 'Arial', 'Times New Roman', 'Courier', 'Georgia', 'Verdana'];
  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48];

  const generateId = () => `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleAddImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to add images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      addElement({
        id: generateId(),
        type: 'image',
        x: 50,
        y: 100,
        width: 150,
        height: 150,
        zIndex: Date.now(),
        content: base64Image,
        style: {},
        rotation: 0,
      });
    }
  };

  const handleAddText = () => {
    if (textInput.trim()) {
      addElement({
        id: generateId(),
        type: 'text',
        x: 50,
        y: 100,
        width: 200,
        height: 50,
        zIndex: Date.now(),
        content: textInput,
        style: {
          color: textColor,
          fontSize: fontSize,
          fontFamily: fontFamily,
        },
        rotation: 0,
      });
      setTextInput('');
      setShowTextModal(false);
    }
  };

  const handleAddShape = (shapeType: string) => {
    addElement({
      id: generateId(),
      type: 'shape',
      x: 50,
      y: 100,
      width: 100,
      height: 100,
      zIndex: Date.now(),
      content: shapeType,
      style: {
        backgroundColor: '#4ECDC4',
        borderRadius: shapeType === 'circle' ? 50 : 0,
      },
      rotation: 0,
    });
  };

  const handleAddLink = () => {
    addElement({
      id: generateId(),
      type: 'link',
      x: 50,
      y: 100,
      width: 150,
      height: 40,
      zIndex: Date.now(),
      content: 'Link Button',
      style: {
        backgroundColor: '#4ECDC4',
        color: '#FFFFFF',
        fontSize: 16,
        borderRadius: 8,
      },
      url: 'https://example.com',
      rotation: 0,
    });
  };

  const handleAddFriend = () => {
    addElement({
      id: generateId(),
      type: 'friend',
      x: 50,
      y: 100,
      width: 150,
      height: 40,
      zIndex: Date.now(),
      content: 'Friend Button',
      style: {
        backgroundColor: '#FF6B6B',
        color: '#FFFFFF',
        fontSize: 16,
        borderRadius: 8,
      },
      url: '',
      rotation: 0,
    });
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <>
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Undo/Redo */}
          <TouchableOpacity
            style={[styles.toolButton, !canUndo && styles.toolButtonDisabled]}
            onPress={undo}
            disabled={!canUndo}
          >
            <Ionicons name="arrow-undo" size={20} color={canUndo ? "#333" : "#CCC"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, !canRedo && styles.toolButtonDisabled]}
            onPress={redo}
            disabled={!canRedo}
          >
            <Ionicons name="arrow-redo" size={20} color={canRedo ? "#333" : "#CCC"} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Add Image */}
          <TouchableOpacity style={styles.toolButton} onPress={handleAddImage}>
            <Ionicons name="image" size={20} color="#333" />
            <Text style={styles.toolLabel}>Image</Text>
          </TouchableOpacity>

          {/* Add Text */}
          <TouchableOpacity style={styles.toolButton} onPress={() => setShowTextModal(true)}>
            <Ionicons name="text" size={20} color="#333" />
            <Text style={styles.toolLabel}>Text</Text>
          </TouchableOpacity>

          {/* Add Shape */}
          <TouchableOpacity style={styles.toolButton} onPress={() => handleAddShape('rectangle')}>
            <Ionicons name="square" size={20} color="#333" />
            <Text style={styles.toolLabel}>Shape</Text>
          </TouchableOpacity>

          {/* Add Circle */}
          <TouchableOpacity style={styles.toolButton} onPress={() => handleAddShape('circle')}>
            <Ionicons name="ellipse" size={20} color="#333" />
            <Text style={styles.toolLabel}>Circle</Text>
          </TouchableOpacity>

          {/* Add Link */}
          <TouchableOpacity style={styles.toolButton} onPress={handleAddLink}>
            <Ionicons name="link" size={20} color="#333" />
            <Text style={styles.toolLabel}>Link</Text>
          </TouchableOpacity>

          {/* Add Friend */}
          <TouchableOpacity style={styles.toolButton} onPress={handleAddFriend}>
            <Ionicons name="person" size={20} color="#333" />
            <Text style={styles.toolLabel}>Friend</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Background Color */}
          <TouchableOpacity style={styles.toolButton} onPress={() => setShowColorPicker(true)}>
            <View style={[styles.colorPreview, { backgroundColor }]} />
            <Text style={styles.toolLabel}>BG</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Save */}
          <TouchableOpacity style={styles.toolButton} onPress={onSave}>
            <Ionicons name="save" size={20} color="#4ECDC4" />
            <Text style={styles.toolLabel}>Save</Text>
          </TouchableOpacity>

          {/* Load */}
          <TouchableOpacity style={styles.toolButton} onPress={onLoad}>
            <Ionicons name="folder-open" size={20} color="#4ECDC4" />
            <Text style={styles.toolLabel}>Load</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Color Picker Modal */}
      <Modal visible={showColorPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Background Color</Text>
            <View style={styles.colorGrid}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    backgroundColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => {
                    setBackgroundColor(color);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowColorPicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Text Modal */}
      <Modal visible={showTextModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Text</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Enter text..."
              value={textInput}
              onChangeText={setTextInput}
              multiline
            />

            <Text style={styles.label}>Text Color:</Text>
            <ScrollView horizontal style={styles.colorRow}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOptionSmall,
                    { backgroundColor: color },
                    textColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setTextColor(color)}
                />
              ))}
            </ScrollView>

            <Text style={styles.label}>Font Size:</Text>
            <ScrollView horizontal style={styles.fontSizeRow}>
              {fontSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.fontSizeOption,
                    fontSize === size && styles.fontSizeOptionSelected,
                  ]}
                  onPress={() => setFontSize(size)}
                >
                  <Text style={styles.fontSizeText}>{size}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Font Family:</Text>
            <ScrollView horizontal style={styles.fontFamilyRow}>
              {fonts.map((font) => (
                <TouchableOpacity
                  key={font}
                  style={[
                    styles.fontFamilyOption,
                    fontFamily === font && styles.fontFamilyOptionSelected,
                  ]}
                  onPress={() => setFontFamily(font)}
                >
                  <Text style={styles.fontFamilyText}>{font}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowTextModal(false);
                  setTextInput('');
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalAddButton]}
                onPress={handleAddText}
              >
                <Text style={styles.modalAddButtonText}>Add Text</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  toolButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minWidth: 60,
  },
  toolButtonDisabled: {
    opacity: 0.5,
  },
  toolLabel: {
    fontSize: 10,
    color: '#333',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 8,
    margin: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#4ECDC4',
    borderWidth: 3,
  },
  modalCloseButton: {
    backgroundColor: '#4ECDC4',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 60,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  colorRow: {
    marginBottom: 12,
  },
  colorOptionSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  fontSizeRow: {
    marginBottom: 12,
  },
  fontSizeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  fontSizeOptionSelected: {
    backgroundColor: '#4ECDC4',
  },
  fontSizeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fontFamilyRow: {
    marginBottom: 16,
  },
  fontFamilyOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  fontFamilyOptionSelected: {
    backgroundColor: '#4ECDC4',
  },
  fontFamilyText: {
    fontSize: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  modalCancelButton: {
    backgroundColor: '#E0E0E0',
  },
  modalCancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalAddButton: {
    backgroundColor: '#4ECDC4',
  },
  modalAddButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default Toolbar;
