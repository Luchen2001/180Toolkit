import axios from "axios";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { createObjectCsvWriter as createCsvWriter } from "csv-writer";
import pdf from "pdf-parse";
import Company from '../models/company.mjs'

export const getAllCompanies = async (req, res) => {
  try {
      const companies = await Company.find().select('code name cash -_id'); // Fetch only the 'code', 'name', and 'cash' fields. The '-_id' omits the ObjectId field.
      res.status(200).json(companies); // Send the filtered data as a response
  } catch (error) {
      console.error("Failed to fetch companies:", error);
      res.status(500).json({ message: 'Failed to fetch companies.' });
  }
};

export const updateCompanyCashflow = async (req, res) => {
  const {
    code,
    documentDate,
    url,
    header,
    cashFlow,
    debtFlow,
    dollarSign
  } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Code is required to update company." });
  }

  const updateData = {};

  // Only update the attributes with values
  if (documentDate) updateData["cash.document_date"] = documentDate;
  if (url) updateData["cash.url"] = url;
  if (header) updateData["cash.header"] = header;
  if (cashFlow) updateData["cash.cash_flow"] = cashFlow;
  if (debtFlow) updateData["cash.debt_flow"] = debtFlow;
  if (dollarSign) updateData["cash.dollar_sign"] = dollarSign;

  try {
    const updatedCompany = await Company.findOneAndUpdate({ code }, { $set: updateData }, { new: true });
    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found." });
    }
    res.status(200).json(updatedCompany);
  } catch (error) {
    console.error("Failed to update company:", error);
    res.status(500).json({ message: 'Failed to update company.' });
  }
};


// helper function to limit the async/await to only handle one request per time
// ***IMPORTANT***
// Only send and handle one request per time --> fetching pdf involves large heap size --> Otherwise there will be memory leakage
// ***IMPORTANT***
class Semaphore {
  constructor(count) {
    this.count = count;
    this.waiting = [];
  }

  async acquire() {
    if (this.count > 0) {
      this.count--;
      return Promise.resolve(true);
    } else {
      return new Promise((resolve) => this.waiting.push(resolve));
    }
  }

  release() {
    this.count++;
    if (this.count > 0 && this.waiting.length > 0) {
      this.count--;
      const next = this.waiting.shift();
      next(true);
    }
  }
}

const semaphore = new Semaphore(1); // Only allow 1 concurrent operations

