import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';
import { AuthProvider } from './AuthContext.jsx'

const theme = extendTheme({})
createRoot(document.getElementById('root')).render(
  
  
  <StrictMode>
    <AuthProvider>
    <BrowserRouter>
    <ChakraProvider theme={theme}>
    <App /></ChakraProvider></BrowserRouter></AuthProvider>
  </StrictMode>,
)