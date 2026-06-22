import { CookingPot, ShowerHead, Package, Box } from 'lucide-react';

// Ícone (Lucide) por categoria.
export const CATEGORY_ICON = {
  Cozinha: CookingPot,
  'Casa de banho': ShowerHead,
  Despensa: Package,
  Outros: Box,
};

export const EMPTY_FORM = {
  name: '',
  category: 'Cozinha',
  location: '',
  quantity: '1',
  unit: 'un',
  packSize: '',
  packUnit: '',
  brand: '',
  price: '',
  expiryDate: '',
  note: '',
  barcode: '',
  image: '',
  localId: '',
  cell: null,
  volume: '',
};
