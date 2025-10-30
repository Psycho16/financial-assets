import axios from "axios";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
})

export const PATHS = {
  ACCEPTED_ASSETS: "accepted-assets"
}