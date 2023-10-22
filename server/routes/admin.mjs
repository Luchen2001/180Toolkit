import express from 'express';
import { updateMarketData, updatePriceHistory } from '../controllers/adminController.mjs';

const router = express.Router();

router.get('/updateMarketInfo', updateMarketData);
router.get('/updatePriceData', updatePriceHistory);

export default router;
