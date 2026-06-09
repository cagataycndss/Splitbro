import axios from "axios";
import { getToken } from "../utils/token";

// .env dosyasından API URL'ini çekiyoruz
const baseURL = process.env.EXPO_PUBLIC_API_URL;

const client = axios.create({
  baseURL: baseURL,
  timeout: 60000, // 60 saniye (Yapay Zeka işlemleri bazen 20-30 saniye sürebilir)
});

// Request Interceptor: Her istekten önce araya girer ve token varsa header'a ekler
client.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default client;
