let express = require('express');
let path = require('path');
let dotenv = require('dotenv');
let app = express();
let port = 5001;
let cookie_parser = require('cookie-parser')
// let mysql2 = require('mysql2');

dotenv.config(
    {
        path: './.env'
    }
);
// let db = mysql2.createConnection(
//     {
//         host: process.env.DATABASE_HOST,
//         user: process.env.DATABASE_USER,
//         password: process.env.DATABASE_PASSWORD,
//         database: process.env.DATABASE,
//         port: process.env.DATABASE_PORT
//     })

app.set('view engine', 'hbs');
app.use(express.urlencoded(
    { 
        extended: true 
    }
    ));

app.use(express.json());
app.use(cookie_parser());

// define the routes
app.use("/", require('./routes/register_routes'));
app.use("/auth", require('./routes/auth'));

app.listen(port,function () {
    console.log('Server has started');
    // db.connect((err) => {
    //     if (err){
    //         console.log("Error" + err)
    //     }
    //     else {
    //         console.log("Database Connected");
    //     }
    // });
});