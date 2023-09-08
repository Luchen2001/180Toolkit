import express from 'express';
import { updateAllCash } from '../controllers/cashController.mjs';

const router = express.Router();

router.post('/update_cashflow', (req, res) => {
    // Start the process
    updateAllCash();
    // Respond to the client immediately
    res.status(200).send("Processing has started. Please check back later for results.");
});

export default router;
