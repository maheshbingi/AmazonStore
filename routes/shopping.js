var ejs = require("ejs");
var mysql = require('./mysql');
var noItemsInDB=0;


function addcatalogs(message,req,res)
{
	
	ejs.renderFile('./views/adminhome.ejs',{ message:message }, 
			function(err, result) {
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

function addnewcatalog(req,res)
{
	var sqlQuery="SELECT * FROM PRODUCTCATALOGS WHERE Name='"+req.body.inputCatalogName+"'";
	
	mysql.fetchData(function(err, catalogRows) 
	{
		// Check if catalog already exists
		if(catalogRows.length > 0)
		{
			console.log("\nCatalog: "+req.body.inputCatalogName+" already exists");
			addcatalogs(0,req,res);
		}
		else
		{
			console.log("\nAdding catalog to databse..");
			var sqlInsertCatalog="insert into ProductCatalogs(Name) values('"+req.param('inputCatalogName')+"')";
			
			mysql.insertData(function(err,results){
				if(err){
					throw err;
				}
				else{
					console.log("\nNew Catalog inserted into DB");
					addcatalogs(1,req,res);
				}  
			},sqlInsertCatalog);
		}	
   },sqlQuery);
}


function addproducts(message,req,res)
{
var sqlQuery="select * from ProductCatalogs";
	
	mysql.fetchData(function(err, catalogRows) 
	{
		// get all catalogs
		if(catalogRows.length > 0)
		{
			ejs.renderFile('./views/addProducts.ejs',{ message:message ,catalogs:catalogRows}, 
					function(err, result) {
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
		else
		{
			res.end("No catalogs found !!");
		}	
	},sqlQuery);
}


function addnewproducts(req,res)
{
	var sqlQuery="SELECT * FROM PRODUCTS";
	
	mysql.fetchData(function(err, catalogRows) 
	{
		// get all catalogs
		if(catalogRows.length > 0)
		{
			console.log("\nCatalogs: "+catalogRows);
			
			var addProductQuery="insert into Products(categoryID,product_name,description,cost,quantity) values ((select id from ProductCatalogs where Name='"+req.body.category_list_product+"'),'"+req.body.inputProductName+"','"+req.body.inputProductDescription+"',"+req.body.inputProductCost+","+req.body.inputProductQuantity+")";
			
			mysql.insertData(function(err,results){
				if(err){
					throw err;
				}
				else{
					console.log("\nNew Product inserted into DB");
					addproducts(1,req,res);
				}  
			},addProductQuery);
		}
		else
		{
			console.log("\nNo catalogs found..");
			res.end("No catalogs found !!");
		}	
   },sqlQuery);
}

function catalogs(req,res) {
	
	// if has valid session (write generic session method with username)
	if(!req.session.user) {
		res.statusCode = 400;
		return res.send('Error 400: No Session found....');
	}
	
	var sqlQuery="SELECT * FROM PRODUCTS";
	
	mysql.fetchData(function(err, rows) {
		console.log("\nJSON Rows are::: "+rows.length);
		
		if(rows.length > 0)
		{
			console.log("DATA : "+JSON.stringify(rows));
		
			var sqlProdCatalogs="SELECT * FROM PRODUCTCATALOGS";
			mysql.fetchData(function(err, rowsCatalog) {
				if(!err)
				{
					
					var getLastLogin="select lastlogin from users where emailid='"+req.session.user.username+"'";
					mysql.fetchData(function(err, rowlastLogin) 
					{
						if(!err)
						{
							console.log("\nLastLogin::"+rowlastLogin[0].lastlogin);
							ejs.renderFile('./views/catalogs.ejs',{results: rows, Catalog:rowsCatalog, lastLogin:rowlastLogin[0].lastlogin}, 
									function(err, result) {
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
					},getLastLogin);
				}
			},sqlProdCatalogs);
			
		}
		else
		{
			console.log("\nNo catalogs found....");
			res.end('No catalogs found in databse');
		}	
	  },sqlQuery);
}


function viewcatalogs(req,res) {
	
	
	var sqlQuery="SELECT * FROM PRODUCTS";
	
	mysql.fetchData(function(err, rows) {
		console.log("\nJSON Rows are::: "+rows.length);
		
		if(rows.length > 0)
		{
			console.log("DATA : "+JSON.stringify(rows));
		
			var sqlProdCatalogs="SELECT * FROM PRODUCTCATALOGS";
			mysql.fetchData(function(err, rowsCatalog) {
				if(!err)
				{
					
					ejs.renderFile('./views/catalogs.ejs',{results: rows, Catalog:rowsCatalog, lastLogin:""}, 
							function(err, result) {
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
			},sqlProdCatalogs);
			
		}
		else
		{
			console.log("\nNo catalogs found....");
			res.end('No catalogs found in databse');
		}	
	  },sqlQuery);
}

function addProductToCart(req,res){
	
	console.log("\nIn add to cart POST call.."+req);
	console.log("\nProduct ID:"+req.body.productName);
	console.log("\nProduct Quantity:"+req.body.productCount);
	
	// get available items from database
	var getItemsInDB="select * from Products where product_name='"+req.body.productName+"'";
	
	mysql.fetchData(function(err,getProducts){
		if(err){
			throw err;
		}
		else{
			console.log("\nItems in DB: "+JSON.stringify(getProducts));
			noItemsInDB=getProducts[0].quantity;
			console.log("\nIn Else part NoItemsInDB: "+noItemsInDB);
			//return results[0].quantity;
			
			// Items are available
			if(noItemsInDB > req.body.productCount){
				
				console.log("\n In next If part NoItemsInDB: "+noItemsInDB);
				// deduct that many no_of_items from database
				var updateNoOfItems="update Products set quantity=quantity-"+req.body.productCount+" where product_name='"+req.body.productName+"'";
				mysql.insertData(function(err,updProducts){
					if(err){
						throw err;
					}
					else{
							console.log("\nItems duducted from DB..");
							
							// add items into shipping cart
							var addItemsToCart="insert into ShoppingCart values('"+req.session.user.username+"','"+req.sessionID+"','"+req.body.productName+"',"+req.body.productCount+","+(req.body.productCount * getProducts[0].cost)+")";
							mysql.insertData(function(err,results){
								if(err){
									throw err;
								}
								else{
									console.log("\nItems added to Shopping Cart..");
									res.send(req.body);
								}  
							},addItemsToCart);
					}  
				},updateNoOfItems);
				
				
			}
		}  
	},getItemsInDB);
}


function viewCart(req,res){

	// if has valid session
	if(!req.session.user) {
		res.statusCode = 400;
		return res.send('Error 400: No Session found....');
	}
	
	var sqlItemsInShoppingCart="select * from ShoppingCart where UserID='"+req.session.user.username+"' and SessionID='"+req.sessionID+"'";
	console.log("\nGet Items Query: "+sqlItemsInShoppingCart);
	
	mysql.fetchData(function(err, rows) {
		console.log("\nJSON Rows are::: "+rows.length);
		
		if(rows.length > 0){
			console.log("DATA from Shopping Cart : "+JSON.stringify(rows));
		
			ejs.renderFile('./views/shoppingCart.ejs',{myCart : rows}, 
					function(err, result) {
				// render on success
				if (!err) {
					console.log("\nDisplaying results to user..");
					res.end(result);
				}
				// render or error
				else {
					res.end('An error occurred');
					console.log(err);
				}
			});
		}
		else
		{
			console.log("\nNo items found in shopping Cart...");
			res.end('No items found in shopping Cart');
		}	
	  },sqlItemsInShoppingCart);
} 

function getCategory(req,res,Category)
{
	var sqlQuery="select * from Products where categoryID= (select id from ProductCatalogs where Name='"+Category+"')";
	
	mysql.fetchData(function(err, rows) 
	{
		if(rows.length > 0)
		{
			var sqlProdCatalogs="select * from ProductCatalogs";
			
			mysql.fetchData(function(err, rowsCatalog) {
				if(!err)
				{
					var getLastLogin="select lastlogin from users where emailid='"+req.session.user.username+"'";
					mysql.fetchData(function(err, rowlastLogin) 
					{
						if(!err)
						{
							console.log("\nLastLogin::"+rowlastLogin[0].lastlogin);
							ejs.renderFile('./views/catalogs.ejs',{results: rows, Catalog:rowsCatalog, lastLogin:rowlastLogin[0].lastlogin}, 
									function(err, result) {
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
					},getLastLogin);
				}
			},sqlProdCatalogs);
			
		}
		else
		{
			console.log("\nNo catalogs found....");
			res.end('No catalogs found in databse');
		}	
	},sqlQuery);
}


function checkout(req,res)
{
	console.log("\nIn checkout..");
	
	// insert current shopping cart items into UsersHistory Table
	var insertDataintoUsersHistory="insert into UsersHistory (select * from ShoppingCart where UserID='"+req.session.user.username+"' and SessionID='"+req.sessionID+"')";
	mysql.insertData(function(err,results){
		if(err){
			throw err;
		}
		else{
			console.log("\nItems inserted into User History..");
			
			// delete current session's shopping cart items
			var deleteDatafromCart="delete from ShoppingCart where UserID='"+req.session.user.username+"' and SessionID='"+req.sessionID+"'";
			mysql.insertData(function(err,results){
				if(err){
					throw err;
				}
				else{
					console.log("\nItems deleted from shopping cart..");
					
					// render checkout page
					ejs.renderFile('./views/checkout.ejs',function(err, result) {
						// render on success
						if (!err) {
							res.end(result);
						}
						// render or error
						else {
							res.end(err);
						}
					});
				}  
			},deleteDatafromCart);
		}  
	},insertDataintoUsersHistory);
}

function deleteFromCart(req,res,Item)
{
	// add items in products table
	var addItemsToProducts="update Products set quantity=quantity + (select productCount from ShoppingCart where productName='"+Item+"' and UserID='"+req.session.user.username+"')";

	mysql.insertData(function(err,results){
		if(err){
			throw err;
		}
		else{
			console.log("\nItem added to Products from Cart..");

			// remove item from shopping cart
			var removeItemFromCart="delete from ShoppingCart where productName='"+Item+"' and UserID='"+req.session.user.username+"'";

			mysql.insertData(function(err,results){
				if(err){
					throw err;
				}
				else{
					console.log("\nItem deleted from Shopping Cart..");
					viewCart(req,res);
					
				}  
			},removeItemFromCart);
		}  
	},addItemsToProducts);
}



function viewAccount(req,res){

	// if has valid session
	if(!req.session.user) {
		res.statusCode = 400;
		return res.send('Error 400: No Session found....');
	}
	
	var sqlItemsFromUsersHistory="select * from UsersHistory where UserID='"+req.session.user.username+"'";
	
	mysql.fetchData(function(err, rows) {
		
		if(rows.length > 0){
			console.log("DATA from Shopping Cart : "+JSON.stringify(rows));
		
			ejs.renderFile('./views/myAccount.ejs',{myAccount : rows}, 
					function(err, result) {
				// render on success
				if (!err) {
					console.log("\nDisplaying results to user..");
					res.end(result);
				}
				// render or error
				else {
					res.end('An error occurred');
					console.log(err);
				}
			});
		}
		else
		{
			console.log("\nNo catalogs found....");
			res.end('No records found in databse');
		}	
	  },sqlItemsFromUsersHistory);
} 

exports.addcatalogs=addcatalogs;
exports.addproducts=addproducts;
exports.addnewcatalog=addnewcatalog;
exports.addnewproducts=addnewproducts;
exports.catalogs=catalogs;
exports.viewcatalogs=viewcatalogs;
exports.addProductToCart=addProductToCart;
exports.viewCart=viewCart;
exports.getCategory=getCategory;
exports.checkout=checkout;
exports.deleteFromCart=deleteFromCart;
exports.viewAccount=viewAccount;