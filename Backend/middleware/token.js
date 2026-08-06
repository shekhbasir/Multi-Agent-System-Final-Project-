import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES = "45m";
const REFRESH_TOKEN_EXPIRES = "7d";

export const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });
};

export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_SECRET_KEY, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });
};

export default generateAccessToken;
