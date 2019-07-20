
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const app = require('express')();
const server = require('http').createServer(app);

// Controllers
var user_controller = require('./controllers/user');
var general_controller = require('./controllers/general');
// Socket
var io = require('socket.io')(server, {
    pingTimeout: 60000,
});
var socket = require('./modules/socket')(io);

app.set("trust proxy", 1);
app.use(morgan('combined'));
app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(cors());


var pool = require('./modules/db_connector');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);


app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge:  1800000,
        // httpOnly: true,
        path: '/',
    },
    store:  new MySQLStore({}, pool),
    name: 'napoleon',
    expires: 60*60,
}));
/**
 * The behavior of the application has not changed, but the session middleware now adds a new property
 * to the req object passed to each middleware callback after it.
 */

app.use('/', user_controller);
app.use('/', general_controller);


server.listen(8081);
