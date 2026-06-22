import Item from '../models/Item.js';

export const findByCasa = (casa) =>
  Item.find({ casa }).sort({ category: 1, name: 1 }).lean();

export const create = (data) => Item.create(data);

export const updateInCasa = (id, casa, data) =>
  Item.findOneAndUpdate({ _id: id, casa }, data, { new: true, runValidators: true });

export const deleteInCasa = (id, casa) => Item.findOneAndDelete({ _id: id, casa });