//Step 1: get the companies list with pre-defined market cap from "https://asx.api.markitdigital.com/asx-research/1.0/companies/directory/file"
async function getMarketCap(maxLimit) {
  const url =
    "https://asx.api.markitdigital.com/asx-research/1.0/companies/directory/file";
  const dirName = "csv";
  const filePath = path.join(dirName, "Cash_ASX_Listed_Companies.csv");

  // Create the directory if it doesn't exist
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName);
  }

  const data = [];

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });

    if (response.status === 200) {
      fs.writeFileSync(filePath, response.data);
      console.log("CSV file downloaded successfully.");

      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => {
            const code = row["ASX code"];
            const name = row["Company name"];
            const capStr = row["Market Cap"];

            const cap = isNaN(parseInt(capStr)) ? 0 : parseInt(capStr);

            if (cap < maxLimit && code.length === 3 && cap !== 0) {
              data.push({
                code: code,
                name: name,
                cap: cap,
              });
            }
          })
          .on("end", () => {
            const sortedData = data.sort((a, b) => a.cap - b.cap);
            resolve(sortedData);
          })
          .on("error", (error) => {
            reject(error);
          });
      });
    } else {
      console.log("Failed to download CSV file.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
  // Nullify variables that are no longer needed
  data = null;
}

//Step 2: get the URL of the 4C PDF doc of each company from https://www.asx.com.au/asx/1/company/{code}/announcements?count=20&market_sensitive=false
// --> store the list if url to csv/url_List.csv
async function fetchAnnouncements(companyList) {
  const url_head = "https://www.asx.com.au/asx/1/company/";
  const url_tail = "/announcements?count=20&market_sensitive=false";
  const keywords = ["4c", "5b", "cash", "cashflow"];
  console.log(companyList);

  const filePath = path.join("csv", "Cash_url_List.csv");

  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: "key", title: "key" },
      { id: "name", title: "name" },
      { id: "cap", title: "cap" },
      { id: "document_date", title: "document_date" },
      { id: "url", title: "url" },
      { id: "header", title: "header" },
    ],
  });
  if (!csvWriter) {
    console.error("csvWriter is not defined");
    return;
  }

  let count = 0;
  const no_company = Object.keys(companyList).length;

  for (const company of companyList) {
    const code = company.code;
    count++;
    const url = url_head + code + url_tail;

    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        const data = response.data;
        if ("data" in data) {
          for (const item of data["data"]) {
            if (
              keywords.some((keyword) =>
                item["header"].toLowerCase().includes(keyword)
              )
            ) {
              company["document_date"] = item["document_date"].substring(0, 10); // Modify company directly
              company["url"] = item["url"]; // Modify company directly
              company["header"] = item["header"]; // Modify company directly

              await csvWriter.writeRecords([{ key: code, ...company }]);
              console.log(`Progress: ${count}/${no_company}`);
              break;
            }
          }
        }
      } else {
        console.log(`Failed to fetch announcements for ${code}`);
        await csvWriter.writeRecords([
          {
            key: code,
            ...company,
            document_date: null,
            url: null,
            header: null,
          },
        ]);
      }
    } catch (error) {
      console.error(
        `An error occurred while fetching data for ${code}:`,
        error
      );
    }
  }
  // Nullify variables that are no longer needed
  companyList = null;
}

//Step 3: request the url to fetch the pdf --> read each pdf and found the cashflow & debt and according dollar unit
// --> store to csv/raw_data.csv
async function readPdfFromUrl(url, maxRetries = 3) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
      });

      if (response.status === 200) {
        const pdfBuffer = response.data;
        console.log(
          `Size of response data for URL ${url}: ${pdfBuffer.byteLength} bytes`
        );

        const data = await pdf(pdfBuffer);

        console.log(`Processed ${data.numpages} pages for URL ${url}`);
        return data.text;
      } else {
        console.log("Failed to fetch PDF from URL:", url);
        throw new Error("Failed to fetch PDF");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      retries++;
      if (retries >= maxRetries) {
        throw new Error(`Failed to fetch PDF after ${maxRetries} attempts`);
      }
      console.log(`Retrying... (${retries}/${maxRetries})`);
    }
  }
}

async function findWordAfterPosition(text, phrase, nWordsAfter = 1) {
  const words = text.split(/\s+/);
  const phraseWords = phrase.split(/\s+/);
  const phraseLength = phraseWords.length;

  for (
    let index = 0;
    index < words.length - phraseLength + nWordsAfter;
    index++
  ) {
    const slice = words.slice(index, index + phraseLength);
    if (slice.join(" ") === phrase) {
      return words[index + phraseLength + nWordsAfter - 1];
    }
  }
  return null;
}

async function processBatch(batch) {
  const cashPhrase = "(should equal item 4.6 above)";
  const cashUnitPhrase = "related items in the accounts Current quarter";

  const debtPhrase = "Total financing facilities";
  const debtUnitPhrase = "Total facility amount at quarter end";
  const results = [];
  for (const row of batch) {
    const url = row["url"];
    const fullText = await readPdfFromUrl(url);
    const fullTextSize = Buffer.from(fullText).length;
    console.log(`Size of fullText for URL ${url}: ${fullTextSize} bytes`);

    // Find the cashflow information
    const cash = await findWordAfterPosition(fullText, cashPhrase);
    row["cash"] = cash;

    const cashUnit = await findWordAfterPosition(fullText, cashUnitPhrase);
    row["cash_unit"] = cashUnit;

    // Find the debt information
    const debt = await findWordAfterPosition(fullText, debtPhrase, 2);
    row["debt"] = debt;

    const debtUnit = await findWordAfterPosition(fullText, debtUnitPhrase);
    row["debt_unit"] = debtUnit;

    results.push(row);
    console.log(`Processed row for URL ${url}`);
  }
  batch = null;
  return results;
}

