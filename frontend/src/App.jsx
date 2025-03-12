import './App.css'
import {Route, Routes } from "react-router-dom";
import Home from './pages/home/Home'
import AuthCallbackPage from './pages/auth-callback/AuthCallbackPage'
import { axiosInstance } from './lib/axios';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

function App() {
  const getsomedata = async() => {
    const res = await axiosInstance.get("/users", {
      headers:{
    "Authorization": `Bearer ${token}`
     }
  });
  
}
  return (
    <>
      <Routes>
        <Route path='/' element = {<Home/>}/>
        <Route path='/sso-callback' element = {<AuthenticateWithRedirectCallback
          signUpForceRedirectUrl={"/auth-callback"}
        />}/>
        <Route path='/auth-callback' element = {<AuthCallbackPage/>}/>
      </Routes>
    </>
  )
}

export default App
