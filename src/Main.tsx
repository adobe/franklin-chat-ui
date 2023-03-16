import './Main.css';
import ChatComponent from './ChatComponent';
import Login from './Login'

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthRoute from './auth/AuthRoute';

export function Main() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/" element={
          <AuthRoute>
            <ChatComponent />
          </AuthRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
