/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import { User } from "../models/User.js";
import { Organization } from "../models/Organization.js";
import { Announcement } from "../models/Announcement.js";
import { Event } from "../models/Event.js";

// Middleware to check member access
export const requireMember = async (req, res, next) => {
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
    if (!user || user.role !== 'member') {
      req.session.destroy();
      return res.redirect("/login");
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Member auth error:", error);
    req.session.destroy();
    res.redirect("/login");
  }
};

export const memberDashboard = async (req, res) => {
  try {
    const [userOrganizations, allOrganizations, allAnnouncements, allEvents] = await Promise.all([
      Organization.getUserOrganizations(req.user.id),
      Organization.getApproved(),
      Announcement.getAll(),
      Event.getAll()
    ]);

    // Filter announcements and events for user's organizations
    const userOrgIds = userOrganizations.map(org => org.id);
    const relevantAnnouncements = allAnnouncements.filter(ann => 
      userOrgIds.includes(ann.organization_id)
    );
    const relevantEvents = allEvents.filter(event => 
      userOrgIds.includes(event.organization_id)
    );

    res.render("member/dashboard", {
      title: "Member Dashboard - Masaguisi ClubHub",
      user: req.user,
      stats: {
        joinedOrganizations: userOrganizations.length,
        availableOrganizations: allOrganizations.length - userOrganizations.length,
        newAnnouncements: relevantAnnouncements.length,
        upcomingEvents: relevantEvents.length
      },
      organizations: userOrganizations,
      recentAnnouncements: relevantAnnouncements.slice(0, 5),
      upcomingEvents: relevantEvents.slice(0, 5)
    });
  } catch (error) {
    console.error("Member dashboard error:", error);
    res.status(500).send("Server error");
  }
};

export const browseOrganizations = async (req, res) => {
  try {
    const [allOrganizations, userOrganizations] = await Promise.all([
      Organization.getApproved(),
      Organization.getUserOrganizations(req.user.id)
    ]);

    const userOrgIds = userOrganizations.map(org => org.id);
    const availableOrganizations = allOrganizations.filter(org => 
      !userOrgIds.includes(org.id)
    );

    res.render("member/organizations", {
      title: "Browse Organizations - Masaguisi ClubHub",
      user: req.user,
      availableOrganizations,
      joinedOrganizations: userOrganizations
    });
  } catch (error) {
    console.error("Browse organizations error:", error);
    res.status(500).send("Server error");
  }
};

export const joinOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if organization exists and is approved
    const organization = await Organization.findById(id);
    if (!organization || organization.status !== 'approved') {
      return res.status(404).send("Organization not found");
    }

    // Check if user is already a member
    const userOrganizations = await Organization.getUserOrganizations(req.user.id);
    const alreadyMember = userOrganizations.some(org => org.id == id);
    
    if (alreadyMember) {
      return res.redirect("/member/organizations");
    }

    await Organization.addMember(id, req.user.id);
    res.redirect("/member/organizations");
  } catch (error) {
    console.error("Join organization error:", error);
    res.status(500).send("Server error");
  }
};

export const leaveOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    await Organization.removeMember(id, req.user.id);
    res.redirect("/member/organizations");
  } catch (error) {
    console.error("Leave organization error:", error);
    res.status(500).send("Server error");
  }
};

export const viewAnnouncements = async (req, res) => {
  try {
    const userOrganizations = await Organization.getUserOrganizations(req.user.id);
    const userOrgIds = userOrganizations.map(org => org.id);
    
    const allAnnouncements = await Announcement.getAll();
    const relevantAnnouncements = allAnnouncements.filter(ann => 
      userOrgIds.includes(ann.organization_id)
    );

    res.render("member/announcements", {
      title: "Announcements - Masaguisi ClubHub",
      user: req.user,
      announcements: relevantAnnouncements,
      organizations: userOrganizations
    });
  } catch (error) {
    console.error("View announcements error:", error);
    res.status(500).send("Server error");
  }
};

export const viewEvents = async (req, res) => {
  try {
    const userOrganizations = await Organization.getUserOrganizations(req.user.id);
    const userOrgIds = userOrganizations.map(org => org.id);
    
    const allEvents = await Event.getAll();
    const relevantEvents = allEvents.filter(event => 
      userOrgIds.includes(event.organization_id)
    );

    res.render("member/events", {
      title: "Events - Masaguisi ClubHub",
      user: req.user,
      events: relevantEvents,
      organizations: userOrganizations
    });
  } catch (error) {
    console.error("View events error:", error);
    res.status(500).send("Server error");
  }
};

export const profilePage = async (req, res) => {
  try {
    res.render("member/profile", {
      title: "My Profile - Masaguisi ClubHub",
      user: req.user
    });
  } catch (error) {
    console.error("Profile page error:", error);
    res.status(500).send("Server error");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, student_id, course, year_level } = req.body;
    
    await User.updateProfile(req.user.id, {
      name,
      student_id,
      course,
      year_level
    });

    // Update session data
    req.session.userName = name;

    res.redirect("/member/profile");
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).send("Server error");
  }
};