/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import { User } from "../models/User.js";
import { Organization } from "../models/Organization.js";
import { Announcement } from "../models/Announcement.js";
import { Event } from "../models/Event.js";

// Middleware to check admin access
export const requireAdmin = async (req, res, next) => {
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
    if (!user || user.role !== 'admin') {
      req.session.destroy();
      return res.redirect("/login");
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    req.session.destroy();
    res.redirect("/login");
  }
};

export const adminDashboard = async (req, res) => {
  try {
    const [organizations, members, officers, announcements, events] = await Promise.all([
      Organization.getAll(),
      User.getAllMembers(),
      User.getAllOfficers(),
      Announcement.getAll(),
      Event.getAll()
    ]);

    const stats = {
      totalOrganizations: organizations.length,
      pendingOrganizations: organizations.filter(org => org.status === 'pending').length,
      totalMembers: members.length,
      totalOfficers: officers.length,
      totalAnnouncements: announcements.length,
      totalEvents: events.length
    };

    res.render("admin/dashboard", {
      title: "Admin Dashboard - Masaguisi ClubHub",
      user: req.user,
      stats,
      organizations: organizations.slice(0, 5), // Show recent 5
      recentAnnouncements: announcements.slice(0, 5)
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).send("Server error");
  }
};

export const manageOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.getAll();
    res.render("admin/organizations", {
      title: "Manage Organizations - Masaguisi ClubHub",
      user: req.user,
      organizations
    });
  } catch (error) {
    console.error("Manage organizations error:", error);
    res.status(500).send("Server error");
  }
};

export const approveOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    await Organization.updateStatus(id, 'approved');
    res.redirect("/admin/organizations");
  } catch (error) {
    console.error("Approve organization error:", error);
    res.status(500).send("Server error");
  }
};

export const rejectOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    await Organization.updateStatus(id, 'rejected');
    res.redirect("/admin/organizations");
  } catch (error) {
    console.error("Reject organization error:", error);
    res.status(500).send("Server error");
  }
};

export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    await Organization.deleteById(id);
    res.redirect("/admin/organizations");
  } catch (error) {
    console.error("Delete organization error:", error);
    res.status(500).send("Server error");
  }
};

export const manageMembers = async (req, res) => {
  try {
    const members = await User.getAllMembers();
    res.render("admin/members", {
      title: "Manage Members - Masaguisi ClubHub",
      user: req.user,
      members
    });
  } catch (error) {
    console.error("Manage members error:", error);
    res.status(500).send("Server error");
  }
};

export const manageOfficers = async (req, res) => {
  try {
    const officers = await User.getAllOfficers();
    res.render("admin/officers", {
      title: "Manage Officers - Masaguisi ClubHub",
      user: req.user,
      officers
    });
  } catch (error) {
    console.error("Manage officers error:", error);
    res.status(500).send("Server error");
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.deleteById(id);
    res.redirect(req.get('Referer') || '/admin/dashboard');
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).send("Server error");
  }
};

export const viewReports = async (req, res) => {
  try {
    const [organizations, members, officers, announcements, events] = await Promise.all([
      Organization.getAll(),
      User.getAllMembers(),
      User.getAllOfficers(),
      Announcement.getAll(),
      Event.getAll()
    ]);

    const reports = {
      organizationsByStatus: {
        approved: organizations.filter(org => org.status === 'approved').length,
        pending: organizations.filter(org => org.status === 'pending').length,
        rejected: organizations.filter(org => org.status === 'rejected').length
      },
      usersByRole: {
        members: members.length,
        officers: officers.length
      },
      contentStats: {
        announcements: announcements.length,
        events: events.length
      }
    };

    res.render("admin/reports", {
      title: "Reports & Analytics - Masaguisi ClubHub",
      user: req.user,
      reports,
      organizations,
      members,
      officers
    });
  } catch (error) {
    console.error("View reports error:", error);
    res.status(500).send("Server error");
  }
};