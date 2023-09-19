import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { HeaderBar } from '../components/HeaderBar';
import api from '../utils/api'; // Import your API helper function

export const Cash = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    api.get('/api/cashflow/companies')  
      .then(response => {
        console.log("API Response:", response.data); // log the response
        setCompanies(response.data);
      })
      .catch(error => console.error('Failed to fetch companies:', error));
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
              <TableCell>Cap</TableCell>
              <TableCell>Document Date</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Header</TableCell>
              <TableCell>Cash Flow</TableCell>
              <TableCell>Debt Flow</TableCell>
              <TableCell>Dollar Sign</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.code}>
                <TableCell>{company.code}</TableCell>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.cash.cap}</TableCell>
                <TableCell>{new Date(company.cash.document_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <a href={company.cash.url} target="_blank" rel="noopener noreferrer">Link</a>
                </TableCell>
                <TableCell>{company.cash.header}</TableCell>
                <TableCell>{company.cash.cash_flow}</TableCell>
                <TableCell>{company.cash.debt_flow}</TableCell>
                <TableCell>{company.cash.dollar_sign}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
