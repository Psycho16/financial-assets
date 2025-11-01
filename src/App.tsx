import { useEffect, useState } from 'react'
import './App.css'
import { AssetsPie } from './components/AssetsPie'
import { UnifiedAssetsList } from './components/UnifiedAssetsList'
import { ThemeToggle } from './components/ThemeToggle'
import { AppThemeProvider } from './contexts/ThemeContext'

import { Button, Box, Snackbar } from '@mui/material'
import { AddAssetsDialog } from './components/AddAssetsDialog'
import { axiosClient, PATHS } from './utils/axios'
import { BrowserRouter, useLocation, useSearchParams } from 'react-router-dom';

function AppContent() {
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false)
  const [showVerifyFinishAlert, setShowVerifyFinishAlert] = useState(false)
  const location = useLocation()

  const onCloseModal = () => {
    setIsAddingModalOpen(false)
  }

  const register = async () => {
    const resp = await axiosClient.post(PATHS.USERS.SIGN_UP, { email: "kondtantin.lobanov2000@gmail.com", password: "12345678" })
    console.log('resp', resp)
  }

  useEffect(() => {
    console.log("location", location)
    const { search } = location
    const params = new URLSearchParams(search)
    const token = params.get('hash')
    console.log("location token", location.hash.startsWith("#access_token="))
    const shouldShowSnackBar = location.hash.startsWith("#access_token=")
    setShowVerifyFinishAlert(shouldShowSnackBar)
  }, [])

  return (
    <div>
      <Snackbar
        open={showVerifyFinishAlert}
        autoHideDuration={6000}
        onClose={() => setShowVerifyFinishAlert(false)}
        message="Вы успешно подтвердили свой email адрес"
      // action={action}
      />
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
            <Button onClick={register}>Зарегистрировать</Button>
            { }
          </Box>
        </Box>
      </header>

      <AssetsPie />
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
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppThemeProvider>
  )
}

export default App
