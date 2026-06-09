import { Request, Response } from "express";
import Auth from "../models/auth";

/**
 * GET /api/profile/:userId
 * Public profile endpoint — returns safe fields only (no password/salt).
 */
export const getProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await Auth.findById(userId).select(
            "name displayName email bio avatarUrl status createdAt"
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error("getProfile error:", error);
        return res.status(500).json({ message: "An internal server error occurred." });
    }
};

/**
 * PUT /api/profile/me
 * Auth-protected. Updates bio, displayName, avatarUrl, status for the current user.
 */
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const { bio, displayName, avatarUrl, status } = req.body;

        // Validation
        const validStatuses = ["online", "idle", "dnd", "invisible"];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }
        if (bio && bio.length > 180) {
            return res.status(400).json({ message: "Bio must be 180 characters or less" });
        }

        const updatedUser = await Auth.findByIdAndUpdate(
            userId,
            {
                ...(bio !== undefined && { bio }),
                ...(displayName !== undefined && { displayName }),
                ...(avatarUrl !== undefined && { avatarUrl }),
                ...(status !== undefined && { status }),
            },
            { new: true, runValidators: true }
        ).select("name displayName email bio avatarUrl status createdAt");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("updateProfile error:", error);
        return res.status(500).json({ message: "An internal server error occurred." });
    }
};

/**
 * GET /api/profile/me
 * Returns the logged-in user's own full profile.
 */
export const getMyProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const user = await Auth.findById(userId).select(
            "name displayName email bio avatarUrl status createdAt"
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error("getMyProfile error:", error);
        return res.status(500).json({ message: "An internal server error occurred." });
    }
};
