
/**
 * Module dependencies.
 */

var express = require('express')
  , signUp = require('./routes/signUp')
  , logIn = require('./routes/logIn')
  , http = require('http')
  , path = require('path') 
  , favicon = require('static-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , mongo = require("./routes/mongodb")
  , ejs=require('ejs');

//URL for the sessions collections in mongoDB
var mongoSessionConnectURL = "mongodb://cmpeUser:cmpe273@aws-us-east-1-portal.16.dblayer.com:10187/amazonDB";
var expressSession = require("express-session");
var mongoStore = require("connect-mongo")(expressSession);
var app = express();

/** Assigning Port **/
app.set('port', process.env.PORT || 3000);

/** View Engine Setup**/
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));

/** Parsing Url**/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

/** Sessions**/
app.use(expressSession({
	secret: 'cmpe273_teststring',
	resave: false,  //don't save session if unmodified
	saveUninitialized: false,	// don't create session until something stored
	duration: 30 * 60 * 1000,    
	activeDuration: 5 * 60 * 1000,
	store: new mongoStore({
		url: mongoSessionConnectURL
	})
}));

/**Handling Routing and Delegating Calls**/
app.get('/', logIn.goToLogInPage);

/** Error Handling **/
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/** Creating Server **/
mongo.connect(mongoSessionConnectURL, function(){
	console.log('Connected to mongo at: ' + mongoSessionConnectURL);
	http.createServer(app).listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'));
	});  
});