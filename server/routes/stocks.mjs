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

router.get('/getLastUpdate', async (req, res) => {
    try {
        // Fetching the last 20 records by sorting by _id in descending order
        const last20Companies = await Company.find().sort({ _id: -1 }).limit(20);

        if (!last20Companies || last20Companies.length === 0) {
            return res.status(404).send({ error: 'No companies found in the database.' });
        }

        // Finding the record with the latest updatedAt timestamp among the last 20 records
        const latestUpdatedCompany = last20Companies.reduce((latest, current) => {
            return (current.updatedAt > latest.updatedAt) ? current : latest;
        }, last20Companies[0]);

        res.json({ updatedAt: latestUpdatedCompany.updatedAt });
    } catch (error) {
        res.status(500).send({ error: 'Error fetching the latest update timestamp from the last 20 records.' });
        console.log(error);
    }
});


export default router;
