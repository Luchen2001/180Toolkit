import axios from 'axios';
import Company from "../models/company.mjs";

export const updateCompanyDataFromASX = async (req, res) => {
  try {
    // Fetch all company codes from the database
    const companies = await Company.find({}, 'code');

    for (let company of companies) {
      try {
        // Fetch data from ASX for each company code
        const response = await axios.get(`https://www.asx.com.au/asx/1/share/${company.code}`);
        const data = response.data;

        // Extract required fields from ASX data
        const updateFields = {
          last_price: data.last_price,
          change_in_percent: data.change_in_percent,
          volume: data.volume,
          bid_price: data.bid_price,
          offer_price: data.offer_price,
          previous_close_price: data.previous_close_price,
          average_daily_volume: data.average_daily_volume,
          market_cap: data.number_of_shares * data.last_price
        };

        // Update the company data in the database
        const updatedCompany = await Company.findOneAndUpdate({ code: company.code }, updateFields, { new: true });
        if (!updatedCompany) {
            console.log(`No company found with code ${code}. No update was made.`);
            continue;  // skip to the next iteration
          }
        console.log(`Attempting to update company with code: ${company.code} with data:`, updateFields);
        console.log(`Updated data for company code: ${company.code}`);
      } catch (error) {
        console.error(`Failed to fetch or update data for company code: ${company.code}`, error.message);
      }
    }

    res.json({ message: 'Successfully updated company data from ASX.' });

  } catch (err) {
    console.error("Failed to fetch company codes or process data", err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
