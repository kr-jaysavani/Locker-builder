import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import useCanvasStore, { CanvasElement } from '../store/canvasStore';

interface DraggableElementProps {
  element: CanvasElement;
}

const DraggableElement: React.FC<DraggableElementProps> = ({ element }) => {
  const { updateElement, deleteElement, selectElement, selectedElementId, bringToFront, sendToBack } =
    useCanvasStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState(element.content);
  const [editUrl, setEditUrl] = useState(element.url || '');
  const [editColor, setEditColor] = useState(element.style.color || '#000000');
  const [editBgColor, setEditBgColor] = useState(element.style.backgroundColor || '#FFFFFF');
  const [editFontSize, setEditFontSize] = useState(element.style.fontSize || 16);

  const translateX = useSharedValue(element.x);
  const translateY = useSharedValue(element.y);
  const scale = useSharedValue(1);

  const isSelected = selectedElementId === element.id;

  const colors = [
    '#FFFFFF', '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  ];

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48];

  const panGestureEvent = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx: any) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      updateElement(element.id, {
        x: translateX.value,
        y: translateY.value,
      });
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const handleResize = (direction: 'width' | 'height', delta: number) => {
    const newValue = Math.max(50, element[direction] + delta);
    updateElement(element.id, { [direction]: newValue });
  };

  const handleRotate = (delta: number) => {
    const newRotation = ((element.rotation || 0) + delta) % 360;
    updateElement(element.id, { rotation: newRotation });
  };

  const handleSelect = () => {
    selectElement(element.id);
  };

  const handleDelete = () => {
    deleteElement(element.id);
  };

  const handleEdit = () => {
    setEditContent(element.content);
    setEditUrl(element.url || '');
    setEditColor(element.style.color || '#000000');
    setEditBgColor(element.style.backgroundColor || '#FFFFFF');
    setEditFontSize(element.style.fontSize || 16);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    const updates: Partial<CanvasElement> = {
      content: editContent,
      style: {
        ...element.style,
        color: editColor,
        backgroundColor: editBgColor,
        fontSize: editFontSize,
      },
    };
    if (element.type === 'link' || element.type === 'friend') {
      updates.url = editUrl;
    }
    updateElement(element.id, updates);
    setShowEditModal(false);
  };

  const renderElement = () => {
    switch (element.type) {
      case 'image':
        return (
          <Image
            source={{ uri: element.content }}
            style={{
              width: element.width,
              height: element.height,
              borderRadius: element.style.borderRadius || 0,
            }}
            resizeMode="cover"
          />
        );

      case 'text':
        return (
          <Text
            style={{
              color: element.style.color || '#000000',
              fontSize: element.style.fontSize || 16,
              fontFamily: element.style.fontFamily || 'System',
              width: element.width,
            }}
            numberOfLines={undefined}
          >
            {element.content}
          </Text>
        );

      case 'shape':
        return (
          <View
            style={{
              width: element.width,
              height: element.height,
              backgroundColor: element.style.backgroundColor || '#4ECDC4',
              borderRadius: element.style.borderRadius || 0,
            }}
          />
        );

      case 'link':
      case 'friend':
        return (
          <View
            style={{
              width: element.width,
              height: element.height,
              backgroundColor: element.style.backgroundColor || '#4ECDC4',
              borderRadius: element.style.borderRadius || 8,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 12,
            }}
          >
            <Text
              style={{
                color: element.style.color || '#FFFFFF',
                fontSize: element.style.fontSize || 16,
                fontWeight: '600',
              }}
              numberOfLines={1}
            >
              {element.content}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <PanGestureHandler onGestureEvent={panGestureEvent}>
        <Animated.View
          style={[
            styles.elementContainer,
            animatedStyle,
            {
              zIndex: element.zIndex,
              width: element.width,
              height: element.height,
            },
            isSelected && styles.selected,
          ]}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={handleSelect}>
            {renderElement()}
          </TouchableOpacity>

          {isSelected && (
            <>
              {/* Control buttons */}
              <View style={styles.controls}>
                <TouchableOpacity style={styles.controlButton} onPress={handleEdit}>
                  <Ionicons name="create" size={16} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={() => bringToFront(element.id)}>
                  <Ionicons name="arrow-up" size={16} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={() => sendToBack(element.id)}>
                  <Ionicons name="arrow-down" size={16} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlButton, styles.deleteButton]} onPress={handleDelete}>
                  <Ionicons name="trash" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Resize handles */}
              <TouchableOpacity
                style={[styles.resizeHandle, styles.resizeRight]}
                onPressIn={() => handleResize('width', 10)}
              >
                <View style={styles.resizeHandleInner} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resizeHandle, styles.resizeBottom]}
                onPressIn={() => handleResize('height', 10)}
              >
                <View style={styles.resizeHandleInner} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resizeHandle, styles.resizeLeft]}
                onPressIn={() => handleResize('width', -10)}
              >
                <View style={styles.resizeHandleInner} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resizeHandle, styles.resizeTop]}
                onPressIn={() => handleResize('height', -10)}
              >
                <View style={styles.resizeHandleInner} />
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </PanGestureHandler>

      {/* Edit Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Element</Text>

            <ScrollView style={styles.modalScroll}>
              {(element.type === 'text' || element.type === 'link' || element.type === 'friend') && (
                <>
                  <Text style={styles.label}>Content:</Text>
                  <TextInput
                    style={styles.input}
                    value={editContent}
                    onChangeText={setEditContent}
                    multiline
                  />
                </>
              )}

              {(element.type === 'link' || element.type === 'friend') && (
                <>
                  <Text style={styles.label}>URL:</Text>
                  <TextInput
                    style={styles.input}
                    value={editUrl}
                    onChangeText={setEditUrl}
                    placeholder="https://example.com"
                    autoCapitalize="none"
                  />
                </>
              )}

              {element.type !== 'image' && (
                <>
                  <Text style={styles.label}>Background Color:</Text>
                  <ScrollView horizontal style={styles.colorRow}>
                    {colors.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          editBgColor === color && styles.colorOptionSelected,
                        ]}
                        onPress={() => setEditBgColor(color)}
                      />
                    ))}
                  </ScrollView>
                </>
              )}

              {(element.type === 'text' || element.type === 'link' || element.type === 'friend') && (
                <>
                  <Text style={styles.label}>Text Color:</Text>
                  <ScrollView horizontal style={styles.colorRow}>
                    {colors.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          editColor === color && styles.colorOptionSelected,
                        ]}
                        onPress={() => setEditColor(color)}
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
                          editFontSize === size && styles.fontSizeOptionSelected,
                        ]}
                        onPress={() => setEditFontSize(size)}
                      >
                        <Text style={styles.fontSizeText}>{size}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  elementContainer: {
    position: 'absolute',
    borderWidth: 0,
  },
  selected: {
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
  },
  controls: {
    position: 'absolute',
    top: -35,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 6,
    padding: 4,
  },
  controlButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderRadius: 4,
  },
  resizeHandle: {
    position: 'absolute',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  resizeHandleInner: {
    width: 8,
    height: 8,
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  resizeRight: {
    right: -4,
    top: '50%',
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resizeBottom: {
    bottom: -4,
    left: '50%',
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resizeLeft: {
    left: -4,
    top: '50%',
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resizeTop: {
    top: -4,
    left: '50%',
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
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
  },
  modalScroll: {
    maxHeight: 400,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  colorRow: {
    marginBottom: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#4ECDC4',
    borderWidth: 3,
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
  modalButtons: {
    flexDirection: 'row',
    marginTop: 16,
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
  modalCancelText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
  },
  modalSaveButton: {
    backgroundColor: '#4ECDC4',
  },
  modalSaveText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#FFF',
  },
});

export default DraggableElement;
