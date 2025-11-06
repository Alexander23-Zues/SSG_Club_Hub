/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import db from './database.js';

export class Organization {
  static async create(orgData) {
    const { name, description, officer_id, logo } = orgData;
    
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO organizations (name, description, officer_id, logo, status) 
         VALUES (?, ?, ?, ?, 'pending')`,
        [name, description, officer_id, logo],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...orgData });
        }
      );
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*, u.name as officer_name 
        FROM organizations o 
        LEFT JOIN users u ON o.officer_id = u.id 
        ORDER BY o.created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getApproved() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*, u.name as officer_name 
        FROM organizations o 
        LEFT JOIN users u ON o.officer_id = u.id 
        WHERE o.status = 'approved'
        ORDER BY o.created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT o.*, u.name as officer_name 
        FROM organizations o 
        LEFT JOIN users u ON o.officer_id = u.id 
        WHERE o.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findByOfficerId(officer_id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM organizations WHERE officer_id = ?', [officer_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE organizations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        }
      );
    });
  }

  static async deleteById(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM organizations WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }

  static async getMembers(orgId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT u.*, om.status as membership_status, om.joined_at 
        FROM users u 
        JOIN organization_members om ON u.id = om.user_id 
        WHERE om.organization_id = ?
        ORDER BY om.joined_at DESC
      `, [orgId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async addMember(orgId, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO organization_members (organization_id, user_id, status) VALUES (?, ?, ?)',
        [orgId, userId, 'pending'],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  static async updateMemberStatus(orgId, userId, status) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE organization_members SET status = ? WHERE organization_id = ? AND user_id = ?',
        [status, orgId, userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        }
      );
    });
  }

  static async removeMember(orgId, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM organization_members WHERE organization_id = ? AND user_id = ?',
        [orgId, userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        }
      );
    });
  }

  static async getUserOrganizations(userId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*, om.status as membership_status 
        FROM organizations o 
        JOIN organization_members om ON o.id = om.organization_id 
        WHERE om.user_id = ? AND o.status = 'approved'
        ORDER BY om.joined_at DESC
      `, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}