import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DailyLogs from "./pages/DailyLogs";
import DailyLogDetail from "./pages/DailyLogDetail";
import Analytics from "./pages/Analytics";
import Header from "./components/Header";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  if (!loggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setLoggedIn(true)} />} />
        <Route path="/register" element={<Register onRegister={() => setLoggedIn(true)} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <>
      <Header onLogout={() => setLoggedIn(false)} />
      <Routes>
        <Route path="/" element={<Navigate to="/daily-logs" />} />
        <Route path="/daily-logs" element={<DailyLogs />} />
        <Route path="/daily-logs/:id" element={<DailyLogDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/daily-logs" />} />
      </Routes>
    </>
  );
}

export default App;
