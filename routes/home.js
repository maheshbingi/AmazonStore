var ejs = require("ejs");
var mysql = require('./mysql');
var shopping = require('./shopping');

function signup(req,res) {
	 ejs.renderFile('./views/signup.ejs',{isuser:false},function(err, result) {
	        // render on success
	        if (!err) {
	            res.end(result);
	        }
	        // render or error
	        else {
	            res.end('An error occurred');
	            console.log(err);
	        }
	    });
}


function signin(req,res) {
	if(req.param("action") === "signup")
	{
		// check user already exists
		var getUsersList="select * from users where emailid='"+req.param("inputEmailID")+"'";
		
		mysql.fetchData(function(err,results){
			if(err){
				throw err;
			}
			else 
			{
				if(results.length > 0){
					console.log("User already exists..");
					ejs.renderFile('./views/signup.ejs',{isuser:true},function(err, result) {
				        // render on success
				        if (!err) {
				            res.end(result);
				        }
				        // render or error
				        else {
				            res.end('An error occurred');
				            console.log(err);
				        }
				    });
				}
				else {    
					
					// insert user details in database
					var sqlInsertUser="insert into USERS values('"+req.param('inputEmailID')+"','"+req.param('inputPassword')+"','"+req.param('inputFirstName')+"','"+req.param('inputLastName')+"',CURRENT_TIMESTAMP)";
					mysql.insertData(function(err,results){
						if(err){
							throw err;
						}
						else{
							console.log("\nNew User inserted into DB");
							ejs.renderFile('./views/signin.ejs',{isValidUser:true},function(err, result) {
						        // render on success
						        if (!err) {
						            res.end(result);
						        }
						        // render or error
						        else {
						            res.end('An error occurred');
						            console.log(err);
						        }
						    });
						}  
					},sqlInsertUser);
				}
			}  
		},getUsersList);
	}
	else			// normal login 
	{
		ejs.renderFile('./views/signin.ejs',{isValidUser:true},function(err, result) {
	        // render on success
	        if (!err) {
	            res.end(result);
	        }
	        // render or error
	        else {
	            res.end('An error occurred');
	            console.log(err);
	        }
	    });
	}	
}


function showcatalogs(req,res){
	
	if(!req.body.hasOwnProperty('inputUsername') ||!req.body.hasOwnProperty('inputPassword')) {
		res.statusCode = 400;
		return res.send('Error 400: Post syntax incorrect.');
	}
	
	// Admin Login
	if(req.body.inputUsername=='admin@gmail.com' && req.body.inputPassword=='admin')
	{
		shopping.addcatalogs("",req,res);
	}

	else
	{
		var sqlQuery="select * from users where emailid='"+req.body.inputUsername+"' and password='"+req.body.inputPassword+"'";
		mysql.fetchData(function(err,results)
		{
			if(err){
				throw err;
			}
			else
			{
				if(results.length >0)   	// Valid username and password
				{
					// set session before going to logged in
					req.session.user={ username: results[0].emailid};
					console.log("Session details::::"+JSON.stringify(req.session));
					
					// update login time in database
					var sqlUpdateLastLogin="update users set lastlogin=CURRENT_TIMESTAMP where emailid='"+req.body.inputUsername+"'";
					mysql.insertData(function(err,results){
						if(err){
							throw err;
						}
						else{
							console.log("\nLast login updated..");
						}  
					},sqlUpdateLastLogin);
					
					// show catalogs to user
					shopping.catalogs(req,res);
				
				}
				else{  // username or password is incorrect
					ejs.renderFile('./views/signin.ejs',{isValidUser:false}, function(err, result) {
				        // render on success
				        if (!err) {
				            res.end(result);
				        }
				        // render or error
				        else {
				            res.end('An error occurred');
				            console.log(err);
				        }
				    });
				}
			}  
		},sqlQuery);
	}	
}


function logout(req,res) {
	
	console.log("\nSession going to be deleted::"+JSON.stringify(req.session));
	req.session.destroy();
	console.log("\nSession deleted::"+JSON.stringify(req.session));
	   
    ejs.renderFile('./views/signin.ejs',{isValidUser:true},function(err, result) {
        // render on success
        if (!err) {
            res.end(result);
        }
        // render or error
        else {
            res.end('An error occurred');
            console.log(err);
        }
    });
}

function isValidSession(req,res)
{
	if(req.session.user)
		return true;
	else
		return false;
}

exports.signup=signup;
exports.signin=signin;
exports.showcatalogs=showcatalogs;
exports.logout=logout;
exports.isValidSession=isValidSession;
