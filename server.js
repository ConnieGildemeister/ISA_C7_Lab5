const http = require('http');
const mysql = require('mysql2/promise');
const url = require('url');

// Database connection
async function createConnection() {
    try {
        const connection = await mysql.createConnection({
            host: 'sql.freedb.tech',
            user: 'freedb_nkjeen',
            password: '%eN9usHHB*pE2mA',
            database: 'freedb_jeen-database'
        });

        console.log("Connected to database!");

        // Create table if not exists
        const createTableQuery = `CREATE TABLE IF NOT EXISTS patients (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            dateOfBirth datetime NOT NULL
        ) ENGINE=InnoDB;`;

        await connection.query(createTableQuery);
        console.log("Table ready!");
        return connection;
    } catch (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1); // Terminate the process on initial connection error
    }
}

// Initialize connection
let dbConnection;
createConnection().then(connection => dbConnection = connection);

const server = http.createServer(async (req, res) => {
    if (req.url === '/api/v1/sql' && req.method === 'POST') {
        let body = '';
        for await (const chunk of req) {
            body += chunk.toString();
        }
        const { query } = JSON.parse(body);
        
        try {
            const [results] = await dbConnection.execute(query);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }
});

server.listen(8080, () => {
    console.log('Server running on port 8080');
});
