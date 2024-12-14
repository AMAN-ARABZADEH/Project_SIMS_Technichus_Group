const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const app = express();
const cors = require('cors');
app.use(cors());

// Middleware for parsing JSON requests
app.use(bodyParser.json());

// Session configuration for storing user data between requests
app.use(session({
    secret: 'session_key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
}));

// Setting up a connection to the database
let pool;

async function initializeDatabase() {
    /* createPool manages a pool
    * of connections, and is preferable
    * over createConnection for this application. */
    try {
        pool = await mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: 'axd944',
            database: 'Science_Center',
        });
        console.log("Database pool created.");
    } catch (error) {
        console.error("Failed to create a database pool: ", error);
    }
}

initializeDatabase().then(r => {});

/* path '/' indicates the end point of the server,
* for example http://localhost:3000/ */
/* ----------------------------------------------- ROUTE FOR HANDLING POST REQUESTS ------------------------------------------*/
app.post('/:identifier', async (req, res) => {
    const identifier = req.params.identifier;

    console.log(req.body);
    const connection = await pool.getConnection();

    try {
        switch (identifier) {
            case 'registerAdmin':  // Handle admin registration
                const { firstName, lastName, email, password } = req.body;

                const [rows] = await connection
                    .execute('INSERT INTO ADMINISTRATORS (F_NAME, L_NAME, EMAIL, PASSWORD) ' +
                        'VALUES (?, ?, ?, ?)', [firstName, lastName, email, password]);

                req.session.uname = email;
                req.session.pw = password;

                // sends back a response to the client
                res.json({ success: true, sessionActive: true, email: email });

                break;

            case 'registerExhibit':
                const { exh_name, exh_theme, exh_descr,
                    created_at, updated_at } = req.body;

                try {
                    [rows] = await connection
                        .execute('INSERT INTO EXHIBITS ' +
                            '(EXH_NAME, EXH_THEME, EXH_DESCR, ' +
                            'CREATED_AT, UPDATED_AT) VALUES ' +
                            '(?, ?, ?, ?, ?)', [exh_name, exh_theme, exh_descr,
                            created_at, updated_at]);

                    connection.release();
                    res.response({success: true, message: "Exhibit was successfully registered!"});
                }
                catch (error) { res.json({ success: false, message: error.message }) }

                break;

            case 'registerMediaPlayer':
                const { station, width, height, resolution,
                        screen_name, mac_address, ip_address } = req.body;

                [rows] = await connection
                    .execute('INSERT INTO DIGITAL_SIGNS ' +
                        '(STATION, WIDTH, HEIGHT,' +
                        ' MAC_ADDRESS, IP_ADDRESS) VALUES ' +
                        '(?, ?, ?, ?, ?, ?)', [station, width, height,
                        resolution, screen_name,
                        mac_address, ip_address]);
                break;
        }
    } catch (error) {
        console.log("Error", error);
        res.json({ success: false, message: error.message });
    } finally { if (connection) { connection.release(); } }

});

/* ----------------------------------------------- ROUTE FOR HANDLING GET REQUESTS ------------------------------------------*/
app.get('/:identifier', async (req, res) => {

    console.log("GET request received for identifier:", req.params.identifier);
    const connection = await pool.getConnection();

    const identifier = req.params.identifier;

    switch (identifier) {
        case 'signIn':
            try {
                [rows] = await connection
                    .execute('SELECT ADMIN_ID FROM ADMINISTRATORS' +
                        'WHERE EMAIL = ?', [req.query.email]);
                if (rows.length > 0) {
                    const admin_name = await connection
                        .execute('SELECT F_NAME FROM ADMINISTRATORS' +
                            'WHERE EMAIL = ? AND PASSWORD = ?'
                        , [req.query.email, req.query.pw]);
                    res.json({ success: true, name: admin_name });
                }
                else { res.json({ success: false, message: 'Incorrect password' }); }
            }
            catch (err) {
                console.log('An error has occurred:', err.message);
                res.json({success: false, message: "Unknown identifier"});
            }

            break;

        case 'manageMediaPlayers':
            console.log('inside manageMediaPlayer case');
            try {
                [rows] = await connection.execute
                ('SELECT EXH_NAME, EXH_THEME, STATION, MAC_ADDRESS,' +
                    'STATUS_NAME, SCREEN_NAME' +
                    'FROM EXHIBITS' +
                    'JOIN MEDIA_PLAYERS ON EXHIBITS.EXH_ID = MEDIA_PLAYERS.STATION' +
                    'JOIN LAYOUTS ON MEDIA_PLAYERS.SIGN_ID = LAYOUTS.MEDIA_PLAYER' +
                    'JOIN LAYOUT_STATUS ON LAYOUTS.LAYOUT_ID = LAYOUT_STATUS.STATUS_ID');

                connection.release();
                res.json({ success: true, data: rows });
            }
            catch (error) { res.json({ success: false, message: error.message }) }
            break;
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


