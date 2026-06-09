import express from "express";
import { getProfile, getMyProfile, updateProfile } from "../controllers/profile";
import { allowOnlyAuthenticatedUser } from "../middlewares/auth";

export const profileRoute = express.Router();

// Public route — view any user's profile
profileRoute.get("/:userId", getProfile);

// Auth-required routes
profileRoute.get("/me/info", allowOnlyAuthenticatedUser, getMyProfile);
profileRoute.put("/me", allowOnlyAuthenticatedUser, updateProfile);
