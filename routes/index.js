
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
    
import express from "express";
import { homePage } from "../controllers/homeController.js";
import { loginPage, registerPage, forgotPasswordPage, processForgotPassword, resetPasswordPage, processResetPassword, dashboardPage, loginUser, registerUser, logoutUser, clearSession } from "../controllers/authController.js";
import { 
  requireAdmin, adminDashboard, manageOrganizations, approveOrganization, 
  rejectOrganization, deleteOrganization, manageMembers, manageOfficers, 
  deleteUser, viewReports 
} from "../controllers/adminController.js";
import { 
  requireOfficer, officerDashboard, createOrganizationPage, createOrganization,
  manageMembers as officerManageMembers, approveMember, rejectMember,
  announcementsPage, createAnnouncement, eventsPage, createEvent
} from "../controllers/officerController.js";
import { 
  requireMember, memberDashboard, browseOrganizations, joinOrganization,
  leaveOrganization, viewAnnouncements, viewEvents, profilePage, updateProfile
} from "../controllers/memberController.js";
import { chatbotPage, sendMessage, getChatHistory } from "../controllers/chatbotController.js";
import { requireAuth, messagesPage, sendMessage as sendUserMessage, markMessageRead, deleteMessage } from "../controllers/messageController.js";

const router = express.Router();

// Public routes
router.get("/", homePage);
router.get("/login", loginPage);
router.post("/login", loginUser);
router.get("/register", registerPage);
router.post("/register", registerUser);
router.get("/forgot-password", forgotPasswordPage);
router.post("/forgot-password", processForgotPassword);
router.get("/reset-password", resetPasswordPage);
router.post("/reset-password", processResetPassword);
router.get("/logout", logoutUser);

// General dashboard route (redirects based on role)
router.get("/dashboard", dashboardPage);

// Admin routes
router.get("/admin/dashboard", requireAdmin, adminDashboard);
router.get("/admin/organizations", requireAdmin, manageOrganizations);
router.post("/admin/organizations/:id/approve", requireAdmin, approveOrganization);
router.post("/admin/organizations/:id/reject", requireAdmin, rejectOrganization);
router.post("/admin/organizations/:id/delete", requireAdmin, deleteOrganization);
router.get("/admin/members", requireAdmin, manageMembers);
router.get("/admin/officers", requireAdmin, manageOfficers);
router.post("/admin/users/:id/delete", requireAdmin, deleteUser);
router.get("/admin/reports", requireAdmin, viewReports);

// Officer routes
router.get("/officer/dashboard", requireOfficer, officerDashboard);
router.get("/officer/create-organization", requireOfficer, createOrganizationPage);
router.post("/officer/create-organization", requireOfficer, createOrganization);
router.get("/officer/members", requireOfficer, officerManageMembers);
router.post("/officer/members/:orgId/:userId/approve", requireOfficer, approveMember);
router.post("/officer/members/:orgId/:userId/reject", requireOfficer, rejectMember);
router.get("/officer/announcements", requireOfficer, announcementsPage);
router.post("/officer/announcements", requireOfficer, createAnnouncement);
router.get("/officer/events", requireOfficer, eventsPage);
router.post("/officer/events", requireOfficer, createEvent);

// Member routes
router.get("/member/dashboard", requireMember, memberDashboard);
router.get("/member/organizations", requireMember, browseOrganizations);
router.post("/member/organizations/:id/join", requireMember, joinOrganization);
router.post("/member/organizations/:id/leave", requireMember, leaveOrganization);
router.get("/member/announcements", requireMember, viewAnnouncements);
router.get("/member/events", requireMember, viewEvents);
router.get("/member/profile", requireMember, profilePage);
router.post("/member/profile", requireMember, updateProfile);

// Chatbot routes (accessible to all authenticated users and guests)
router.get("/chatbot", chatbotPage);
router.post("/chatbot/message", sendMessage);
router.get("/chatbot/history", getChatHistory);

// Messaging routes (accessible to all authenticated users)
router.get("/messages", requireAuth, messagesPage);
router.post("/messages/send", requireAuth, sendUserMessage);
router.post("/messages/:id/read", requireAuth, markMessageRead);
router.delete("/messages/:id/delete", requireAuth, deleteMessage);

// Debug route to clear sessions
router.get("/clear-session", clearSession);

export default router;
