import { useEffect, useState } from 'react'
import './App.css'
import { AssetsPie } from './components/AssetsPie'
import { UnifiedAssetsList } from './components/UnifiedAssetsList'
import { ThemeToggle } from './components/ThemeToggle'
import { AppThemeProvider } from './contexts/ThemeContext'

import { Button, Box, Snackbar, TextField, Typography } from '@mui/material'
import { AddAssetsDialog } from './components/AddAssetsDialog'
import { axiosClient, PATHS } from './utils/axios'
import { BrowserRouter, useLocation } from 'react-router-dom';
import { USER_ID_KEY } from './constants/localStorage'
import GlobalSnackbar from './components/GlobalSnackbar'


const LoginScreen = ({ setIsLoggedIn }: { setIsLoggedIn: (isLoggedIn: boolean) => void }) => {
  const [isLoginStage, setIsLoginStage] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const register = async () => {
    const resp = await axiosClient.post(PATHS.USERS.SIGN_UP, { email, password })
    const userId = resp.data?.user?.id
    localStorage.setItem(USER_ID_KEY, userId)
    setIsLoggedIn(true)
  }

  const login = async () => {
    // kondtantin.lobanov2000@gmail.com
    const resp = await axiosClient.post(PATHS.USERS.SIGN_IN, { email, password })
    const userId = resp.data?.session?.user?.id
    localStorage.setItem(USER_ID_KEY, userId)
    setIsLoggedIn(true)
  }

  return (
    <Box
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
      minHeight={"60vh"}
      minWidth={"350px"}
    >
      <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        rowGap={"10px"}
        width={"100%"}
      >
        <Typography fontWeight={"bold"}>Financial Assets</Typography>
        <TextField type="email" fullWidth label="Email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Введите email" size="medium" />
        <TextField type="password" fullWidth label="Пароль" value={password} onChange={e => setPassword(e.target.value)} placeholder="Введите пароль" size="medium" />
        {isLoginStage ?
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            rowGap={"20px"}
          >
            <Button variant="contained" onClick={login} size="large">Войти</Button>
            <Button variant="text" size="small" onClick={() => setIsLoginStage(false)}>Еще нет аккаунта? Зарегистрироваться</Button>
          </Box>
          :
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            rowGap={"20px"}
          >
            <Button variant="contained" onClick={register} size="large">Зарегистрировать</Button>
            <Button variant="text" size="small" onClick={() => setIsLoginStage(true)}>Уже есть аккаунт? Войти</Button>
          </Box>
        }
      </Box>
    </Box>
  )
}
function AppContent() {
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false)
  const [showVerifyFinishAlert, setShowVerifyFinishAlert] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem(USER_ID_KEY))
  const location = useLocation()

  const onCloseModal = () => {
    setIsAddingModalOpen(false)
  }

  const leave = async () => {
    localStorage.setItem(USER_ID_KEY, "")
    setIsLoggedIn(false)
  }

  useEffect(() => {
    const shouldShowSnackBar = location.hash.startsWith("#access_token=")
    setShowVerifyFinishAlert(shouldShowSnackBar)
  }, [])

  return (
    <>
      {!isLoggedIn ? <LoginScreen setIsLoggedIn={setIsLoggedIn} /> :
        <div>
          <Snackbar
            open={showVerifyFinishAlert}
            autoHideDuration={6000}
            onClose={() => setShowVerifyFinishAlert(false)}
            message="Вы успешно подтвердили свой email адрес"
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
                <Button onClick={leave}>Выйти</Button>
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
      }
    </>
  )
}

function App() {
  return (
    <AppThemeProvider>
      <BrowserRouter>
        <AppContent />
        <GlobalSnackbar />
      </BrowserRouter>
    </AppThemeProvider>
  )
}

export default App
