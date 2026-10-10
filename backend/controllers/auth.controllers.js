import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import genToken from "../utils/token.js"
import { sendOtpMail } from "../utils/mail.js"

// Helper to remove sensitive fields before returning user in API responses
const sanitizeUser = (user) => {
    if (!user) return null;
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    delete userObj.resetOtp;
    delete userObj.otpExpires;
    return userObj;
};

export const signUp = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body;

        if (!fullName || !email || !password || !mobile || !role) {
            return res.status(400).json({ message: "All fields are required." });
        }
        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({ message: "password must be at least 6 characters." });
        }
        if (typeof mobile !== "string" || mobile.length < 10) {
            return res.status(400).json({ message: "mobile no must be at least 10 digits." });
        }

        const normalizedEmail = email.toLowerCase().trim();
        let existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User Already exist." });
        }

        // Hash with cost factor 12
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            role,
            mobile: mobile.trim(),
            password: hashedPassword
        });

        const token = await genToken(user._id);
        res.cookie("token", token, {
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });

        return res.status(201).json(sanitizeUser(user));
    } catch (error) {
        return res.status(500).json({ message: `sign up error ${error.message || error}` });
    }
};

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const normalizedEmail = email.toLowerCase().trim();
        // Query user with password explicitly included since password has select: false
        let user = await User.findOne({ email: normalizedEmail }).select("+password");
        if (!user) {
            // Fallback for un-normalized legacy email
            user = await User.findOne({ email }).select("+password");
        }

        // Generic error message if user not found or account has no password (e.g. Google auth)
        if (!user || !user.password) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        let isMatch = false;
        const isBcrypt = /^\$2[aby]\$\d{2}\$/.test(user.password);

        if (isBcrypt) {
            isMatch = await bcrypt.compare(password, user.password);
        } else if (user.password === password) {
            // Legacy plaintext password detected: authenticate and migrate to bcrypt cost factor 12
            isMatch = true;
            user.password = await bcrypt.hash(password, 12);
            await user.save();
        }

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = await genToken(user._id);
        res.cookie("token", token, {
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });

        return res.status(200).json(sanitizeUser(user));
    } catch (error) {
        return res.status(500).json({ message: `sign In error ${error.message || error}` });
    }
};

export const signOut = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "log out successfully" });
    } catch (error) {
        return res.status(500).json({ message: `sign out error ${error.message || error}` });
    }
};

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }
        const normalizedEmail = email.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            user = await User.findOne({ email });
        }
        if (!user) {
            return res.status(400).json({ message: "User does not exist." });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetOtp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        user.isOtpVerified = false;
        await user.save();

        await sendOtpMail(user.email, otp);
        return res.status(200).json({ message: "otp sent successfully" });
    } catch (error) {
        return res.status(500).json({ message: `send otp error ${error.message || error}` });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required." });
        }
        const normalizedEmail = email.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            user = await User.findOne({ email });
        }

        if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "invalid/expired otp" });
        }

        user.isOtpVerified = true;
        user.resetOtp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res.status(200).json({ message: "otp verify successfully" });
    } catch (error) {
        return res.status(500).json({ message: `verify otp error ${error.message || error}` });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ message: "Email and new password are required." });
        }
        if (typeof newPassword !== "string" || newPassword.length < 6) {
            return res.status(400).json({ message: "password must be at least 6 characters." });
        }

        const normalizedEmail = email.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            user = await User.findOne({ email });
        }

        if (!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "otp verification required" });
        }

        // Hash new password with cost factor 12
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        user.isOtpVerified = false;
        await user.save();

        return res.status(200).json({ message: "password reset successfully" });
    } catch (error) {
        return res.status(500).json({ message: `reset password error ${error.message || error}` });
    }
};

export const googleAuth = async (req, res) => {
    try {
        const { fullName, email, mobile, role } = req.body;
        const normalizedEmail = email ? email.toLowerCase().trim() : email;
        let user = await User.findOne({ email: normalizedEmail });
        if (!user && email) {
            user = await User.findOne({ email });
        }
        if (!user) {
            user = await User.create({
                fullName,
                email: normalizedEmail,
                mobile,
                role
            });
        }

        const token = await genToken(user._id);
        res.cookie("token", token, {
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });

        return res.status(200).json(sanitizeUser(user));
    } catch (error) {
        return res.status(500).json({ message: `googleAuth error ${error.message || error}` });
    }
};
