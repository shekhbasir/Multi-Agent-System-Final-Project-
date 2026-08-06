import axios from "axios";

const opportunityApi = axios.create({
  baseURL: "http://localhost:7000/api/opportunities",
  withCredentials: true,
});

export default opportunityApi;
