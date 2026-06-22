import mongoose from 'mongoose';

export const CATEGORIES = ['Cozinha', 'Casa de banho', 'Despensa', 'Outros'];

const ItemSchema = new mongoose.Schema(
  {
    casa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Casa',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: CATEGORIES,
      default: 'Outros',
    },
    // Compartimento dentro da categoria (ex: Frigorífico, Arca, Armário).
    location: { type: String, default: '', trim: true },
    // Local de arrumação (entidade Local) e posição na grelha desse local.
    localId: { type: mongoose.Schema.Types.ObjectId, ref: 'Local', default: null },
    // Célula da grelha do Local (índice 0..cols*rows-1), null = sem posição.
    cell: { type: Number, default: null, min: 0 },
    // Volume ocupado por cada unidade, em litros (para a ocupação do Local).
    volume: { type: Number, default: null, min: 0 },
    quantity: { type: Number, default: 1, min: 0 },
    unit: { type: String, default: 'un', trim: true },
    // Conteúdo de cada unidade (ex.: 50 g por saco). Total = quantity * packSize.
    packSize: { type: Number, default: null, min: 0 },
    packUnit: { type: String, default: '', trim: true },
    brand: { type: String, default: '', trim: true },
    price: { type: Number, default: null, min: 0 },
    // Guardada como texto no formato dd/mm/yyyy.
    expiryDate: { type: String, default: '', trim: true },
    // Marca se já foi enviado o aviso de validade (para não repetir).
    expiryNotified: { type: Boolean, default: false },
    note: { type: String, default: '', trim: true },
    // Código de barras (EAN/UPC) do produto.
    barcode: { type: String, default: '', trim: true },
    // Foto do produto, guardada como data URL base64 (data:image/jpeg;base64,...).
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

// Evita recompilar o modelo em hot-reload / reutilização da serverless function.
export default mongoose.models.Item || mongoose.model('Item', ItemSchema);
