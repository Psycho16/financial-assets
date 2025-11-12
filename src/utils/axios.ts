import axios from "axios";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    "Access-Control-Allow-Origin": "*",
  }
})

export const PATHS = {
  ACCEPTED_ASSETS: "accepted-assets",
  USER_ASSETS: {
    GET_ASSETS: "user-assets/",
    EDIT_QUANTITY: "user-assets/edit-asset-quantity",
  },
  USERS: {
    SIGN_UP: "users/sign-up",
    // VERIFY_EMAIL: "users/verify-email",
    SIGN_IN: "users/sign-in",
    ADD_ASSET: "users/add-asset",
  },
}