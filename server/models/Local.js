import mongoose from 'mongoose';

// Um Local de arrumação (ex.: "Arca", "Armário de cima da cozinha").
// Pertence a uma Casa. Tem capacidade opcional (litros) e uma grelha
// (cols x rows) para posicionar os itens.
const LocalSchema = new mongoose.Schema(
  {
    casa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Casa',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    // Capacidade em litros (null = sem limite definido).
    capacity: { type: Number, default: null, min: 0 },
    // Grelha de posições (ex.: 2x2 = 4 células).
    cols: { type: Number, default: 2, min: 1, max: 6 },
    rows: { type: Number, default: 2, min: 1, max: 6 },
    // Foto do local, data URL base64 (opcional).
    photo: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Local || mongoose.model('Local', LocalSchema);
