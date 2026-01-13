import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/Context/ThemeContext";
import { CreateDialogProvider } from "@/Context/CreateDialogContext";
import { NotificationsSheetProvider } from "@/Context/NotificationsSheetContext";
import { SearchSheetProvider } from "@/Context/SearchSheetContext";
import MainLayout from "./Layout/MainLayout";
import Login from "./Features/Auth/Login";
import Register from "./Features/Auth/Register";
import Home from "./Page/Home";
import SearchSheet from "./Page/Search";
import Explore from "./Page/Explore";
import Reels from "./Page/Reels";
import NotificationsSheet from "./Page/Notifications";
import Messages from "./Page/Messages";
import CreateDialog from "./Page/Create";
import UserProfile from "./Page/UserProfile";
import FloatingMessages from "./Components/FloatingMessages";
// import ProtectedRoute from "./Components/ProtectedRoute";

export default function App() {
  return (
    <ThemeProvider>
      <CreateDialogProvider>
        <NotificationsSheetProvider>
          <SearchSheetProvider>
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
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/reels" element={<Reels />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/profile" element={<UserProfile />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <CreateDialog />
              <NotificationsSheet />
              <SearchSheet />
              <FloatingMessages />
            </BrowserRouter>
          </SearchSheetProvider>
        </NotificationsSheetProvider>
      </CreateDialogProvider>
    </ThemeProvider>
  );
}
