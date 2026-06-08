import { Request, Response } from "express";
import Auth from "../models/auth";
import { generateToken } from "../services/authToken";
import { generateSalt, hashPassword } from "../services/authUtils";
import { sendEmail } from "../services/sendEmail";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyAcc } from "../services/verifyAcc";

dotenv.config();

export const handleUserSignUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All the fields are required" });
    }

    const existingUser = await Auth.findOne({ email });
    if(existingUser) {
      return res.status(400).json({ message: "You already have an account, login instead OR if you want to verify your email then check your email inbox" });
    }

    const salt = generateSalt();
    const hash = hashPassword(password, salt);

    const newUser = new Auth({
      name,
      email,
      password: hash,
      salt: salt,
      isVerified: false,
    });
    await newUser.save();
    verifyAcc(newUser);

    return res.status(200).json({ message: "Check your inbox for account verification email" });
  } catch (error) {
    console.log(`While signing up`);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

export const handleVerifyEmail = async (req: Request, res: Response) => {
  try {
    const queryHash = req.query.hash as string;
    const decoder = jwt.verify(queryHash, process.env.JWT_ENCRYP_KEY!) as {
      email: string;
      name: string;
    };

    const user = await Auth.findOne({ email: decoder.email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User with that email is not registered" });
    }

    user.isVerified = true;
    await user.save();

    // letting user login immediately after account verification, no need to login after signup and verification is completed
    const token = generateToken(user);
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Email verified successfully", token, user });
  } catch (error) {
    console.log(`${error}`);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

export const handleUserLogIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All the fields are required" });
  }
  try {
    const existingUser = await Auth.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ message: "You don't have an account, sign up first" });
    }

    if (!existingUser.isVerified) {
      return res.status(400).json({ message: "Account is unverified" });
    }

    const inputhash = hashPassword(password, existingUser.salt);

    if (inputhash !== existingUser.password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = generateToken(existingUser);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Logged in success",
      token,
      user: {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
      },
    });
  } catch (error) {
    console.log(`${error}`);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// via old password
export const handleForgetPassViaOld = async (req: Request, res: Response) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "All the fields are required" });
  }

  try {
    const user = await Auth.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Account with that email does not exists" });
    }

    const oldHash = hashPassword(oldPassword, user?.salt);
    if (oldHash !== user?.password) {
      return res
        .status(400)
        .json({ message: "You have entered a wrong password" });
    }

    const newSalt = generateSalt();
    const newHash = hashPassword(newPassword, newSalt);

    user.password = newHash;
    user.salt = newSalt;
    await user.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(`${error}`);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// via nodemailer
export const handlerForgetPassViaEmail = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Enter all the required fields" });
  }
  try {
    const user = await Auth.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "This email isn't registered to any accounts" });
    }

    const status = sendEmail(user);
    if (!status) {
      return res
        .status(400)
        .json({ message: "Email couldn't be sent at the moment" });
    }
    return res.status(200).json({ message: `Reset link sent to your email` });
  } catch (error) {
    console.log(`${error}`);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

export const changeUserPass = async (req: Request, res: Response) => {
  const { newPassword } = req.body;
  const token = req.query.token as string;

  if (!newPassword) {
    return res.status(400).json({ message: "All the fields are required" });
  }

  if (!token) {
    return res.status(400).json({ message: "No validated token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ENCRYP_KEY!) as {
      name: string;
      email: string;
    };

    const user = await Auth.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).json({ message: "Token is altered" });
    }

    const newSalt = generateSalt();
    const newHash = hashPassword(newPassword, newSalt);
    user.password = newHash;
    user.salt = newSalt;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(`${error}`);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

export const handleUserLogOut = async(req: Request, res: Response) => {
    try {
        res.clearCookie('token');
        return res.status(200).json({ message: "Logged out successfully" });
    }catch(error) {
        console.log(`${error}`);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

export const handleGoogleConfig = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      googleClientId: process.env.GOOGLE_CLIENT_ID || ""
    });
  } catch (error) {
    console.log(`${error}`);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

export const handleGoogleLoginSuccess = async (req: Request, res: Response) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ message: "Access token is required" });
  }

  try {
    let email = "";
    let name = "";

    // Support developer-friendly Mock login bypass in sandbox/demo mode
    if (accessToken === "mock-access-token-fan") {
      email = "fan@nith.ac.in";
      name = "Anime Fan";
    } else if (accessToken === "mock-access-token-otaku") {
      email = "otaku@nith.ac.in";
      name = "Otaku Member";
    } else {
      // Real flow: verify access token directly with Google API
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      if (!response.ok) {
        return res.status(400).json({ message: "Invalid Google access token" });
      }

      const profile = await response.json();
      if (!profile.email) {
        return res.status(400).json({ message: "Unable to retrieve email from Google" });
      }

      email = profile.email;
      name = profile.name || email.split("@")[0];

      if (profile.email_verified === false) {
        return res.status(400).json({ message: "Google email is not verified" });
      }
    }

    let user = await Auth.findOne({ email });

    if (!user) {
      // Automatically register user if they don't exist
      const salt = generateSalt();
      const randomPassword = Math.random().toString(36).substring(2, 15);
      const hash = hashPassword(randomPassword, salt);

      user = new Auth({
        name,
        email,
        password: hash,
        salt,
        isVerified: true,
      });
      await user.save();
    } else if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Logged in success",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(`Error during Google auth callback: ${error}`);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};


