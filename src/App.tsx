import { useState } from 'react'
import './App.css'
import { AssetsPie } from './components/AssetsPie'
import { UnifiedAssetsList } from './components/UnifiedAssetsList'
import { ThemeToggle } from './components/ThemeToggle'
import { AppThemeProvider } from './contexts/ThemeContext'

import { Button, Box } from '@mui/material'
import { AddAssetsDialog } from './components/AddAssetsDialog'

function AppContent() {
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false)

  const onCloseModal = () => {
    setIsAddingModalOpen(false)
  }

  return (
    <div>
      <header>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <h1>Мои активы</h1>
          <Box display="flex" alignItems="center" gap={1}>
            <ThemeToggle />
            <Button
              variant="contained"
              onClick={() => setIsAddingModalOpen(true)}
            >
              Добавить актив
            </Button>
          </Box>
        </Box>
      </header>
      {/* <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}> */}

      <AssetsPie />
      {/* </div> */}
      <AddAssetsDialog open={isAddingModalOpen} onClose={onCloseModal} />
      <h2 style={{ marginTop: 20 }}>Портфель активов</h2>
      <div style={{ marginTop: 12 }}>
        <UnifiedAssetsList />
      </div>
    </div>
  )
}

function App() {
  return (
    <AppThemeProvider>
      <AppContent />
    </AppThemeProvider>
  )
}

export default App
