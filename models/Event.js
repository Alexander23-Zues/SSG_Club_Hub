/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import db from './database.js';

export class Event {
  static async create(eventData) {
    const { title, description, event_date, location, organization_id, created_by } = eventData;
    
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO events (title, description, event_date, location, organization_id, created_by) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description, event_date, location, organization_id, created_by],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...eventData });
        }
      );
    });
  }

  static async getByOrganization(orgId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT e.*, u.name as author_name, o.name as organization_name
        FROM events e 
        LEFT JOIN users u ON e.created_by = u.id 
        LEFT JOIN organizations o ON e.organization_id = o.id
        WHERE e.organization_id = ?
        ORDER BY e.event_date ASC
      `, [orgId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT e.*, u.name as author_name, o.name as organization_name
        FROM events e 
        LEFT JOIN users u ON e.created_by = u.id 
        LEFT JOIN organizations o ON e.organization_id = o.id
        ORDER BY e.event_date ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async deleteById(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM events WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }
}