import React from 'react'
import { Typography } from '@mui/material'
import { Button} from '@mui/material'
import { HeaderBar } from '../components/HeaderBar'

export const Cash = () => {
  return (
    <div>
      <HeaderBar />
        <Typography variant='h1'>
            Cashflow
        </Typography>
        <Button variant = 'contained'> Update Cashflow </Button>
    </div>
  )
}
