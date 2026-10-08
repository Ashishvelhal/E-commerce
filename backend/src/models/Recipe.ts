import mongoose, { Document, Schema } from 'mongoose';

export interface IRecipeMaterial {
  inventoryItem?: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  notes?: string;
}

export interface IRecipe extends Document {
  name: string;
  slug: string;
  productType: 'clock' | 'coaster' | 'tray' | 'keychain' | 'bookmark' | 'jewelry' | 'frame' | 'nameplate' | 'thali' | 'table' | 'preservation' | 'custom';
  description: string;
  materials: IRecipeMaterial[];
  laborMinutes: number;
  laborRatePerHour: number;
  packagingCost: number;
  studioOverhead: number;
  defaultCureHours: number;
  suggestedRetailPrice: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RecipeMaterialSchema = new Schema<IRecipeMaterial>(
  {
    inventoryItem: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.001, 'Quantity must be greater than zero'],
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    costPerUnit: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const RecipeSchema = new Schema<IRecipe>(
  {
    name: {
      type: String,
      required: [true, 'Recipe name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    productType: {
      type: String,
      required: true,
      enum: ['clock', 'coaster', 'tray', 'keychain', 'bookmark', 'jewelry', 'frame', 'nameplate', 'thali', 'table', 'preservation', 'custom'],
      default: 'custom',
    },
    description: {
      type: String,
      default: '',
    },
    materials: [RecipeMaterialSchema],
    laborMinutes: {
      type: Number,
      default: 30,
    },
    laborRatePerHour: {
      type: Number,
      default: 180,
    },
    packagingCost: {
      type: Number,
      default: 25,
    },
    studioOverhead: {
      type: Number,
      default: 15,
    },
    defaultCureHours: {
      type: Number,
      default: 24,
    },
    suggestedRetailPrice: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

RecipeSchema.index({ productType: 1 });

export const Recipe = mongoose.model<IRecipe>('Recipe', RecipeSchema);
