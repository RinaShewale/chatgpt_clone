import userModel from "../model/usermodel.js";
import jwt from "jsonwebtoken";
import { SendEmail } from "../Services/mail.service.js";
import crypto from "crypto";


// ================= REGISTER =================
export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    const isUserAlreadyExist = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isUserAlreadyExist) {
      return res.status(400).json({
        message: "User with this Email or Username already exists",
        success: false,
      });
    }

    const user = await userModel.create({ username, email, password });

    const emailVerificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    user.verifyToken = emailVerificationToken;
    await user.save();

    const verificationLink = `https://chatgpt-clone-jffg.onrender.com/verify-email?token=${emailVerificationToken}`;

    // 🔥 EMAIL FIX (NON-BLOCKING + FALLBACK)
    SendEmail({
      to: email,
      subject: "🚀 Verify Your Email - Welcome!",
      html: `
    <div style="font-family: 'Segoe UI', sans-serif; background-color:#f4f6f8; padding:40px 20px;">
      
      <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:12px; padding:30px; box-shadow:0 8px 24px rgba(0,0,0,0.1); text-align:center;">
        
        <h2 style="color:#111; margin-bottom:10px;">Welcome 🎉</h2>
        
        <p style="color:#555; font-size:15px; line-height:1.6;">
          Your account has been created successfully.<br/>
          Please verify your email to activate your account.
        </p>

        <a href="${verificationLink}" 
           style="
             display:inline-block;
             margin-top:20px;
             padding:14px 26px;
             font-size:16px;
             font-weight:600;
             color:#fff;
             text-decoration:none;
             border-radius:8px;
             background:linear-gradient(135deg,#19c37d,#0ea5e9);
             box-shadow:0 4px 12px rgba(0,0,0,0.2);
           ">
           ✅ Verify Email
        </a>

        <p style="margin-top:25px; font-size:13px; color:#777;">
          Or copy & paste this link in your browser:
        </p>

        <p style="word-break:break-all; font-size:12px; color:#444; background:#f1f1f1; padding:10px; border-radius:6px;">
          ${verificationLink}
        </p>

        <p style="margin-top:20px; font-size:12px; color:#999;">
          If you didn't create this account, you can safely ignore this email.
        </p>

      </div>
    </div>
  `
    }).catch(() => {
      console.log("📌 Verification link:", verificationLink);
    });

    const userData = user.toObject();
    delete userData.password;

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: userData,
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Register failed",
      success: false,
    });
  }
}

// ================= LOGIN =================
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // ❌ REMOVE EMAIL VERIFICATION BLOCK (IMPORTANT)
    // if (!user.verified) {
    //   return res.status(400).json({
    //     message: "Please verify your email first",
    //     success: false,
    //   });
    // }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ FIX COOKIE FOR RENDER
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,        // 🔥 REQUIRED
      sameSite: "none",    // 🔥 REQUIRED
    });

    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      message: "Login successful",
      success: true,
      user: userData,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      success: false,
      error: error.message,
    });
  }
}



// ================= GET CURRENT USER =================
export async function getMe(req, res) {
  try {

    const userId = req.user.id;

    const user = await userModel
      .findById(userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.json({
      success: true,
      user,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch user",
      success: false,
    });
  }
}


// ================= VERIFY EMAIL =================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token missing" });
    }

    // 1. Verify JWT validity (optional but safer)
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Token expired or invalid" });
    }

    // 2. Find user by the token stored in DB
    const user = await userModel.findOne({ verifyToken: token });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }

    if (user.verified) {
      return res.status(200).json({ success: true, message: "Email already verified" });
    }

    // 3. Mark as verified and clear token
    user.verified = true;
    user.verifyToken = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Email verified successfully 🎉" });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};





// ================= UPDATE PROFILE =================
export async function updateProfile(req, res) {
  try {
    const userId = req.user.id; // From authUser middleware
    const { username, name } = req.body;

    // 1. If username is being changed, check if the new one is already taken
    if (username) {
      const existingUser = await userModel.findOne({
        username,
        _id: { $ne: userId } // Find if ANYONE ELSE has this username
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Username is already taken",
          success: false,
        });
      }
    }

    // 2. Update the user
    // Note: If your schema doesn't have a 'name' field yet, 
    // it will only update 'username'.
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          username: username,
          // name: name // Uncomment this if you add 'name' to your Mongoose Schema
        }
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.json({
      message: "Profile updated successfully",
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Update failed",
      success: false,
      error: error.message,
    });
  }
}

//=========update password==============

export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 1. Find user by ID (req.user comes from your authUser middleware)
    // We need to find the actual document to use the .save() hook
    const user = await userModel.findById(req.user._id || req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 2. Check if old password matches using the method in your schema
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // 3. Update the password field
    // The pre-save hook in your model will hash this automatically
    user.password = newPassword;

    // 4. Save the document
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("Update Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    // 1. Generate Plain Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Save Hashed Token to DB
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes
    await user.save();

    // 3. Send Email
    const resetUrl = `https://chatgpt-clone-jffg.onrender.com/login`; // Or your specific reset page
    const htmlContent = `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2>Password Reset Request</h2>
                <p>You requested a password reset. Please use the following token to reset your password:</p>
                <div style="background: #f4f4f4; padding: 10px; font-size: 20px; font-weight: bold; text-align: center; border-radius: 5px;">
                    ${resetToken}
                </div>
                <p>This token expires in 10 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        `;

    await SendEmail({
      to: user.email,
      subject: "Password Reset Token",
      html: htmlContent,
      text: `Your password reset token is: ${resetToken}`
    });

    res.status(200).json({
      success: true,
      message: "Reset token sent to your email!"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Email could not be sent" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Token is invalid or has expired" });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// ================= LOGOUT =================
export async function logout(req, res) {
  try {
    // Clear the cookie named 'token'
    res.cookie("token", "", {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS in production
      sameSite: "strict",
      expires: new Date(0), // Set expiration to the past
    });

    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Logout failed",
      success: false,
    });
  }
}

