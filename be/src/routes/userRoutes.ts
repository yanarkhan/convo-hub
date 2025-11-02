import express from "express";
import { uploadPhoto } from "../utils/multer";
import * as userController from "../controllers/userController";

const userRoutes = express.Router();

userRoutes.post(
  "/auth/sign-up",
  uploadPhoto.single("photo"),
  userController.signUp
);

export default userRoutes;
