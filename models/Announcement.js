/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import db from './database.js';

export class Announcement {
  static async create(announcementData) {
    const { title, content, organization_id, created_by } = announcementData;
    
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO announcements (title, content, organization_id, created_by) 
         VALUES (?, ?, ?, ?)`,
        [title, content, organization_id, created_by],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...announcementData });
        }
      );
    });
  }

  static async getByOrganization(orgId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT a.*, u.name as author_name, o.name as organization_name
        FROM announcements a 
        LEFT JOIN users u ON a.created_by = u.id 
        LEFT JOIN organizations o ON a.organization_id = o.id
        WHERE a.organization_id = ?
        ORDER BY a.created_at DESC
      `, [orgId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT a.*, u.name as author_name, o.name as organization_name
        FROM announcements a 
        LEFT JOIN users u ON a.created_by = u.id 
        LEFT JOIN organizations o ON a.organization_id = o.id
        ORDER BY a.created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async deleteById(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM announcements WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }
}