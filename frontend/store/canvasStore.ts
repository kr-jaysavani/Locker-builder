import { create } from 'zustand';

export interface ElementStyle {
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
}

export interface CanvasElement {
  id: string;
  type: 'image' | 'text' | 'link' | 'friend' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  content: string;
  style: ElementStyle;
  url?: string;
  rotation?: number;
}

export interface CanvasState {
  elements: CanvasElement[];
  backgroundColor: string;
  selectedElementId: string | null;
  history: CanvasElement[][];
  historyIndex: number;
  canvasWidth: number;
  canvasHeight: number;
}

interface CanvasStore extends CanvasState {
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  setBackgroundColor: (color: string) => void;
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  loadCanvas: (state: Partial<CanvasState>) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
}

const MAX_HISTORY = 50;

const useCanvasStore = create<CanvasStore>((set, get) => ({
  elements: [],
  backgroundColor: '#FFFFFF',
  selectedElementId: null,
  history: [[]],
  historyIndex: 0,
  canvasWidth: 375,
  canvasHeight: 667,

  addElement: (element) => {
    set((state) => {
      const newElements = [...state.elements, element];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      return {
        elements: newElements,
        history: newHistory.slice(-MAX_HISTORY),
        historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
      };
    });
  },

  updateElement: (id, updates) => {
    set((state) => {
      const newElements = state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      );
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      return {
        elements: newElements,
        history: newHistory.slice(-MAX_HISTORY),
        historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
      };
    });
  },

  deleteElement: (id) => {
    set((state) => {
      const newElements = state.elements.filter((el) => el.id !== id);
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      return {
        elements: newElements,
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
        history: newHistory.slice(-MAX_HISTORY),
        historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
      };
    });
  },

  selectElement: (id) => {
    set({ selectedElementId: id });
  },

  setBackgroundColor: (color) => {
    set({ backgroundColor: color });
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          elements: state.history[newIndex],
          historyIndex: newIndex,
          selectedElementId: null,
        };
      }
      return state;
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          elements: state.history[newIndex],
          historyIndex: newIndex,
          selectedElementId: null,
        };
      }
      return state;
    });
  },

  clearCanvas: () => {
    set({
      elements: [],
      selectedElementId: null,
      history: [[]],
      historyIndex: 0,
      backgroundColor: '#FFFFFF',
    });
  },

  loadCanvas: (state) => {
    set((currentState) => ({
      ...currentState,
      ...state,
      history: [state.elements || []],
      historyIndex: 0,
    }));
  },

  bringToFront: (id) => {
    set((state) => {
      const maxZIndex = Math.max(...state.elements.map(el => el.zIndex), 0);
      const newElements = state.elements.map((el) =>
        el.id === id ? { ...el, zIndex: maxZIndex + 1 } : el
      );
      return { elements: newElements };
    });
  },

  sendToBack: (id) => {
    set((state) => {
      const minZIndex = Math.min(...state.elements.map(el => el.zIndex), 0);
      const newElements = state.elements.map((el) =>
        el.id === id ? { ...el, zIndex: minZIndex - 1 } : el
      );
      return { elements: newElements };
    });
  },
}));

export default useCanvasStore;
