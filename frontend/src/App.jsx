import './App.css'
import {Route, Routes } from "react-router-dom";
import Home from './pages/home/Home'
import AuthCallbackPage from './pages/auth-callback/AuthCallbackPage'
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import Emotion from './pages/emotion/Emotion';

function App() {
  
  return (
    <>
      <Routes>
        <Route path='/' element = {<Home/>}/>
        <Route path='/sso-callback' element = {<AuthenticateWithRedirectCallback
          signUpForceRedirectUrl={"/auth-callback"}
        />}/>
        <Route path='/auth-callback' element = {<AuthCallbackPage/>}/>
        <Route path='/emotion' element = {<Emotion/>}/>
      </Routes>
    </>
  )
}

export default App
