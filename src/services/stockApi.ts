import axios from "axios";
import type { StockData } from '../types/stock';
import { mockStockData } from '../mock/stockData';

const API_BASE = "http://20.244.56.144/evaluation-service";

const authPayload = {
  email: "manursaketh@gmail.com",
  name: "saketh manur",
  rollNo: "22q61a05c3",
  accessCode: "dJFufE",
  clientID: "e82f01ab-eef7-4078-b4f4-fa352da9830a",
  clientSecret: "HDNbbMACKuaBVbyY"
};

// Create axios instance with default config
// const api = axios.create({
//     baseURL: 'http://20.244.56.144/evaluation-service',
//     headers: {
//         'Content-Type': 'application/json'
//     }
// });

// let authToken: string | null = null;

export const stockApi = {
    getStocks: async (): Promise<StockData[]> => {
        try {
            const authResponse = await axios.post(`${API_BASE}/auth`, authPayload);
            const token = authResponse.data.access_token;
            const stockResponse = await axios.get(`${API_BASE}/stocks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("API Stock Response:", stockResponse.data);
            // If API returns valid data, use it
            if (Array.isArray(stockResponse.data) && stockResponse.data.length > 0) {
                return stockResponse.data;
            }
            // Otherwise, fall back to mock data
            return mockStockData;
        } catch (err: any) {
            console.error("❌ Error fetching data, using mock data:", err.response?.data || err.message);
            return mockStockData;
        }
    }
};
