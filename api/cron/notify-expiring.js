import { notify } from '../../server/controllers/cronController.js';

export default (req, res) => notify(req, res);
