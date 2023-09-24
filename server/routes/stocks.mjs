import express from 'express';
import Company from '../models/company.mjs'

const router = express.Router();
router.get('/getStocks', async (req, res) => {
    try {
        const companies = await Company.find({}, {
            code: 1,
            name: 1,
            cap: 1,
            cash: 1,
            industry: 1,
            isMiningComp: 1,
            commodities: 1,
            last_price: 1,
            change_in_percent: 1,
            volume: 1,
            bid_price: 1,
            offer_price: 1,
            previous_close_price: 1,
            average_daily_volume: 1,
            market_cap: 1,
        });

        res.json(companies);
    } catch (error) {
        res.status(500).send({ error: 'Error fetching company data.' });
        console.log(error);
    }
});

export default router;
