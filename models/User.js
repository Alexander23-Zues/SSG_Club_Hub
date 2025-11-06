/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import db from './database.js';
import bcrypt from 'bcrypt';

export class User {
  static async create(userData) {
    const { name, email, password, role, student_id, course, year_level } = userData;
    // Check if password is already hashed (starts with $2b$)
    const hashedPassword = password.startsWith('$2b$') ? password : await bcrypt.hash(password, 10);
    
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (name, email, password, role, student_id, course, year_level) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, role, student_id, course, year_level],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...userData });
        }
      );
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAllMembers() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM users WHERE role = 'member' ORDER BY created_at DESC", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getAllOfficers() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM users WHERE role = 'officer' ORDER BY created_at DESC", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async deleteById(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }

  static async updateProfile(id, userData) {
    const { name, student_id, course, year_level } = userData;
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET name = ?, student_id = ?, course = ?, year_level = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [name, student_id, course, year_level, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        }
      );
    });
  }

  static async setResetToken(email, token, expires) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET reset_token = ?, reset_token_expires = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE email = ?`,
        [token, expires, email],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        }
      );
    });
  }

  static async findByResetToken(token) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > datetime('now')`,
        [token],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [hashedPassword, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        }
      );
    });
  }
}