/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Masaguisi National High School - South Bongabong, Oriental Mindoro
*/

import express from "express";
import path from "path";
import session from "express-session";
import router from "../routes/index.js";
import fs from 'fs';
import hbs from "hbs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { initializeDatabase } from "../models/database.js";

// Register Handlebars helpers
hbs.registerHelper('eq', function(a, b) {
  return a === b;
});

hbs.registerHelper('math', function(a, operator, b, operator2, c) {
  if (arguments.length === 4) {
    // Two operands: a operator b
    switch (operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      default: return 0;
    }
  } else if (arguments.length === 6) {
    // Three operands: a operator b operator2 c
    let result = 0;
    switch (operator) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/': result = b !== 0 ? a / b : 0; break;
      default: result = a;
    }
    switch (operator2) {
      case '+': return result + c;
      case '-': return result - c;
      case '*': return result * c;
      case '/': return c !== 0 ? result / c : 0;
      default: return result;
    }
  }
  return 0;
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));

app.use(session({
  secret: "xianfire-secret-key",
  resave: false,
  saveUninitialized: false
}));

app.engine("xian", async (filePath, options, callback) => {
  try {
    const originalPartialsDir = hbs.partialsDir;
    hbs.partialsDir = path.join(__dirname, '../views');

    const result = await new Promise((resolve, reject) => {
      hbs.__express(filePath, options, (err, html) => {
        if (err) return reject(err);
        resolve(html);
      });
    });

    hbs.partialsDir = originalPartialsDir;
    callback(null, result);
  } catch (err) {
    callback(err);
  }
});

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "xian");

const partialsDir = path.join(__dirname, "../views/partials");
if (fs.existsSync(partialsDir)) {
  fs.readdir(partialsDir, (err, files) => {
    if (err) {
      console.error("❌ Could not read partials directory:", err);
      return;
    }

    files
      .filter(file => file.endsWith('.xian'))
      .forEach(file => {
        const partialName = file.replace('.xian', ''); 
        const fullPath = path.join(partialsDir, file);

        fs.readFile(fullPath, 'utf8', (err, content) => {
          if (err) {
            console.error(`❌ Failed to read partial: ${file}`, err);
            return;
          }
          hbs.registerPartial(partialName, content);
        });
      });
  });
}

app.use("/", router);

// Initialize database
initializeDatabase().catch(console.error);

// Vercel serverless function export
export default (req, res) => {
  return app(req, res);
};