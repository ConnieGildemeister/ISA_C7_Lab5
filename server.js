const http = require('http');
const mysql = require('mysql');
const url = require('url');
const { parse } = require('querystring');

// Database connection
const connection = mysql.createConnection({
    host: 'sql.freedb.tech',
    user: 'freedb_nkjeen',
    password: '%eN9usHHB*pE2mA',
    database: 'freedb_jeen-database'
});

connection.connect(err => {
    if (err) throw err;
    console.log("Connected to database!");

    // Create table if not exists
    const createTableQuery = `CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        address VARCHAR(255),
        phone_number VARCHAR(20),
        INDEX (name),
        ENGINE=InnoDB
    );`;

    connection.query(createTableQuery, (err, result) => {
        if (err) throw err;
        console.log("Table ready!");
    });
});

// Server handling
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    if (parsedUrl.pathname === '/api/v1/sql' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on('end', () => {
            const { query } = parse(body);
            if (query.toLowerCase().startsWith('insert')) {
                connection.query(query, (err, results) => {
                    if (err) {
                        res.writeHead(403, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Operation not allowed' }));
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(results));
                });
            } else {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid query type' }));
            }
        });
    } else if (parsedUrl.pathname === '/api/v1/sql' && req.method === 'GET') {
        const sqlQuery = decodeURIComponent(parsedUrl.query);
        if (sqlQuery.toLowerCase().startsWith('select')) {
            connection.query(sqlQuery, (err, results) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Database error' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(results));
            });
        } else {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid query type' }));
        }
    }
});

server.listen(8080, () => {
    console.log('Server running on port 8080');
});
