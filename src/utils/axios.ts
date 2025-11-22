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
    ADD: "user-assets/add-asset",
    GET: "user-assets/",
    EDIT_QUANTITY: "user-assets/edit-asset-quantity",
    EDIT_ASSET: "user-assets/edit-asset",
    DELETE: "user-assets/delete-asset",
  },
  USER_DEPOSITS: {
    ADD: "user-deposits/add-deposit",
    GET: "user-deposits/",
    EDIT_AMOUNT: "user-deposits/edit-deposit-amount",
    DELETE: "user-deposits/delete-deposit",
  },
  USERS: {
    SIGN_UP: "users/sign-up",
    // VERIFY_EMAIL: "users/verify-email",
    SIGN_IN: "users/sign-in",
  },
}