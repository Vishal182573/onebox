import { Router } from 'express';
import { addContextController } from '../controllers/context.controller';

const router = Router();
router.post('/context', addContextController);

export default router;