import React, { useState, useEffect } from "react";
import { HeaderBar } from "../components/HeaderBar";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import api from "../utils/api";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

export const Stock = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState({
    code: true,
    name: true,
    marketCap: true,
    lastPrice: true,
    changeInPercent: true,
    volume: true,
    cashFlow: true,
    debtFlow: true,
    dollarSign: true,
    industry: true,
    isMiningComp: true,
    commodities: false,
    bidPrice: false,
    offerPrice: false,
    previousClosePrice: false,
    averageDailyVolume: false,
    helper4C: false,
  });
  const [sortColumn, setSortColumn] = useState("market_cap");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' for descending, 'asc' for ascending
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get("/api/stocks/getStocks");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
    getLastUpdate();
  }, []);

  const getLastUpdate = async () => {
    try {
      const response = await api.get("/api/stocks/getLastUpdate");
      setLastUpdated(response.data.updatedAt);
    } catch (error) {
      console.error("Failed to fetch last update:", error.message || error);
    }
  };

  function getNumericValue(item, column) {
    if (column === "change_in_percent") {
      return parseFloat(item[column].replace("%", ""));
    }

    if (column.includes("cash")) {
      if (typeof item.cash === "object" && item.cash !== null) {
        const attribute = column.split(".")[1];

        if (item.cash.hasOwnProperty(attribute)) {
          const value = item.cash[attribute];
          return value === null || value === "check" ? null : parseFloat(value);
        }
      }
      return null; // Return null for missing attributes
    }

    return item[column];
  }
  const downloadCsv = () => {
    // Define the columns and their headers in the data
    const headers = [
      'Code', 'Name', 'Market Cap', 'Last Price', 'Change in Percent',
      'Volume', 'Cash Flow', 'Debt Flow', 'Dollar Sign', 'Document Date', 
      'URL', 'Header', 'Industry', 'Mining Comp', 'Commodities', 'Bid Price', 
      'Offer Price', 'Previous Close Price', 'Average Daily Volume'
      // ... add other headers as necessary
    ];
  
    // Start with the headers, joined by commas
    const csvRows = [headers.join(',')]; 
  
    // Add rows for each entry in the filteredData
    filteredData.forEach((row) => {
      // Map each row's values to the CSV format, with proper formatting applied
      const csvRow = [
        `"${row.code}"`,
        `"${row.name}"`,
        `"${row.market_cap ? `${(row.market_cap / 1000000).toFixed(3)} M` : ''}"`,
        `"${row.last_price?? ""}"`,
        `"${row.change_in_percent}"`,
        `"${row.volume?? ""}"`,
        `"${row.cash?.cash_flow?? ""}"`,
        `"${row.cash?.debt_flow?? ""}"`,
        `"${row.cash?.dollar_sign?? ""}"`,
        `"${row.cash?.document_date ? new Date(row.cash.document_date).toLocaleDateString() : ''}"`,
        `"${row.cash?.url ?? ""}"`,
        `"${row.cash?.header?? ""}"`,
        `"${row.industry?? ""}"`,
        `"${row.is_mining_comp?? ""}"`,
        `"${row.commodities?? ""}"`,
        `"${row.bid_price?? ""}"`,
        `"${row.offer_price?? ""}"`,
        `"${row.previous_close_price?? ""}"`,
        `"${row.average_daily_volume?? ""}"`
        // ... add other row values as necessary
      ].join(',');
  
      // Add the csvRow to the csvRows array
      csvRows.push(csvRow);
    });
  
    // Generate CSV string
    const csvString = csvRows.join('\n');
  
   
  // Create a Blob from the CSV String
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  // Create link and trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Cleanup the URL object
  URL.revokeObjectURL(url);
  };
  
  
  // Use this function as the click handler for your CSV download button
  

  useEffect(() => {
    setFilteredData(data); // Whenever the data changes, reset the filteredData
  }, [data]);

  const handleSearch = () => {
    let newFilteredData = [...data];

    if (searchTerm.trim() !== "") {
      newFilteredData = newFilteredData.filter(
        (item) =>
          (item.industry &&
            item.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.commodities &&
            item.commodities.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredData(newFilteredData);
  };
  useEffect(() => {
    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = getNumericValue(a, sortColumn);
      const bValue = getNumericValue(b, sortColumn);

      if (aValue === null) return 1;
      if (bValue === null) return -1;

      return sortOrder === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    });

    setFilteredData(sortedData);
    // eslint-disable-next-line
  }, [sortColumn, sortOrder]);

  return (
    <div style={{ padding: "12px" }}>
      <HeaderBar />
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <FormControl
          variant="outlined"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
            margin: "12px 0",
          }}
        >
          <FormLabel>Sort By</FormLabel>
          <Select
            value={sortColumn}
            onChange={(e) => setSortColumn(e.target.value)}
            style={{ height: "36px" }}
          >
            <MenuItem value="market_cap">Market Cap</MenuItem>
            <MenuItem value="change_in_percent">Change in Percent</MenuItem>
            <MenuItem value="volume">Volume</MenuItem>
            <MenuItem value="cash.cash_flow">Cash Flow</MenuItem>
            <MenuItem value="cash.debt_flow">Debt Flow</MenuItem>
          </Select>
        </FormControl>

        <FormControl
          component="fieldset"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
            margin: "12px 0",
          }}
        >
          <RadioGroup
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            row
          >
            <FormControlLabel
              value="desc"
              control={<Radio />}
              label="Descending"
            />
            <FormControlLabel
              value="asc"
              control={<Radio />}
              label="Ascending"
            />
          </RadioGroup>
        </FormControl>
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "12px 0",
          }}
        >
          <TextField
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            style={{ height: "24px" }}
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
        {lastUpdated && (
          <Alert style={{ marginLeft: "10px" }}>
            Last Updated: {new Date(lastUpdated).toLocaleString()}
          </Alert>
        )}
        <Button
            variant="contained"
            color="success"
            size="medium"
            style={{ width: "60px", marginLeft:"10px"}}
            onClick={() => downloadCsv()}
          >
            <CloudDownloadIcon />
          </Button>
      </div>

      <ToggleButtonGroup
        value={Object.keys(columns).filter((key) => columns[key])}
        onChange={(_, newValue) => {
          const newColumnsState = { ...columns };
          Object.keys(newColumnsState).forEach((key) => {
            newColumnsState[key] = newValue.includes(key);
          });
          setColumns(newColumnsState);
        }}
        multiple
        style={{ padding: "12px" }}
        size="small"
      >
        <ToggleButton value="code" color="primary">
          Code
        </ToggleButton>
        <ToggleButton value="name" color="primary">
          Name
        </ToggleButton>
        <ToggleButton value="marketCap" color="primary">
          Market Cap
        </ToggleButton>
        <ToggleButton value="lastPrice" color="primary">
          Last Price
        </ToggleButton>
        <ToggleButton value="changeInPercent" color="primary">
          Change in Percent
        </ToggleButton>
        <ToggleButton value="volume" color="primary">
          Volume
        </ToggleButton>
        <ToggleButton value="cashFlow" color="primary">
          Cash Flow
        </ToggleButton>
        <ToggleButton value="debtFlow" color="primary">
          Debt Flow
        </ToggleButton>
        <ToggleButton value="dollarSign" color="primary">
          Dollar Sign
        </ToggleButton>
        <ToggleButton value="industry" color="primary">
          Industry
        </ToggleButton>
        <ToggleButton value="isMiningComp" color="primary">
          Mining Comp
        </ToggleButton>
        <ToggleButton value="commodities" color="primary">
          Commodities
        </ToggleButton>
        <ToggleButton value="bidPrice" color="primary">
          Bid Price
        </ToggleButton>
        <ToggleButton value="offerPrice" color="primary">
          Offer Price
        </ToggleButton>
        <ToggleButton value="previousClosePrice" color="primary">
          Previous Close Price
        </ToggleButton>
        <ToggleButton value="averageDailyVolume" color="primary">
          Average Daily Volume
        </ToggleButton>
        <ToggleButton value="helper4C" color="secondary">
          4C Helper
        </ToggleButton>
      </ToggleButtonGroup>
      <TableContainer
        component={Paper}
        style={{ height: "75vh", overflow: "auto" }}
      >
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              {columns.code && <TableCell>Code</TableCell>}
              {columns.name && <TableCell>Name</TableCell>}
              {columns.marketCap && <TableCell>Market Cap</TableCell>}
              {columns.lastPrice && <TableCell>Last Price</TableCell>}
              {columns.changeInPercent && (
                <TableCell>Change in Percent</TableCell>
              )}
              {columns.volume && <TableCell>Volume</TableCell>}
              {columns.cashFlow && <TableCell>Cash Flow</TableCell>}
              {columns.debtFlow && <TableCell>Debt Flow</TableCell>}
              {columns.dollarSign && <TableCell>Dollar Sign</TableCell>}
              {columns.helper4C && (
                <>
                  <TableCell>Document Date</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Header</TableCell>
                </>
              )}
              {columns.industry && <TableCell>Industry</TableCell>}
              {columns.isMiningComp && <TableCell>Mining Comp</TableCell>}
              {columns.commodities && <TableCell>Commodities</TableCell>}
              {columns.bidPrice && <TableCell>Bid Price</TableCell>}
              {columns.offerPrice && <TableCell>Offer Price</TableCell>}
              {columns.previousClosePrice && (
                <TableCell>Previous Close Price</TableCell>
              )}
              {columns.averageDailyVolume && (
                <TableCell>Average Daily Volume</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.code}>
                {columns.code && <TableCell>{row.code}</TableCell>}
                {columns.name && <TableCell>{row.name}</TableCell>}
                {columns.marketCap && (
                  <TableCell>
                    {Math.round(
                      (row.market_cap / 1000000 + Number.EPSILON) * 1000
                    ) / 1000}
                    M
                  </TableCell>
                )}
                {columns.lastPrice && <TableCell>{row.last_price}</TableCell>}
                {columns.changeInPercent && (
                  <TableCell>{row.change_in_percent}</TableCell>
                )}
                {columns.volume && <TableCell>{row.volume}</TableCell>}
                {columns.cashFlow && (
                  <TableCell>{row.cash?.cash_flow ?? ""}</TableCell>
                )}
                {columns.debtFlow && (
                  <TableCell>{row.cash?.debt_flow ?? ""}</TableCell>
                )}
                {columns.dollarSign && (
                  <TableCell>{row.cash?.dollar_sign ?? ""}</TableCell>
                )}
                {columns.helper4C && (
                  <>
                    <TableCell>
                      {new Date(
                        row.cash?.document_date ?? ""
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {
                        <a
                          href={row.cash?.url ?? ""}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Link
                        </a>
                      }
                    </TableCell>
                    <TableCell>{row.cash?.header ?? ""}</TableCell>
                  </>
                )}
                {columns.industry && <TableCell>{row.industry}</TableCell>}
                {columns.isMiningComp && (
                  <TableCell>{row.isMiningComp ? "Yes" : "No"}</TableCell>
                )}
                {columns.commodities && (
                  <TableCell>{row.commodities}</TableCell>
                )}
                {columns.bidPrice && <TableCell>{row.bid_price}</TableCell>}
                {columns.offerPrice && <TableCell>{row.offer_price}</TableCell>}
                {columns.previousClosePrice && (
                  <TableCell>{row.previous_close_price}</TableCell>
                )}
                {columns.averageDailyVolume && (
                  <TableCell>{row.average_daily_volume}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
