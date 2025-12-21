import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // needed for next-auth session cookies
});

export default api;
