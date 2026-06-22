import Casa from '../models/Casa.js';

export const findByName = (name) => Casa.findOne({ name });

export const create = (data) => Casa.create(data);
