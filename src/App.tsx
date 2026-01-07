import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/Context/ThemeContext";
// import ProtectedRoute from "./Components/ProtectedRoute";
import MainLayout from "./Layout/MainLayout";
import Login from "./Features/Auth/Login";
import Register from "./Features/Auth/Register";
import Home from "./Page/Home";
import Search from "./Page/Search";
import Explore from "./Page/Explore";
import Reels from "./Page/Reels";
import Notifications from "./Page/Notifications";
import Messages from "./Page/Messages";
import Create from "./Page/Create";
import UserProfile from "./Page/UserProfile";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={
              // <ProtectedRoute>
              <MainLayout />
              // </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/reels" element={<Reels />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/create" element={<Create />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
