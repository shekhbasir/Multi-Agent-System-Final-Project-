import express from "express";
import { isAuth } from "../middleware/isAuthenticated.js";
import {
  Registeruser,
  LoginUser,
  logoutUser,
  alldata,
  refreshAccessToken,
} from "../controller/authController.js";

const routes = express.Router();

routes.post("/register", Registeruser);
routes.post("/login", LoginUser);
routes.post("/refresh", refreshAccessToken);
routes.post("/logout", isAuth, logoutUser);
routes.get("/alldata", isAuth, alldata);

export default routes;
