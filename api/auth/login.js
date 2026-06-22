import { login } from '../../server/controllers/authController.js';

export default (req, res) => login(req, res);
