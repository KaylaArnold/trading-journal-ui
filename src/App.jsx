import Analytics from "./pages/Analytics";
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DailyLogs from "./pages/DailyLogs";
import DailyLogDetail from "./pages/DailyLogDetail";
import Header from "./components/Header";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <>
      <Header onLogout={() => setLoggedIn(false)} />
      <Routes>
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/" element={<Navigate to="/daily-logs" />} />
        <Route path="/daily-logs" element={<DailyLogs />} />
        <Route path="/daily-logs/:id" element={<DailyLogDetail />} />
      </Routes>
    </>
  );
}

export default App;
