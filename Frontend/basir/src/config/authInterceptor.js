import axios from "axios";

let refreshPromise = null;

const authClient = axios.create({
  baseURL: "https://multi-agent-system-final-project.onrender.com/api/auth",
  withCredentials: true,
});

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = authClient.post("/refresh").finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

export function attachAuthInterceptor(instance) {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;
      const code = error.response?.data?.code;

      if (
        error.response?.status === 401 &&
        code === "TOKEN_EXPIRED" &&
        original &&
        !original._retry
      ) {
        original._retry = true;
        try {
          await refreshAccessToken();
          return instance(original);
        } catch (refreshError) {
          window.dispatchEvent(new CustomEvent("auth:logout"));
          return Promise.reject(refreshError);
        }
      }

      if (error.response?.status === 401 && original?._retry) {
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }

      return Promise.reject(error);
    },
  );
  return instance;
}
