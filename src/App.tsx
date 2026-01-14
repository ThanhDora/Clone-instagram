import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/Context/ThemeContext";
import { CreateDialogProvider } from "@/Context/CreateDialogContext";
import { NotificationsSheetProvider } from "@/Context/NotificationsSheetContext";
import { SearchSheetProvider } from "@/Context/SearchSheetContext";
import MainLayout from "./Layout/MainLayout";
import Login from "./Features/Auth/Login";
import Register from "./Features/Auth/Register";
import VerifyEmail from "./Features/Auth/VerifyEmail";
import ProtectedRoute from "./Components/ProtectedRoute";

const Home = lazy(() => import("./Page/Home"));
const SearchSheet = lazy(() => import("./Page/Search"));
const Explore = lazy(() => import("./Page/Explore"));
const Reels = lazy(() => import("./Page/Reels"));
const NotificationsSheet = lazy(() => import("./Page/Notifications"));
const Messages = lazy(() => import("./Page/Messages"));
const CreateDialog = lazy(() => import("./Page/Create"));
const UserProfile = lazy(() => import("./Page/UserProfile"));
const FloatingMessages = lazy(() => import("./Components/FloatingMessages"));
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
                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    path="/"
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Home />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/explore"
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Explore />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/reels"
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Reels />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/messages"
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Messages />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <UserProfile />
                      </Suspense>
                    }
                  />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Suspense fallback={null}>
                <CreateDialog />
                <NotificationsSheet />
                <SearchSheet />
                <FloatingMessages />
              </Suspense>
            </BrowserRouter>
          </SearchSheetProvider>
        </NotificationsSheetProvider>
      </CreateDialogProvider>
    </ThemeProvider>
  );
}
