import mongoose from 'mongoose';

const CasaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    // Emails que recebem avisos de validade (Fase 3).
    emails: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Casa || mongoose.model('Casa', CasaSchema);
