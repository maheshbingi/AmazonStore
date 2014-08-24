var ArrayList = require("javascript.util").ArrayList;
var mysql = require('mysql');
var queue = require('queue');
var ejs= require('ejs');

var mysqlConnectionPool = new ArrayList();
var connectionQueue=new queue();

function createPool(){
	
	for(var i=0;i<10;i++ ){
		
		connection = mysql.createConnection({
			  host     : 'localhost',
			  user     : 'root',
			  password : '',
			  port	   : 3306,
			  database: 'AWS'
			});
		mysqlConnectionPool.add(connection);
	}
}

function allocateResource(connectionQueue)
{
	while(true)
	{
		if(! mysqlConnectionPool.isEmpty()){
			
			connectionQueue.pop();
			var conn=mysqlConnectionPool.get(mysqlConnectionPool.size()-1);
			mysqlConnectionPool.remove(conn);
			
			return conn;
		}
		else
		{
			console.log("waiting for connection...");
		}
	}
}


function getConnection(client) {
	

	if(! mysqlConnectionPool.isEmpty()){
		var conn=mysqlConnectionPool.get(mysqlConnectionPool.size()-1);
		mysqlConnectionPool.remove(conn);
	
		return conn;
	}
	else
	{
		console.log("Out of connections");
		connectionQueue.push(client);
		allocateResource(connectionQueue);
	}
}

function connectionRelease(connection)
{
	mysqlConnectionPool.add(connection);
}


function fetchData(callback,sqlQuery){
	
	console.log("\nSQL Query::"+sqlQuery);
	
	var connection=getConnection(this);
	
	connection.query(sqlQuery, function(err, rows, fields) {
		if(err){
			console.log("ERROR: " + err.message);
		}
		else 
		{	// return err or result
			callback(err, rows);
		}
	});
	console.log("\nConnection Released..");
	connectionRelease(connection);
}	


function insertData(callback,sqlQuery){
	
	console.log("\n SQL Query: "+sqlQuery);
	
	var connection=getConnection(this);
	
	connection.query(sqlQuery, function(err,rows, fields) {
		if (err) {
            console.log("ERROR: " + err.message);
        }
		else
		{
			console.log(rows);
			callback(err,rows);
		}
	});
	console.log("\nConnection Released..");
	connectionRelease(connection);
}		


exports.fetchData=fetchData;
exports.insertData=insertData;
exports.createPool=createPool;
exports.allocateResource=allocateResource;
exports.getConnection=getConnection;
exports.connectionRelease=connectionRelease;