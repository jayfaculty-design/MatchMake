const { Pool } = require("pg");

const db = new Pool({
  database: "match-make",
  host: "localhost",
  user: "postgres",
  password: "facultyf",
  port: 5432,
});

module.exports = db;
