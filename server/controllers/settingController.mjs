import axios from "axios";
import csv from "csv-parser";
import Company from "../models/company.mjs";

export const authPrivilegeCode = (req, res) => {
  const correctPrivilegeCode = "brad180!";
  const receivedPrivilegeCode = req.body.privilegeCode;

  if (receivedPrivilegeCode === correctPrivilegeCode) {
    res.json({ isValidCode: true });
  } else {
    res.json({ isValidCode: false });
  }
};

// fetch the csv file containing the company list and push the targeted companies to MongoDB
export const restart_DB = async (req, res) => {
  const max_limit = 200000000;
  try {
    // Specify responseType as stream
    const response = await axios.get(
      "https://asx.api.markitdigital.com/asx-research/1.0/companies/directory/file",
      {
        responseType: "stream",
      }
    );

    const stocks = [];

    // Directly use the response.data, which is now a stream, to pipe to csv-parser
    response.data
      .pipe(csv()) // specify tab delimiter
      .on("data", (row) => {
        if (!row || !row["ASX code"]) return;

        const cap = parseInt(row["Market Cap"], 10) || 0;

        if (cap < max_limit && row["ASX code"].length === 3 && cap !== 0) {
          stocks.push({
            code: row["ASX code"],
            name: row["Company name"],
            cap: cap,
          });
        }
      })
      .on("end", async () => {
        for (const stock of stocks) {
          const existingStock = await Company.findOne({ code: stock.code });
          if (existingStock) {
            Object.assign(existingStock, stock);
            await existingStock.save();
            console.log(`Updated document with id ${stock.code}.`);
          } else {
            const newCompany = new Company(stock);
            await newCompany.save();
            console.log(`Created new document with id ${stock.code}.`);
          }
        }
        res.json({ message: "Stock information stored successfully." });
      });
  } catch (error) {
    console.error("Failed to download CSV file.", error.message);
    res.status(500).json({ message: "Failed to download CSV file." });
  }
};

export const updateCompanyIndustry = async (req, res) => {
  const companyData = req.body;

  // Respond to the client immediately
  res.json({ message: 'Company attributes update in progress.' });

  // Continue processing the data
  console.log('Received data:', companyData);

  for (const code in companyData) {
    try {
      const updateFields = {
        industry: companyData[code].industry,
        isMiningComp: companyData[code].isMiningComp,
        commodities: companyData[code].commodities
      };

      const updatedCompany = await Company.findOneAndUpdate({ code: code }, updateFields, { new: true });

      if (!updatedCompany) {
        console.log(`No company found with code ${code}. No update was made.`);
        continue;  // skip to the next iteration
      }

      console.log(`Company with code ${code} updated successfully.`);

    } catch (updateError) {
      console.error(`Failed to update company with code ${code}.`, updateError.message);
    }
  }
};



