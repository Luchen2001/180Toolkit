import axios from "axios";
import csv from "csv-parser";
import Company from "../models/Company.mjs";

export const authPrivilegeCode = (req, res) => {
  const correctPrivilegeCode = "luchen";
  const receivedPrivilegeCode = req.body.privilegeCode;

  if (receivedPrivilegeCode === correctPrivilegeCode) {
    res.json({ isValidCode: true });
  } else {
    res.json({ isValidCode: false });
  }
};

export const restart_DB = async (req, res) => {
  const max_limit = 60000000;
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
