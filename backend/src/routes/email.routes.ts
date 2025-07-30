import { Router } from 'express';
import { getCountController, searchEmailsController, suggestReplyController } from '../controllers/email.controller';

const router = Router();
router.get('/emails', searchEmailsController);
router.get('/diagnose-es', getCountController); 
router.post('/emails/:id/suggest-reply', suggestReplyController);

export default router;