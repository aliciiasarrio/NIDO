export interface Household {
  id: number;
  name: string;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
  createdAt: string;
}

export interface HouseholdRequest {
  name: string;
}

export interface InvitationResponse {
  id: number;
  householdId: number;
  householdName: string;
  code: string;
  expiresAt: string;
  createdAt: string;
}

export interface Location {
  id: number;
  householdId: number;
  parentId: number | null;
  parentName: string | null;
  name: string;
  fullPath: string;
  archivedAt: string | null;
  createdAt: string;
}

export interface LocationRequest {
  parentId: number | null;
  name: string;
}

export type ItemType = 'CONSUMABLE' | 'DURABLE';

export interface Stock {
  id: number;
  itemId: number;
  itemName?: string;
  locationId: number;
  locationName: string;
  locationFullPath: string;
  quantity: number;
  batchNumber: string | null;
  expirationDate: string | null;
  createdAt: string;
}

export interface Item {
  id: number;
  householdId: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string | null;
  itemType: ItemType;
  minimumQuantity: number | null;
  unit: string;
  clothingSize: string | null;
  clothingColor: string | null;
  lastWornAt: string | null;
  totalStock: number;
  isLowStock: boolean;
  stocks: Stock[];
  imageData?: string | null;
  marketReference?: string | null;
  marketPriceMin?: number | null;
  marketPriceMax?: number | null;
  archivedAt: string | null;
  createdAt: string;
}

export interface ItemRequest {
  categoryId: number;
  name: string;
  description?: string;
  itemType: ItemType;
  minimumQuantity?: number | null;
  unit?: string;
  clothingSize?: string | null;
  clothingColor?: string | null;
  imageData?: string | null;
  marketReference?: string | null;
  marketPriceMin?: number | null;
  marketPriceMax?: number | null;
}

export type MovementType = 'ENTRY' | 'EXIT' | 'TRANSFER' | 'ADJUSTMENT';

export interface MovementRequest {
  movementType: MovementType;
  quantity: number;
  sourceLocationId?: number | null;
  destinationLocationId?: number | null;
  reason?: string;
  batchNumber?: string;
  expirationDate?: string | null;
}

export interface MovementResponse {
  id: number;
  itemId: number;
  itemName: string;
  movementType: MovementType;
  quantity: number;
  sourceLocationId: number | null;
  sourceLocationName: string | null;
  destinationLocationId: number | null;
  destinationLocationName: string | null;
  reason: string | null;
  createdAt: string;
}

export interface ShoppingEntry {
  id: number;
  householdId: number;
  itemId: number | null;
  itemName: string | null;
  name: string;
  pendingQuantity: number;
  status: 'PENDING' | 'COMPLETED';
  createdAt: string;
}

export interface ShoppingEntryRequest {
  itemId?: number | null;
  name: string;
  pendingQuantity?: number;
}

export interface PurchaseEntryRequest {
  quantityPurchased: number;
  destinationLocationId: number;
  createAsCategoryId?: number;
  batchNumber?: string;
  expirationDate?: string;
}

export interface DashboardSummary {
  totalItems: number;
  totalLocations: number;
  lowStockCount: number;
  expiringSoonCount: number;
  pendingShoppingCount: number;
  unwornClothingCount: number;
  lowStockItems: Item[];
  expiringSoonStocks: Stock[];
  unwornClothingItems: Item[];
}

export interface RecipeRecommendation {
  id: string;
  title: string;
  description: string;
  cookingTimeMinutes: number;
  matchPercentage: number;
  availableIngredients: string[];
  missingIngredients: string[];
  hasExpiringIngredients: boolean;
}

export interface CatalogProduct {
  id: string;
  name: string;
  categoryName: string;
  itemType: ItemType;
  defaultUnit: string;
  defaultMinimumQuantity: number | null;
  typicalPriceMin: number;
  typicalPriceMax: number;
  priceUnit: string;
  marketReference: string;
  imageUrl?: string;
}
