“Amazon Web Store” to demonstrate RESTful Services using NodeJS
===========

Developed a prototype of "Amazon Web Store" RESTful services using Node.js and Express framework. It includes below functionalities.

* Creating a RESTful service
* Functionality such as signUp, signIn, SignOut
* Admin can add catalog and products
* User can add & remove items from cart
* Performing CURD operation.
* Implementing connection pooling
* Implementing Cache
* Validation

It uses NodeJS framework and demonstrates RESTFul web services while communicating with the server. The application also used front-end framework called Bootstrap and jQuery. 

Processing Logic :
===========
* All communication between the client and server takes place using restful calls. 
* While starting server fetches all the data related to products and categories from the database and stores it into cache. So, when the user sign in and he is redirected to catalog page it fetches the list of categories and products from this cache and displays it to the user. 
* When the admin user add a new product or category it is inserted into the database and also they are updated in cache.
* When user add the item to the shopping cart it makes an request to the server for adding it to the shopping cart. Server takes the product details and execute a SQL query to insert it into the database. 
* All the data related to shopping cart is maintained in database and every time any operation happens on this data the values are updated in database.

Tools
===========
Created with Nodeclipse (Eclipse Marketplace, site)

Nodeclipse is free open-source project that grows with your contributions.
