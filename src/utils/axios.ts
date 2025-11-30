import axios from "axios";
import { alertStore } from "../stores/AlertStore";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    "Access-Control-Allow-Origin": "*",
  }
})

axiosClient.interceptors.response.use(
  function (response) {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx causes this function to trigger
    if (error.response && error.response.status === 401) {
      // Handle unauthorized error, e.g., redirect to login
      console.log('Unauthorized, redirecting to login...');
      // window.location.href = '/login'; // Example redirect
    }

    if (error.response && error.response.data.error) {
      alertStore.showSnackbar(error.response.data.error, 'error');
      console.error('Server Error:', error.response.data.error);
      console.error('Status Code:', error.response.status);
    }
    return Promise.reject(error);
  }
);

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
    EDIT_DEPOSIT: "user-deposits/edit-deposit",
    DELETE: "user-deposits/delete-deposit",
  },
  USERS: {
    SIGN_UP: "users/sign-up",
    // VERIFY_EMAIL: "users/verify-email",
    SIGN_IN: "users/sign-in",
  },
}