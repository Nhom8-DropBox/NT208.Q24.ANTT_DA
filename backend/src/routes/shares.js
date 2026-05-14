import shareController from '../controllers/shareController.js'
import middlewareAuth from '../middleware/auth.js'
import express from 'express';
const router = express.Router();

router.get('/share/:token', shareController.getPublicShare);
router.post('/', middlewareAuth, shareController.createShareLink);
router.get('/links', middlewareAuth, shareController.getShareLinks);
router.delete('/:id', middlewareAuth, shareController.revokeShareLink);

export default router;