async function readAnnouncements() {
  const url_filename = path.join("csv", "Cash_url_List.csv");
  const rawData_filename = path.join("csv", "Cash_raw_data.csv");

  const data = [];
  const csvWriter = createCsvWriter({
    path: rawData_filename,
    header: [
      { id: "key", title: "key" },
      { id: "name", title: "name" },
      { id: "cap", title: "cap" },
      { id: "document_date", title: "document_date" },
      { id: "url", title: "url" },
      { id: "header", title: "header" },
      { id: "cash", title: "cash" },
      { id: "cash_unit", title: "cash_unit" },
      { id: "debt", title: "debt" },
      { id: "debt_unit", title: "debt_unit" },
    ],
  });

  const readStream = fs.createReadStream(url_filename).pipe(csv());
  for await (const row of readStream) {
    console.log(`Processing row for ${row.key}`);
    await semaphore.acquire();
    try {
      const processedRow = await processBatch([row]);
      data.push(...processedRow);
      console.log(`Processed row for ${row.key}`);
    } catch (err) {
      console.error("Error in processBatch:", err);
    } finally {
      semaphore.release();
    }
  }

  console.log(`Processed all rows. Writing ${data.length} records to CSV`);
  console.log(data);
  await csvWriter.writeRecords(data);
  console.log("Data written to CSV");
}

