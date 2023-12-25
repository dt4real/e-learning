import express from "express";
import {
  activateUser,
  getUserInfo,
  loginUser,
  logoutUser,
  registrationUser,
  socialAuth,
  updatePassword,
  updateProfilePicture,
  updateUserInfo,
} from "../controllers/user.controller";
import { isAutheticated } from "../middleware/auth";
const userRouter = express.Router();

userRouter.post("/register", registrationUser);

userRouter.post("/activate-user", activateUser);

userRouter.post("/login", loginUser);

userRouter.get("/logout", isAutheticated, logoutUser);

userRouter.get("/me", isAutheticated, getUserInfo);

userRouter.post("/social-auth", socialAuth);

userRouter.put("/update-user-info", isAutheticated, updateUserInfo);

userRouter.put("/update-user-password", isAutheticated, updatePassword);

userRouter.put("/update-user-avatar", isAutheticated, updateProfilePicture);

export default userRouter;
