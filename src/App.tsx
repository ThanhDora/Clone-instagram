import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/Context/ThemeContext";
import { CreateDialogProvider } from "@/Context/CreateDialogContext";
import { NotificationsSheetProvider } from "@/Context/NotificationsSheetContext";
import { SearchSheetProvider } from "@/Context/SearchSheetContext";
import { SocketProvider } from "@/Context/SocketContext";
import { NavigationProvider } from "@/Context/NavigationContext";
import MainLayout from "./Layout/MainLayout";
import Login from "./Features/Auth/Login";
import Register from "./Features/Auth/Register";
import VerifyEmail from "./Features/Auth/VerifyEmail";
import GoogleCallback from "./Features/Auth/GoogleCallback";
import ProtectedRoute from "./Components/ProtectedRoute";
import Loading from "./Components/Loading";
import NavigationOverlay from "./Components/NavigationOverlay";

const Home = lazy(() => import("./Page/Home"));
const SearchSheet = lazy(() => import("./Page/Search"));
const Explore = lazy(() => import("./Page/Explore"));
const Reels = lazy(() => import("./Page/Reels"));
const NotificationsSheet = lazy(() => import("./Page/Notifications"));
const Messages = lazy(() => import("./Page/Messages"));
const CreateDialog = lazy(() => import("./Page/Create"));
const UserProfile = lazy(() => import("./Page/UserProfile"));
const EditProfile = lazy(() => import("./Page/EditProfile"));
const Follow = lazy(() => import("./Page/Follow"));
// import ProtectedRoute from "./Components/ProtectedRoute";

export default function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <CreateDialogProvider>
          <NotificationsSheetProvider>
            <SearchSheetProvider>
              <NavigationProvider>
                <BrowserRouter>
                  <Loading />
                  <NavigationOverlay />
                  <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/verify-email/:token"
                    element={<VerifyEmail />}
                  />
                  <Route
                    path="/auth/google/callback"
                    element={<GoogleCallback />}
                  />
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
                        <Suspense fallback={<Loading />}>
                          <Home />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/explore"
                      element={
                        <Suspense fallback={<Loading />}>
                          <Explore />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/reels"
                      element={
                        <Suspense fallback={<Loading />}>
                          <Reels />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/messages"
                      element={
                        <Suspense fallback={<Loading />}>
                          <Messages />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/profile/:username"
                      element={
                        <Suspense fallback={<Loading />}>
                          <UserProfile />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <Suspense fallback={<Loading />}>
                          <UserProfile />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/edit-profile"
                      element={
                        <Suspense fallback={<Loading />}>
                          <EditProfile />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/post/:postId"
                      element={
                        <Suspense fallback={<Loading />}>
                          <Home />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/followers/:username?"
                      element={
                        <Suspense fallback={<Loading />}>
                          <Follow />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/followers"
                      element={
                        <Suspense fallback={<Loading />}>
                          <Follow />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/following/:username?"
                      element={
                        <Suspense fallback={<Loading />}>
                          <Follow />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/following"
                      element={
                        <Suspense fallback={<Loading />}>
                          <Follow />
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
                </Suspense>
                </BrowserRouter>
              </NavigationProvider>
            </SearchSheetProvider>
          </NotificationsSheetProvider>
        </CreateDialogProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}