//Step 4: check the syntax of the cashflow & debt & dollar unit --> concate the unit and cash string --> ensure the reading results are correct --> otherwise marked it as "check"
// --> store to csv/verified_data.csv
async function verifyAnnouncementsData() {

  function correctNumberFormat(num) {
    // Handle formats like 1,1081,062
    let match = num.match(/^(\d{1,3}),(\d{3})(\d{1,3}),?/);
    if (match) {
        return match[1] + "," + match[2];
    }

    // Handle formats like 8431,599
    match = num.match(/^(\d{3})(\d{1,3}),\d{3}$/);
    if (match) {
        return match[1];
    }

    // Handle formats like 975484
    match = num.match(/^(\d{3})(\d{3})$/);
    if (match) {
        return match[1];
    }

    return num;
}




  const rawData_filename = path.join("csv", "Cash_raw_data.csv");
  const verifiedData_filename = path.join("csv", "Cash_verified_data.csv");

  const readStream = fs.createReadStream(rawData_filename).pipe(csv());
  let data = [];

  for await (const rowObj of readStream) {
      // Processing cash and debt logic from Python code
      rowObj.cash = correctNumberFormat(rowObj.cash?.trim());
      rowObj.debt = correctNumberFormat(rowObj.debt?.trim());

      let cash = rowObj.cash?.trim();
      let cash_unit = rowObj.cash_unit?.trim().replace("‘", "'").replace("’", "'");
      let cash_flow = '';
      let dollar_sign = '';

      if (!cash || !cash_unit) {
          cash_flow = 'check';
      } else {
          if (!/[\d,\-\*]*/.test(cash)) {
              cash_flow = 'check';
          } else if (cash.length === 1 && !isNaN(cash)) {
              cash_flow = 'check';
          } else {
              cash = cash.replace('*', '');
              if (cash_unit.includes('$')) {
                  let parts = cash_unit.split(/['ʼ‘]/);
                  dollar_sign = parts[0];
                  cash_flow = cash;
                  if (parts.length > 1) {
                      cash_flow = `${cash_flow},${parts[1]}`;
                  }
              } else {
                  cash_flow = 'check';
              }
          }
      }

      let debt = rowObj.debt?.trim();
      let debt_unit = rowObj.debt_unit?.trim().replace("‘", "'").replace("’", "'");
      let debt_flow = '';

      if (!debt || !debt_unit) {
          debt_flow = 'check';
      } else {
          if (!/[\d,\-\*]*/.test(debt)) {
              debt_flow = 'check';
          } else if (debt.length === 1 && !isNaN(debt)) {
              debt_flow = 'check';
          } else if (debt.includes('-')) {
              debt_flow = '0';
          } else {
              debt = debt.replace('*', '');
              if (debt_unit.includes('$')) {
                  debt_flow = debt;
              } else {
                  debt_flow = 'check';
              }
          }
      }

      rowObj.cash_flow = cash_flow;
      rowObj.dollar_sign = dollar_sign;
      rowObj.debt_flow = debt_flow;

      data.push(rowObj);
  }

  const csvWriter = createCsvWriter({
      path: verifiedData_filename,
      header: Object.keys(data[0]).map(header => ({ id: header, title: header }))
  });

  await csvWriter.writeRecords(data);
}

//Step 5: remove and integrate the helper columns in csv/verified_data.csv and format it
async function finalizeAnnouncementsData() {
  const verifiedData_filename = path.join("csv", "Cash_verified_data.csv");
  const finalDoc_filename  = path.join("csv", "Cash_4C_Doc.csv");

  const readStream = fs.createReadStream(verifiedData_filename).pipe(csv());
  let newRows = [];
  newRows.push(['key', 'name', 'cap', 'document_date', 'url', 'header', 'cash_flow', 'dollar_sign', 'debt_flow']);

  for await (const rowObj of readStream) {
      // Process the new row logic from Python code
      let newRow = [];
      for (let key in rowObj) {
          if (['cash', 'cash_unit', 'debt', 'debt_unit'].includes(key)) continue;  // skip these columns
          if (key === 'cash_flow' || key === 'debt_flow') {
              if (rowObj[key] !== 'check') {
                newRow.push(parseFloat(rowObj[key].replace(/,/g, '')));
              } else {
                  newRow.push(rowObj[key]);
              }
          } else {
              newRow.push(rowObj[key]);
          }
      }
      newRows.push(newRow);
  }

  const newCsvData = newRows.map(row => row.join(',')).join('\n');
  fs.writeFileSync(finalDoc_filename, newCsvData, { encoding: 'utf-8' });
}

async function importFromCsvToDb() {
  const finalDoc_filename = path.join("csv", "Cash_4C_Doc.csv");
  const readStream = fs.createReadStream(finalDoc_filename).pipe(csv());

  for await (const rowObj of readStream) {
      if (!rowObj || !rowObj.key) continue;

      // Find the company by its code (key)
      const company = await Company.findOne({ code: rowObj.key });
      if (company) {
          // Update the cash attributes
          company.cash = {
              cap: parseFloat(rowObj.cap || '0'),
              document_date: new Date(rowObj.document_date),
              url: rowObj.url,
              header: rowObj.header,
              cash_flow: rowObj.cash_flow === 'check' ? 'check' : parseFloat(rowObj.cash_flow.replace(',', '')),
              dollar_sign: rowObj.dollar_sign,
              debt_flow: rowObj.debt_flow === 'check' ? 'check' : parseFloat(rowObj.debt_flow.replace(',', ''))
          };
          await company.save();
          console.log(`Updated company ${company.code} with cash data.`);
      } else {
          console.warn(`Company with code ${rowObj.key} not found in the database.`);
      }
  }
}


export async function updateAllCash() {
  try {
    const companyList = await getMarketCap(200000000);
    await fetchAnnouncements(companyList);
    console.log("Fetching announcements complete.");
    await readAnnouncements();
    console.log("Reading announcements complete.");
    await verifyAnnouncementsData();
    console.log("Verifying announcements data complete.");
    await finalizeAnnouncementsData();
    console.log("4C document are ready.");
    await importFromCsvToDb();
    console.log("4C document published to database.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

