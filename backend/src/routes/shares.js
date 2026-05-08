import shareController from '../controllers/shareController.js'
import middlewareAuth from '../middleware/auth.js'
import express from 'express';
const router = express.Router();

router.post('/', middlewareAuth, shareController.createShareLink);
router.get('/', middlewareAuth, shareController.getShareLinks);
router.delete('/:id', middlewareAuth, shareController.revokeShareLink);

export default router;