import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import { HeaderBar } from "../components/HeaderBar";
import api from "../utils/api"; // Import your API helper function
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

export const Cash = () => {
  const [companies, setCompanies] = useState([]);

  const [inputValues, setInputValues] = useState({
    code: "",
    documentDate: "",
    url: "",
    header: "",
    cashFlow: "",
    debtFlow: "",
    dollarSign: "",
  });

  const [sortCriteria, setSortCriteria] = useState("documentDate"); // default sorting criteria

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // can be 'success', 'error', 'info', 'warning'

  const sortedCompanies = [...companies].sort((a, b) => {
    switch (sortCriteria) {
      case "documentDate":
        return (
          new Date(b.cash?.document_date ?? 0) -
          new Date(a.cash?.document_date ?? 0)
        );
      case "cashFlow":
        if (a.cash?.cash_flow === "check") return -1;
        if (b.cash?.cash_flow === "check") return 1;
        if (a.cash === 0 || a.cash?.cash_flow == null) return 1; // Put items with 0 at the end
        if (b.cash === 0 || b.cash?.cash_flow == null) return -1; // Put items with 0 at the end
        return a.cash?.cash_flow - b.cash?.cash_flow;
      case "debtFlow":
        if (a.cash?.debt_flow === "check") return -1;
        if (b.cash?.debt_flow === "check") return 1;
        if (a.cash === 0 || a.cash?.debt_flow == null) return 1; // Put items with 0 at the end
        if (b.cash === 0 || b.cash?.debt_flow == null) return -1; // Put items with 0 at the end
        return a.cash?.debt_flow - b.cash?.debt_flow;
      default:
        return 0;
    }
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    api
      .post("/api/cashflow/update_company_cashflow", inputValues)
      .then((response) => {
        console.log("Updated successfully:", response.data);
        // Set success message and open the snackbar
        setSnackbarMessage(
          `Cashflow info of ${inputValues.code} has been updated`
        );
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        // Clear the input fields
        setInputValues({
          code: "",
          documentDate: "",
          url: "",
          header: "",
          cashFlow: "",
          debtFlow: "",
          dollarSign: "",
        });
      })
      .catch((error) => {
        console.error("Failed to update company:", error);
        // Set error message and open the snackbar
        setSnackbarMessage(
          "Failed to update company. Please make sure input is correct."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const downloadCsv = () => {
    // Create CSV content
    const csvRows = [
      // This is the header row
      [
        "Code",
        "Name",
        "Cap",
        "Document Date",
        "URL",
        "Header",
        "Cash Flow",
        "Debt Flow",
        "Dollar Sign",
      ],
    ];

    // Add rows for each company
    sortedCompanies.forEach((company) => {
      const csvRow = [];
      csvRow.push(company.code);
      csvRow.push(company.name);
      csvRow.push(
        company.market_cap
          ? `${
              Math.round(
                (company.market_cap / 1000000 + Number.EPSILON) * 1000
              ) / 1000
            } M`
          : ""
      );
      csvRow.push(
        company.cash?.document_date
          ? new Date(company.cash?.document_date).toLocaleDateString()
          : ""
      );
      csvRow.push(company.cash?.url ? company.cash?.url : "");
      csvRow.push(company.cash?.header ? company.cash?.header : "");
      csvRow.push(company.cash?.cash_flow ? company.cash?.cash_flow : "");
      csvRow.push(company.cash?.debt_flow ? company.cash?.debt_flow : "");
      csvRow.push(company.cash?.dollar_sign ? company.cash?.dollar_sign : "");

      csvRows.push(`"${csvRow.join('","')}"`);
    });

    // Combine rows and encode
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create a link and download
    const link = document.createElement("a");
    link.href = url;
    link.download = "cash_data.csv";
    link.click();

    // Clean up URL.createObjectURL call
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    api
      .get("/api/cashflow/companies")
      .then((response) => {
        console.log("API Response:", response.data); // log the response
        setCompanies(response.data);
      })
      .catch((error) => console.error("Failed to fetch companies:", error));
  }, []);

  return (
    <div>
      <HeaderBar />
      <div style={{ display: "flex", flexDirection: "row", padding: "20px" }}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <TextField
            name="code"
            label="Code"
            size="small"
            style={{ width: "110px" }}
            value={inputValues.code}
            onChange={handleInputChange}
          />
          <TextField
            name="documentDate"
            label="Document Date"
            size="small"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={inputValues.documentDate}
            onChange={handleInputChange}
          />
          <TextField
            name="url"
            label="URL"
            size="small"
            value={inputValues.url}
            onChange={handleInputChange}
          />
          <TextField
            name="header"
            label="Header"
            size="small"
            value={inputValues.header}
            onChange={handleInputChange}
          />
          <TextField
            name="cashFlow"
            label="Cash Flow"
            size="small"
            value={inputValues.cashFlow}
            onChange={handleInputChange}
          />
          <TextField
            name="debtFlow"
            label="Debt Flow"
            size="small"
            value={inputValues.debtFlow}
            onChange={handleInputChange}
          />
          <TextField
            name="dollarSign"
            label="Dollar Sign"
            size="small"
            style={{ width: "110px" }}
            value={inputValues.dollarSign}
            onChange={handleInputChange}
          />
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={handleUpdate}
          >
            Submit
          </Button>
        </div>
        <FormControl size="small" style={{ width: "150px", marginLeft: "3vw" }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value)}
          >
            <MenuItem value="documentDate">Document Date</MenuItem>
            <MenuItem value="cashFlow">Cash Flow</MenuItem>
            <MenuItem value="debtFlow">Debt Flow</MenuItem>
          </Select>
        </FormControl>
          <Button
            variant="contained"
            color="success"
            size="medium"
            style={{ width: "60px", marginLeft:"3vw"}}
            onClick={downloadCsv}
          >
            <CloudDownloadIcon />
          </Button>
      </div>
      <TableContainer
        component={Paper}
        style={{ height: "80vh", overflow: "auto" }}
      >
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Cap</TableCell>
              <TableCell>Document Date</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Header</TableCell>
              <TableCell>Cash Flow</TableCell>
              <TableCell>Debt Flow</TableCell>
              <TableCell>Dollar Sign</TableCell>
              {/* <TableCell>Index</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedCompanies.map((company) => (
              <TableRow key={company.code}>
                <TableCell>{company.code}</TableCell>
                <TableCell>{company.name}</TableCell>
                <TableCell>
                  {`${
                    Math.round(
                      (company.market_cap / 1000000 + Number.EPSILON) * 1000
                    ) / 1000
                  } M` ?? ""}
                </TableCell>
                <TableCell>
                  {new Date(
                    company.cash?.document_date ?? ""
                  ).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <a
                    href={company.cash?.url ?? ""}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Link
                  </a>
                </TableCell>
                <TableCell>{company.cash?.header ?? ""}</TableCell>
                <TableCell>
                  {company.cash?.cash_flow && (
                    <span
                      style={{
                        color:
                          company.cash?.cap_cash_ratio_index <= -3.5
                            ? "red"
                            : company.cash?.cap_cash_ratio_index > -3.5 &&
                              company.cash?.cap_cash_ratio_index < -2
                            ? "orange"
                            : "inherit", // Default color
                      }}
                    >
                      {company.cash.cash_flow}
                    </span>
                  )}
                </TableCell>

                <TableCell>{company.cash?.debt_flow ?? ""}</TableCell>
                <TableCell>{company.cash?.dollar_sign ?? ""}</TableCell>
                {/* <TableCell>
                  {company.cash?.cap_cash_ratio_index ?? ""}
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000} // Close after 3 seconds
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }} // adjust position if needed
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};
