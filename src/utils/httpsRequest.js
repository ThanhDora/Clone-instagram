import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

const httpsRequest = axios.create({
  baseURL,
});

let isRefresh = false;
let listener = []; // Queue các request đang chờ refresh
let failedRefresh = false;

httpsRequest.interceptors.request.use((config) => {
  // Đọc token từ cả hai key để tương thích
  const token =
    localStorage.getItem("token") || localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    failedRefresh = false; // Reset flag khi có token hợp lệ
  }

  return config;
});

httpsRequest.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refresh_token");
    const shouldRefresh =
      refreshToken &&
      error.response?.status === 401 &&
      !failedRefresh &&
      !originalRequest._retry;

    if (shouldRefresh) {
      if (!isRefresh) {
        isRefresh = true;
        originalRequest._retry = true; // Đánh dấu để tránh lặp

        try {
          const tokenResponse = await axios.post(
            `${baseURL}/auth/refresh-token`, // Đã có /api trong baseURL
            {
              refreshToken: refreshToken,
            }
          );

          if (!tokenResponse.data?.success) {
            throw new Error("Refresh token failed");
          }

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            tokenResponse.data.data;

          // Lưu cả token và access_token để tương thích
          localStorage.setItem("token", newAccessToken);
          localStorage.setItem("access_token", newAccessToken);
          localStorage.setItem("refresh_token", newRefreshToken);

          // Resolve tất cả request đang chờ
          listener.forEach((resolve) => resolve());
          listener = [];

          isRefresh = false;
          failedRefresh = false;

          // Retry request gốc với token mới
          return httpsRequest(originalRequest);
        } catch (refreshError) {
          failedRefresh = true;
          isRefresh = false;

          // Xóa token và redirect login
          localStorage.removeItem("token");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user"); // nếu bạn lưu user

          // Reject tất cả request đang chờ
          listener.forEach((reject) => reject(refreshError));
          listener = [];

          // Redirect về login (chỉnh path nếu cần)
          window.location.href = "/login";

          return Promise.reject(refreshError);
        }
      } else {
        // Nếu đang refresh, queue request này lại
        return new Promise((resolve, reject) => {
          listener.push(() => {
            if (failedRefresh) {
              reject(error);
            } else {
              resolve(httpsRequest(originalRequest));
            }
          });
        });
      }
    }

    return Promise.reject(error);
  }
);

export default httpsRequest;
