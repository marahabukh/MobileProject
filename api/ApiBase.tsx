// api/ApiBase.ts
import axios from "axios";

export const API_URL = "https://firestore.googleapis.com/v1/projects/electrowebapp-6bf19/databases/(default)/documents";

const handleErrors = (error: { response: { status: number } }) => {
  if (error?.response?.status === 401) {
    console.log("Unauthorized");
  }
  if (error?.response?.status === 403) {
    console.log("Forbidden");
  }
  return Promise.reject(error);
};

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  handleErrors
);

export default axiosInstance;