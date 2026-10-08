import { create } from 'zustand';
import api from '../services/api';

export interface RecipeMaterial {
  inventoryItem?: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  lineCost?: number;
  notes?: string;
}

export interface RecipeItem {
  _id: string;
  name: string;
  slug: string;
  productType: 'clock' | 'coaster' | 'tray' | 'keychain' | 'bookmark' | 'jewelry' | 'frame' | 'nameplate' | 'thali' | 'table' | 'preservation' | 'custom';
  description: string;
  materials: RecipeMaterial[];
  laborMinutes: number;
  laborRatePerHour: number;
  laborCost: number;
  packagingCost: number;
  studioOverhead: number;
  totalMaterialCost: number;
  totalCost: number;
  defaultCureHours: number;
  suggestedRetailPrice: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface RecipeState {
  recipes: RecipeItem[];
  isLoading: boolean;
  selectedRecipe: RecipeItem | null;

  fetchRecipes: () => Promise<void>;
  setSelectedRecipe: (recipe: RecipeItem | null) => void;
  consumeRecipe: (params: {
    recipeId?: string;
    recipeSlug?: string;
    productType?: string;
    units?: number;
    batchNotes?: string;
  }) => Promise<any>;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  isLoading: false,
  selectedRecipe: null,

  setSelectedRecipe: (recipe) => set({ selectedRecipe: recipe }),

  fetchRecipes: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get('/recipes');
      if (data.success) {
        set({ recipes: data.data || [] });
      }
    } catch (err) {
      console.warn('Could not fetch recipes:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  consumeRecipe: async (params) => {
    try {
      const { data } = await api.post('/recipes/consume', params);
      get().fetchRecipes();
      return data;
    } catch (err) {
      console.warn('Error consuming recipe:', err);
      return null;
    }
  },
}));
