/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Masaguisi National High School - South Bongabong, Oriental Mindoro
*/

import db from './database.js';

export class Message {
  static async create(messageData) {
    const { sender_id, receiver_id, receiver_role, subject, message } = messageData;
    
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO messages (sender_id, receiver_id, receiver_role, subject, message) 
         VALUES (?, ?, ?, ?, ?)`,
        [sender_id, receiver_id, receiver_role, subject, message],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...messageData });
        }
      );
    });
  }

  static async getInboxMessages(userId, limit = 50) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT m.*, u.name as sender_name, u.role as sender_role
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.receiver_id = ? OR (m.receiver_role = (SELECT role FROM users WHERE id = ?) AND m.receiver_id IS NULL)
        ORDER BY m.created_at DESC
        LIMIT ?
      `, [userId, userId, limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getSentMessages(userId, limit = 50) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT m.*, 
               CASE 
                 WHEN m.receiver_id IS NOT NULL THEN u.name
                 ELSE UPPER(m.receiver_role) || 'S'
               END as receiver_name
        FROM messages m
        LEFT JOIN users u ON m.receiver_id = u.id
        WHERE m.sender_id = ?
        ORDER BY m.created_at DESC
        LIMIT ?
      `, [userId, limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async markAsRead(messageId, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE messages SET is_read = 1 WHERE id = ? AND receiver_id = ?`,
        [messageId, userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        }
      );
    });
  }

  static async getUnreadCount(userId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as count
        FROM messages
        WHERE (receiver_id = ? OR (receiver_role = (SELECT role FROM users WHERE id = ?) AND receiver_id IS NULL))
        AND is_read = 0
      `, [userId, userId], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
  }

  static async getAllUsers() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT id, name, role, email
        FROM users
        ORDER BY role, name
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async deleteMessage(messageId, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM messages WHERE id = ? AND (sender_id = ? OR receiver_id = ?)`,
        [messageId, userId, userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        }
      );
    });
  }
}