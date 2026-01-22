import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import Toolbar from '../components/Toolbar';
import DraggableElement from '../components/DraggableElement';
import useCanvasStore from '../store/canvasStore';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

const Index = () => {
  const { elements, backgroundColor, loadCanvas, clearCanvas } = useCanvasStore();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [pageTitle, setPageTitle] = useState('My Canvas');
  const [savedPages, setSavedPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!pageTitle.trim()) {
      Alert.alert('Error', 'Please enter a page title');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: pageTitle,
        elements: elements,
        backgroundColor: backgroundColor,
        canvasWidth: 375,
        canvasHeight: 667,
      };

      let response;
      if (currentPageId) {
        // Update existing page
        response = await fetch(`${BACKEND_URL}/api/pages/${currentPageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new page
        response = await fetch(`${BACKEND_URL}/api/pages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const data = await response.json();
        setCurrentPageId(data.id);
        Alert.alert('Success', `Page "${pageTitle}" saved successfully!`);
        setShowSaveModal(false);
      } else {
        Alert.alert('Error', 'Failed to save page');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/pages`);
      if (response.ok) {
        const data = await response.json();
        setSavedPages(data);
        setShowLoadModal(true);
      } else {
        Alert.alert('Error', 'Failed to load pages');
      }
    } catch (error) {
      console.error('Load error:', error);
      Alert.alert('Error', 'Failed to load pages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPage = (page: any) => {
    loadCanvas({
      elements: page.elements,
      backgroundColor: page.backgroundColor,
      canvasWidth: page.canvasWidth,
      canvasHeight: page.canvasHeight,
    });
    setPageTitle(page.title);
    setCurrentPageId(page.id);
    setShowLoadModal(false);
    Alert.alert('Success', `Page "${page.title}" loaded!`);
  };

  const handleDeletePage = async (pageId: string, pageTitle: string) => {
    Alert.alert('Delete Page', `Are you sure you want to delete "${pageTitle}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${BACKEND_URL}/api/pages/${pageId}`, {
              method: 'DELETE',
            });
            if (response.ok) {
              setSavedPages((prev) => prev.filter((p) => p.id !== pageId));
              if (currentPageId === pageId) {
                setCurrentPageId(null);
                clearCanvas();
              }
              Alert.alert('Success', 'Page deleted successfully');
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to delete page');
          }
        },
      },
    ]);
  };

  const handleNewPage = () => {
    Alert.alert('New Page', 'Start a new canvas? Any unsaved changes will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'New Page',
        onPress: () => {
          clearCanvas();
          setPageTitle('My Canvas');
          setCurrentPageId(null);
        },
      },
    ]);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Canvas Builder</Text>
          <TouchableOpacity style={styles.newButton} onPress={handleNewPage}>
            <Ionicons name="add-circle" size={24} color="#4ECDC4" />
          </TouchableOpacity>
        </View>

        {/* Toolbar */}
        <Toolbar onSave={() => setShowSaveModal(true)} onLoad={handleLoadPages} />

        {/* Canvas */}
        <View style={[styles.canvas, { backgroundColor }]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.canvasInner}>
              {elements.map((element) => (
                <DraggableElement key={element.id} element={element} />
              ))}

              {elements.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="create-outline" size={64} color="#CCC" />
                  <Text style={styles.emptyStateText}>Tap toolbar to add elements</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Save Modal */}
        <Modal visible={showSaveModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Save Page</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter page title"
                value={pageTitle}
                onChangeText={setPageTitle}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowSaveModal(false)}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Load Modal */}
        <Modal visible={showLoadModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Load Page</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#4ECDC4" />
              ) : savedPages.length === 0 ? (
                <View style={styles.emptyList}>
                  <Ionicons name="folder-open-outline" size={48} color="#CCC" />
                  <Text style={styles.emptyListText}>No saved pages</Text>
                </View>
              ) : (
                <ScrollView style={styles.pagesList}>
                  {savedPages.map((page) => (
                    <View key={page.id} style={styles.pageItem}>
                      <TouchableOpacity
                        style={styles.pageItemContent}
                        onPress={() => handleLoadPage(page)}
                      >
                        <View>
                          <Text style={styles.pageItemTitle}>{page.title}</Text>
                          <Text style={styles.pageItemSubtitle}>
                            {page.elements.length} elements
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.pageDeleteButton}
                        onPress={() => handleDeletePage(page.id, page.title)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setShowLoadModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  newButton: {
    padding: 8,
  },
  canvas: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    flexGrow: 1,
  },
  canvasInner: {
    flex: 1,
    minHeight: 667,
    position: 'relative',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
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
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
  },
  saveButtonText: {
    fontWeight: '600',
    color: '#FFF',
  },
  closeButton: {
    backgroundColor: '#4ECDC4',
    marginTop: 12,
  },
  closeButtonText: {
    fontWeight: '600',
    color: '#FFF',
  },
  pagesList: {
    maxHeight: 400,
    marginBottom: 12,
  },
  pageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  pageItemContent: {
    flex: 1,
  },
  pageItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  pageItemSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  pageDeleteButton: {
    padding: 8,
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyListText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});

export default Index;
