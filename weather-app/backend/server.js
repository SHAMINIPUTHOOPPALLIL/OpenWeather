const MongoClient = require("mongodb").MongoClient;
const CONNECTION_URL = "mongodb+srv://test:test@weather-gsyzm.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "weatherstore";
const ObjectId = require("mongodb").ObjectID;

var express = require('express')
var app = express()

var cors = require('cors')
var bodyParser = require('body-parser')
var jwt = require('jwt-simple')

//var auth = require('./auth.js')

app.use(cors())
app.use(bodyParser.json())

var database, usercollection;

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        usercollection = database.collection("user"); 
        countrycollection = database.collection("country"); 
        citycollection = database.collection("city");        
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});

app.get("/countries", (request, response) => {
    console.log(request.query.search);
    countrycollection.find({name: new RegExp('^' + request.query.search, 'i')}).toArray((error, countries) => {
        if(error) {
            return response.status(500).send(error);
        }        
        response.send(countries);
    });
});

app.get("/cities", (request, response) => {
    citycollection.find({ $and: [{name: new RegExp('^' + request.query.search, 'i')}, {country: request.query.country}]}).toArray((error, cities) => {
        if(error) {
            return response.status(500).send(error);
        }        
        response.send(cities);
    });
});

app.get("/users", (request, response) => {
    usercollection.find({}).toArray((error, users) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(users);
    });
});

app.get("/users/:id", (request, response) => {
    console.log(request.params.id)
    usercollection.findOne({ "_id": new ObjectId(request.params.id) }, {projection: { firstName: true, lastName: true }}, (error, user) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(user);
    });
});

app.post("/register", (request, response) => {    
    usercollection.insert(request.body, (error, newUser) => {
        if(error) {
            return response.status(500).send(error);
        }
        createSendToken(response, newUser)
    });
});

app.post("/authenticate", (request, response) => {
    var loginData = request.body
    console.log(loginData);

    usercollection.findOne({"username": new RegExp('^' + loginData.username + '$', 'i')}, (error, user) => { //{ "username": loginData.username }, (error, user) => {
        if(error) {
            return response.status(500).send(error);
        } else if (!user) {
            return response.status(401).send({ message: 'Username or Password invalid' })
        } else if (loginData.password != user.password) {
            return response.status(401).send({ message: 'Username or Password invalid' })
        } else {
            createSendToken(response, user)
        }
    });    
});

app.post("/countries", (request, response) => {    
    countrycollection.insertMany(request.body, (error, countries) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.status(200).send(countries);
    });
});

app.post("/cities", (request, response) => {    
    citycollection.insertMany(request.body, (error, cities) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.status(200).send(cities);
    });
});

function createSendToken(response, user) {
    var payload = { sub: user._id }

    var token = jwt.encode(payload, '123')
    console.log(user)
    response.status(200).send({ 'token': token, 'firstName': user.firstName, 'lastName': user.lastName, 'username' : user.username })
}

app.get('/', (req, res) => {
    res.send('Hello from App Engine!');
  });