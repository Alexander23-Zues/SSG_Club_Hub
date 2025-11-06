
  /*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { User } from "../models/User.js";

export const loginPage = (req, res) => {
  // Set no-cache headers to prevent browser caching
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  // Clear any existing session data to prevent auto-redirect issues
  if (req.session.userId) {
    // If user is already logged in, redirect to appropriate dashboard
    return res.redirect("/dashboard");
  }

  // Check if user just logged out
  const logoutMessage = req.query.logout === 'true' ? 'You have been successfully logged out.' : null;
  
  res.render("login", { 
    title: "Masaguisi ClubHub - Login",
    logoutMessage: logoutMessage
  });
};

export const registerPage = (req, res) => {
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }
  res.render("register", { title: "Masaguisi ClubHub - Register" });
};

export const forgotPasswordPage = (req, res) => {
  // Set no-cache headers
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  res.render("forgot-password", { title: "Forgot Password - Masaguisi ClubHub" });
};

export const processForgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.render("forgot-password", { 
        title: "Forgot Password - Masaguisi ClubHub", 
        error: "No account found with that email address." 
      });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

    // Save reset token to database
    await User.setResetToken(email, resetToken, resetExpires);
    
    console.log(`Password reset requested for: ${email}`);
    console.log(`Reset token: ${resetToken}`);
    console.log(`Reset link: http://localhost:8080/reset-password?token=${resetToken}&email=${email}`);

    res.render("forgot-password", { 
      title: "Forgot Password - Masaguisi ClubHub", 
      success: `Password reset instructions have been sent to ${email}. Please check your email and follow the instructions. (Check console for reset link)` 
    });
    
  } catch (error) {
    console.error("Forgot password error:", error);
    res.render("forgot-password", { 
      title: "Forgot Password - Masaguisi ClubHub", 
      error: "An error occurred. Please try again later." 
    });
  }
};

export const resetPasswordPage = (req, res) => {
  const { token, email } = req.query;
  
  if (!token || !email) {
    return res.redirect("/forgot-password");
  }

  res.render("reset-password", { 
    title: "Reset Password - Masaguisi ClubHub",
    token,
    email
  });
};

export const processResetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;
  
  try {
    if (password !== confirmPassword) {
      return res.render("reset-password", { 
        title: "Reset Password - Masaguisi ClubHub", 
        error: "Passwords do not match.",
        token 
      });
    }

    if (password.length < 6) {
      return res.render("reset-password", { 
        title: "Reset Password - Masaguisi ClubHub", 
        error: "Password must be at least 6 characters long.",
        token 
      });
    }

    // Find user by reset token
    const user = await User.findByResetToken(token);
    
    if (!user) {
      return res.render("reset-password", { 
        title: "Reset Password - Masaguisi ClubHub", 
        error: "Invalid or expired reset token. Please request a new password reset.",
        token 
      });
    }

    // Update password
    await User.updatePassword(user.id, password);
    
    console.log(`Password reset completed for user: ${user.email}`);

    res.render("reset-password", { 
      title: "Reset Password - Masaguisi ClubHub", 
      success: "Your password has been successfully updated! You can now login with your new password." 
    });
    
  } catch (error) {
    console.error("Reset password error:", error);
    res.render("reset-password", { 
      title: "Reset Password - Masaguisi ClubHub", 
      error: "An error occurred. Please try again.",
      token 
    });
  }
};

export const dashboardPage = async (req, res) => {
  // Set no-cache headers to prevent browser caching
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  if (!req.session.userId) {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect("/login");
    }

    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'admin':
        return res.redirect("/admin/dashboard");
      case 'officer':
        return res.redirect("/officer/dashboard");
      case 'member':
        return res.redirect("/member/dashboard");
      default:
        return res.redirect("/login");
    }
  } catch (error) {
    console.error("Dashboard error:", error);
    res.redirect("/login");
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  console.log("Login attempt:", { email, password: "***" }); // Debug log
  
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      console.log("User not found:", email); // Debug log
      return res.render("login", { 
        title: "Masaguisi ClubHub - Login", 
        error: "Invalid email or password" 
      });
    }

    console.log("User found:", { id: user.id, email: user.email, role: user.role }); // Debug log

    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      console.log("Invalid password for user:", email); // Debug log
      return res.render("login", { 
        title: "Masaguisi ClubHub - Login", 
        error: "Invalid email or password" 
      });
    }

    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.userName = user.name;

    console.log("Login successful, redirecting to:", user.role, "dashboard"); // Debug log

    // Redirect based on role
    switch (user.role) {
      case 'admin':
        return res.redirect("/admin/dashboard");
      case 'officer':
        return res.redirect("/officer/dashboard");
      case 'member':
        return res.redirect("/member/dashboard");
      default:
        return res.redirect("/dashboard");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", { 
      title: "Masaguisi ClubHub - Login", 
      error: "Login failed. Please try again." 
    });
  }
};

export const registerUser = async (req, res) => {
  const { name, email, password, role, student_id, course, year_level, strand } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.render("register", { 
        title: "Masaguisi ClubHub - Register", 
        error: "Email already registered" 
      });
    }

    // Format course field to include strand for Grade 11 & 12
    let formattedCourse = course;
    if ((year_level === 'Grade 11' || year_level === 'Grade 12') && strand) {
      formattedCourse = `${course} - ${strand}`;
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      student_id,
      course: formattedCourse,
      year_level
    });

    req.session.userId = newUser.id;
    req.session.userRole = role;
    req.session.userName = name;

    // Redirect based on role
    switch (role) {
      case 'officer':
        return res.redirect("/officer/dashboard");
      case 'member':
        return res.redirect("/member/dashboard");
      default:
        return res.redirect("/dashboard");
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.render("register", { 
      title: "Masaguisi ClubHub - Register", 
      error: "Registration failed. Please try again." 
    });
  }
};

export const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    
    // Set headers to prevent caching and force redirect
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.redirect("/login?logout=true");
  });
};

// Add a function to force clear sessions for debugging
export const clearSession = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session clear error:", err);
    }
    res.clearCookie('connect.sid');
    res.json({ message: "Session cleared successfully" });
  });
};
