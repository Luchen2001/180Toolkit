import express from 'express';
import { updateCompanyDataFromASX } from '../controllers/adminController.mjs';

const router = express.Router();

router.get('/updateMarketInfo', updateCompanyDataFromASX);

export default router;
