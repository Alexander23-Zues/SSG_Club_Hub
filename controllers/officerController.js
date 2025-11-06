/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import { User } from "../models/User.js";
import { Organization } from "../models/Organization.js";
import { Announcement } from "../models/Announcement.js";
import { Event } from "../models/Event.js";

// Middleware to check officer access
export const requireOfficer = async (req, res, next) => {
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
    if (!user || user.role !== 'officer') {
      req.session.destroy();
      return res.redirect("/login");
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Officer auth error:", error);
    req.session.destroy();
    res.redirect("/login");
  }
};

export const officerDashboard = async (req, res) => {
  try {
    const organization = await Organization.findByOfficerId(req.user.id);
    let members = [];
    let announcements = [];
    let events = [];

    if (organization) {
      [members, announcements, events] = await Promise.all([
        Organization.getMembers(organization.id),
        Announcement.getByOrganization(organization.id),
        Event.getByOrganization(organization.id)
      ]);
    }

    res.render("officer/dashboard", {
      title: "Officer Dashboard - Masaguisi ClubHub",
      user: req.user,
      organization,
      stats: {
        totalMembers: members.length,
        pendingMembers: members.filter(m => m.membership_status === 'pending').length,
        totalAnnouncements: announcements.length,
        totalEvents: events.length
      },
      recentMembers: members.slice(0, 5),
      recentAnnouncements: announcements.slice(0, 3)
    });
  } catch (error) {
    console.error("Officer dashboard error:", error);
    res.status(500).send("Server error");
  }
};

export const createOrganizationPage = (req, res) => {
  res.render("officer/create-organization", {
    title: "Create Organization - Masaguisi ClubHub",
    user: req.user
  });
};

export const createOrganization = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if officer already has an organization
    const existingOrg = await Organization.findByOfficerId(req.user.id);
    if (existingOrg) {
      return res.render("officer/create-organization", {
        title: "Create Organization - Masaguisi ClubHub",
        user: req.user,
        error: "You already have an organization"
      });
    }

    await Organization.create({
      name,
      description,
      officer_id: req.user.id
    });

    res.redirect("/officer/dashboard");
  } catch (error) {
    console.error("Create organization error:", error);
    res.render("officer/create-organization", {
      title: "Create Organization - Masaguisi ClubHub",
      user: req.user,
      error: "Failed to create organization"
    });
  }
};

export const manageMembers = async (req, res) => {
  try {
    const organization = await Organization.findByOfficerId(req.user.id);
    if (!organization) {
      return res.redirect("/officer/create-organization");
    }

    const members = await Organization.getMembers(organization.id);
    
    res.render("officer/members", {
      title: "Manage Members - Masaguisi ClubHub",
      user: req.user,
      organization,
      members
    });
  } catch (error) {
    console.error("Manage members error:", error);
    res.status(500).send("Server error");
  }
};

export const approveMember = async (req, res) => {
  try {
    const { orgId, userId } = req.params;
    
    // Verify officer owns this organization
    const organization = await Organization.findByOfficerId(req.user.id);
    if (!organization || organization.id != orgId) {
      return res.status(403).send("Access denied");
    }

    await Organization.updateMemberStatus(orgId, userId, 'approved');
    res.redirect("/officer/members");
  } catch (error) {
    console.error("Approve member error:", error);
    res.status(500).send("Server error");
  }
};

export const rejectMember = async (req, res) => {
  try {
    const { orgId, userId } = req.params;
    
    // Verify officer owns this organization
    const organization = await Organization.findByOfficerId(req.user.id);
    if (!organization || organization.id != orgId) {
      return res.status(403).send("Access denied");
    }

    await Organization.removeMember(orgId, userId);
    res.redirect("/officer/members");
  } catch (error) {
    console.error("Reject member error:", error);
    res.status(500).send("Server error");
  }
};

export const announcementsPage = async (req, res) => {
  try {
    const organization = await Organization.findByOfficerId(req.user.id);
    if (!organization) {
      return res.redirect("/officer/create-organization");
    }

    // Get both organization's announcements and all announcements for viewing
    const [organizationAnnouncements, allAnnouncements] = await Promise.all([
      Announcement.getByOrganization(organization.id),
      Announcement.getAll()
    ]);
    
    res.render("officer/announcements", {
      title: "Announcements - Masaguisi ClubHub",
      user: req.user,
      organization,
      announcements: organizationAnnouncements,
      allAnnouncements: allAnnouncements
    });
  } catch (error) {
    console.error("Announcements page error:", error);
    res.status(500).send("Server error");
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    const organization = await Organization.findByOfficerId(req.user.id);
    
    if (!organization) {
      return res.status(403).send("No organization found");
    }

    await Announcement.create({
      title,
      content,
      organization_id: organization.id,
      created_by: req.user.id
    });

    res.redirect("/officer/announcements");
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).send("Server error");
  }
};

export const eventsPage = async (req, res) => {
  try {
    const organization = await Organization.findByOfficerId(req.user.id);
    if (!organization) {
      return res.redirect("/officer/create-organization");
    }

    // Get both organization's events and all events for viewing
    const [organizationEvents, allEvents] = await Promise.all([
      Event.getByOrganization(organization.id),
      Event.getAll()
    ]);
    
    res.render("officer/events", {
      title: "Events - Masaguisi ClubHub",
      user: req.user,
      organization,
      events: organizationEvents,
      allEvents: allEvents
    });
  } catch (error) {
    console.error("Events page error:", error);
    res.status(500).send("Server error");
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, event_date, location } = req.body;
    const organization = await Organization.findByOfficerId(req.user.id);
    
    if (!organization) {
      return res.status(403).send("No organization found");
    }

    await Event.create({
      title,
      description,
      event_date,
      location,
      organization_id: organization.id,
      created_by: req.user.id
    });

    res.redirect("/officer/events");
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).send("Server error");
  }
};