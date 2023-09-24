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
} from "@mui/material";
import api from "../utils/api";

export const Stock = () => {
  const [data, setData] = useState([]);

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
  }, []);

  return (
    <div>
      <HeaderBar />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Market Cap</TableCell>
              <TableCell>Last Price</TableCell>
              <TableCell>Change in Percent</TableCell>
              <TableCell>Volume</TableCell>
              <TableCell>Cash Flow</TableCell>
              <TableCell>Debt Flow</TableCell>
              <TableCell>Dollar Sign</TableCell>
              <TableCell>Industry</TableCell>
              <TableCell>Mining Comp</TableCell>
              <TableCell>Commodities</TableCell>
              <TableCell>Bid Price</TableCell>
              <TableCell>Offer Price</TableCell>
              <TableCell>Previous Close Price</TableCell>
              <TableCell>Average Daily Volume</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.code}>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.market_cap}</TableCell>
                <TableCell>{row.last_price}</TableCell>
                <TableCell>{row.change_in_percent}</TableCell>
                <TableCell>{row.volume}</TableCell>
                <TableCell>{row.cash.cash_flow}</TableCell>
                <TableCell>{row.cash.debt_flow}</TableCell>
                <TableCell>{row.cash.dollar_sign}</TableCell>
                <TableCell>{row.industry}</TableCell>
                <TableCell>{row.isMiningComp ? "Yes" : "No"}</TableCell>
                <TableCell>{row.commodities}</TableCell>
                <TableCell>{row.bid_price}</TableCell>
                <TableCell>{row.offer_price}</TableCell>
                <TableCell>{row.previous_close_price}</TableCell>
                <TableCell>{row.average_daily_volume}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
