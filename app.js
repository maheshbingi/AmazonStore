var express = require('express');
var routes = require('./routes');
var home = require('./routes/home');
var shopping = require('./routes/shopping');
var mysql = require('./routes/mysql');
var http = require('http');
var path = require('path');
var express     = require('express');
var MySQLSessionStore = require('connect-mysql-session')(express);

var app = express();

// all environments
app.set('port', process.env.PORT || 4003);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
    store: new MySQLSessionStore("AWS", "root", ""),
    secret: 'SUPERSECRET'
}));
app.use(app.router);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/', home.signin);
app.get('/signin', home.signin);
app.get('/signup', home.signup);
app.get('/showcatalogs',shopping.catalogs);
app.post('/showcatalogs',home.showcatalogs);
app.get('/viewcatalogs',shopping.viewcatalogs);
app.get('/logout',home.logout);
app.get('/home',shopping.catalogs);
app.post('/logout',home.logout);
app.post('/checkout',shopping.checkout);

app.get('/catalogs',shopping.catalogs);
app.get('/catalogs/:category',function(req,res){
	shopping.getCategory(req,res,req.param('category'));
});

app.post('/addProductToCart',shopping.addProductToCart);
app.get('/deleteFromCart/:Item',function(req,res){
	shopping.deleteFromCart(req,res,req.param('Item'));
});
app.get('/myCart',shopping.viewCart);
app.get('/myAccount',shopping.viewAccount);


// admin tasks
app.get('/addcatalogs',function(req,res){
	shopping.addcatalogs("",req,res);	
});
app.post('/addcatalogs',shopping.addnewcatalog);
app.get('/addproducts',function(req,res){
	shopping.addproducts("",req,res);
});	
app.post('/addproducts',shopping.addnewproducts);


http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
	
	// create db connections pool
	mysql.createPool();
});
