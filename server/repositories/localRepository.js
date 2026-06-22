import Local from '../models/Local.js';
import Item from '../models/Item.js';

export const findByCasa = (casa) => Local.find({ casa }).sort({ name: 1 }).lean();

export const create = (data) => Local.create(data);

export const updateInCasa = (id, casa, data) =>
  Local.findOneAndUpdate({ _id: id, casa }, data, { new: true, runValidators: true });

export async function deleteInCasa(id, casa) {
  const local = await Local.findOneAndDelete({ _id: id, casa });
  if (local) {
    // Desassocia os itens que estavam neste local (não os apaga).
    await Item.updateMany({ casa, localId: id }, { localId: null, cell: null });
  }
  return local;
}
