import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

const httpsRequest = axios.create({
  baseURL,
});

httpsRequest.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

let isRefresh = false; // chỉ cho phép refresh token với thằng đầu tiên được chạy vào với lỗi 401
let listener = []; // mảng chứa các api lỗi cần được gọi lại

httpsRequest.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const refreshToken = localStorage.getItem("refresh_token");
    const checkRenewToken = refreshToken && error.response?.status === 401; // kiểm tra xem có quyền refresh hay không

    if (checkRenewToken) {
      if (!isRefresh) {
        isRefresh = true; // chặn không cho refresh nữa

        try {
          const token = await axios.post(`${baseURL}/api/auth/refresh-token`, {
            refreshToken: refreshToken,
          });

          // accessToken và refreshToken sửa lại tương ứng api structure mới
          localStorage.setItem("token", token.data.data.accessToken);
          localStorage.setItem("refresh_token", token.data.data.refreshToken);

          listener.forEach((item) => item()); // gọi lại những api bị lỗi vào sau

          listener = [];
          isRefresh = false;
          return httpsRequest(error.config); // gọi lại api lỗi được phản hồi đầu tiên
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");

          listener = [];
          isRefresh = false;
        }
      } else {
        return new Promise((resolve) => {
          listener.push(() => {
            resolve(httpsRequest(error.config)); // những api phản hồi chậm hơn sẽ được push vào mảng trong trạng thái pending
          });
        });
      }
    }

    return Promise.reject(error);
  }
);

export default httpsRequest;
