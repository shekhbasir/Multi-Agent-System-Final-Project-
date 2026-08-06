import axios from "axios";

const opportunityApi = axios.create({
  baseURL:
    "https://multi-agent-system-final-project.onrender.com/api/opportunities",
  withCredentials: true,
});

export default opportunityApi;
