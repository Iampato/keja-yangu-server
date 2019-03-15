
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var cors = require('cors');
 
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))                                        // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(cors());

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});
 


var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null) {
  var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
  if (process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
    mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
    mongoUser = process.env[mongoServiceName + '_USER'];

  // If using env vars from secret from service binding  
  } else if (process.env.database_name) {
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
    var mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
      if (mongoUriParts && mongoUriParts.length == 2) {
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongoose.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};


// Models
var Room = mongoose.model('Room', {
    UID: String,
    AdID: String,
    RoomType: String,
  College: [String],
  Address: String,
    Eircode: String,
    LocationDes: String,
    Price: Number,
    Availability: String,
    Email: String,
    Phone: String,
    Contact: String,
    Description: String,
    Wifi: String,
  ImagesUrl: [String],
  Date: Date,
});

var Property = mongoose.model('Property', {
    UID: String,
    AdID: String,
    PropertyType: String,
  SingleBeds: Number,
  DoubleBeds: Number,
  TwinBeds: Number,
  Bedsitter: Number,
  NoRooms: Number,
    College: [String],
  Address: String,
    Eircode: String,
    LocationDes: String,
    Price: Number,
    Availability: String,
    Email: String,
    Phone: String,
    Contact: String,
    Description: String,
    Wifi: String,
  ImagesUrl: [String],
  Date: Date,
});

var Message = mongoose.model('Message', {
    UID: String,
    ID: String,
    Message: String,
    Name: String,
    Email: String,
  Date: Date,
});
 
// Routes
 
// Get rooms
app.get('/api/rooms', function(req, res) {

  console.log("fetching rooms");
  // use mongoose to get all rooms in the database
  Room.find(function( err, rooms) {

    // if there is an error retrieving, send the error. nothing after res.send(err) will execute
    if (err)
      res.send(err)

    res.json(rooms); // return all rooms in JSON format
  });
});

// Get Properties
app.get('/api/properties', function(req, res) {

  console.log("fetching properties");

  // use mongoose to get all properties in the database
  Property.find(function(err, properties) {

    // if there is an error retrieving, send the error. nothing after res.send(err) will execute
    if (err)
      res.send(err)

    res.json(properties); // return all properties in JSON format
  });
});

// Get myRooms
app.get('/api/myRooms/:UID', function(req, res) {
  let UID = req.params.UID;
  console.log("fetching my rooms" + UID);

  // use mongoose to get all rooms belonging to user with UID in the database
  Room.find({"UID": UID}, function(err, rooms) {

    // if there is an error retrieving, send the error. nothing after res.send(err) will execute
    if (err)
      res.send(err)

    res.json(rooms); // return all rooms in JSON format
  });
});

// Get myProperties
app.get('/api/myProperties/:UID', function(req, res) {
  let UID = req.params.UID;
  console.log("fetching my properties" + UID);

  // use mongoose to get all properties belonging to user with UID in the database
  Property.find({"UID": UID}, function(err, properties) {

    // if there is an error retrieving, send the error. nothing after res.send(err) will execute
    if (err)
      res.send(err)

    res.json(properties); // return all properties in JSON format
  });
});

// Get Messages
app.get('/api/messages', function (req, res) {

  console.log("fetching messages");

  // use mongoose to get all messages in the database
  Message.find(function (err, messages) {

    // if there is an error retrieving, send the error. nothing after res.send(err) will execute
    if (err)
      res.send(err)

    res.json(messages); // return all messages in JSON format
  });
});

// create rooms and send back all rooms after creation
app.post('/api/rooms', function(req, res) {

  console.log("******Creating room******");
  console.log("Images URL coming through: " + req.body.ImageURL);
  console.log("ADID coming through: " + req.body.AdID);
  

  // create room, information comes from request from Ionic
  Room.create({
    UID: req.body.UID,
    AdID: req.body.AdID,
    RoomType: req.body.RoomType,
    College: req.body.College,
    Eircode: req.body.Eircode,
    Address: req.body.Address,
    LocationDes: req.body.LocationDes,
    Price: req.body.Price,
    Availability: req.body.Availability,
    Email: req.body.Email,
    Phone: req.body.Phone,
    Contact: req.body.Contact,
    Description: req.body.Description,
    Wifif: req.body.Wifi,
    ImagesUrl: req.body.ImageURL,
    Date: req.body.Date,
    done : false
  }, function(err, room) {
    if (err)
      res.send(err);

    // get and return all the rooms after you create another
    Room.find(function(err, rooms) {
      if (err)
        res.send(err)
      res.json(rooms);
    });
  });

});

// create properties and send back all properties after creation
app.post('/api/properties', function(req, res) {

  console.log("creating properties");
  let d = Number(req.body.DoubleBeds);
  let s = Number(req.body.SingleBeds);
  let t = Number(req.body.TwinBeds);
  let e = Number(req.body.Bedsitter);
  let total = d + s + t + e;

  // create a property, information comes from request from Ionic
  Property.create({
    UID: req.body.UID,
    AdID: req.body.AdID,
    PropertyType: req.body.PropertyType,
    SingleBeds: req.body.SingleBeds,
    DoubleBeds: req.body.DoubleBeds,
    TwinBeds: req.body.TwinBeds,
    Bedsitter: req.body.Bedsitter,
    NoRooms: total,
    College: req.body.College,
    Eircode: req.body.Eircode,
    Address: req.body.Address,
    LocationDes: req.body.LocationDes,
    Price: req.body.Price,
    Availability: req.body.Availability,
    Email: req.body.Email,
    Phone: req.body.Phone,
    Contact: req.body.Contact,
    Description: req.body.Description,
    Wifi: req.body.Wifi,
    ImagesUrl: req.body.ImageURL,
    Date: req.body.Date,
    done : false
  }, function(err, property) {
    if (err)
      res.send(err);
    // get and return all the properties after you create another
    Property.find(function(err, properties) {
      if (err)
        res.send(err)
      res.json(properties);
    });
  });

});


// create messages and send back all properties after creation
app.post('/api/messages', function (req, res) {

  console.log("creating messages");

  // create a messages, information comes from request from Ionic
  Message.create({
    UID: req.body.UID,
    AdID: req.body.AdID,
    Message: req.body.Message,
    Name: req.body.Name,
    Email: req.body.Email,
    Date: req.body.Date,
    done: false
  }, function (err, message) {
    if (err)
      res.send(err);

    // get and return all the messages after you create another
    Message.find(function (err, messages) {
      if (err)
        res.send(err)
      res.json(messages);
    });
  });

});

// delete a room
app.delete('/api/rooms/:room_id', function(req, res) {
  Room.remove({
    "_id" : req.params.room_id
  }, function(err, room) {

  });
});

// delete a property
app.delete('/api/properties/:property_id', function(req, res) {
  Property.remove({
    "_id" : req.params.property_id
  }, function(err, property) {

  });
});

app.delete('/api/messages/:message_id', function (req, res) {
  Message.remove({
    "_id": req.params.message_id
  }, function (err, message) {

  });
});

// update property ad
app.put('/api/properties/:UID', function(req, res) {
  
  let UID = req.body.UID;
  let d = Number(req.body.DoubleBeds);
  let s = Number(req.body.SingleBeds);
  let t = Number(req.body.TwinBeds);
  let e = Number(req.body.Bedsitter);
  let total = d + s + t + e;
  //delete old ad
  Property.remove({
    "_id" : req.params.UID
  }, function(err, property) {

  });
  
  //create new ad
  Property.create({
    UID: req.body.UID,
    AdID: req.body.AdID,
    PropertyType: req.body.PropertyType,
    SingleBeds: req.body.SingleBeds,
    DoubleBeds: req.body.DoubleBeds,
    TwinBeds: req.body.TwinBeds,
    NoRooms: total,
    Bedsitter: req.body.Bedsitter,
    College: req.body.College,
    Eircode: req.body.Eircode,
    Address: req.body.Address,
    LocationDes: req.body.LocationDes,
    Price: req.body.Price,
    Availability: req.body.Availability,
    Email: req.body.Email,
    Phone: req.body.Phone,
    Contact: req.body.Contact,
    Description: req.body.Description,
    Wifi: req.body.Wifi,
    ImagesUrl: req.body.ImageURL,
    Date: req.body.Date,
    done : false
  }, function(err, property) {
    if (err)
      res.send(err);
    // use mongoose to get all properties belonging to user with UID in the database
    Property.find({"UID": UID}, function(err, properties) {

      // if there is an error retrieving, send the error. nothing after res.send(err) will execute
      if (err)
        res.send(err)

      res.json(properties); // return all properties in JSON format
    });
  });
});

// update Room ad
app.put('/api/rooms/:UID', function(req, res) {
  
  let UID = req.body.UID;
  //delete old ad
  Room.remove({
    "_id" : req.params.UID
  }, function(err, room) {

  });
  
  //create new ad
  Room.create({
    UID: req.body.UID,
    AdID: req.body.AdID,
    RoomType: req.body.RoomType,
    College: req.body.College,
    Eircode: req.body.Eircode,
    Address: req.body.Address,
    LocationDes: req.body.LocationDes,
    Price: req.body.Price,
    Availability: req.body.Availability,
    Email: req.body.Email,
    Phone: req.body.Phone,
    Contact: req.body.Contact,
    Description: req.body.Description,
    Wifi: req.body.Wifi,
    ImagesUrl: req.body.ImageURL,
    Date: req.body.Date,
    done : false
  }, function(err, room) {
    if (err)
      res.send(err);

    // get and return all the rooms after you create another
    Room.find(function(err, rooms) {
      if (err)
        res.send(err)
      res.json(rooms);
    });
  });
});


app.get('/api/searchProperties/:Col/:numRooms/:wifi', function(req, res) {
  let Col = req.params.Col;
  let numRooms = req.params.numRooms;
  let Wifi = req.params.wifi;
  console.log("fetching Search properties" + Col + numRooms);

  // use mongoose to get all properties with this earch criteria in the database
  Property.find({"College": Col, "NoRooms":numRooms, "Wifi": Wifi}, function(err, properties) {

    // if there is an error retrieving, send the error. nothing after res.send(err) will execute
    if (err)
      res.send(err)

    res.json(properties); // return all properties in JSON format
  });
});

app.get('/api/searchProperties/:col/:numRooms/:wifi/:price', function(req, res) {
  let Col = req.params.col;
  let numRooms = req.params.numRooms;
  let Wifi = req.params.wifi;
  let Price = req.params.price
  console.log("fetching Search properties" + Col + numRooms);

  // use mongoose to get all properties with this earch criteria in the database
  Property.find({"College": Col, "NoRooms":numRooms, "Wifi": Wifi, "Price": {$lt: Price }}, function(err, properties) {

    // if there is an error retrieving, send the error. nothing after res.send(err) will execute
    if (err)
      res.send(err)

    res.json(properties); // return all properties in JSON format
  });
});

// room search function on college, room type and wifi
app.get('/api/searchRooms/:col/:roomType/:wifi', function(req, res) {
  let col = req.params.col;
  let roomType = req.params.roomType;
  let wifi = req.params.wifi;
  console.log("fetching Search rooms" + col + roomType + wifi);

  // use mongoose to get all properties with this earch criteria in the database
  Room.find({"College": col, "RoomType": roomType, "Wifi": wifi}, function(err, rooms) {

    // if there is an error retrieving, send the error. nothing after res.send(err) will execute
    if (err)
      res.send(err)

    res.json(rooms); // return all properties in JSON format
  });
});


app.get('/api/searchRooms/:col/:roomType/:wifi/:price', function(req, res) {
  let col = req.params.col;
  let roomType = req.params.roomType;
  let wifi = req.params.wifi;
  let price = req.params.price
  console.log("fetching Search Rooms" + col + roomType + wifi + price);

  // use mongoose to get all properties with this earch criteria in the database
  Room.find({"College": col, "RoomType": roomType, "Wifi": wifi, "Price": {$lt: price }}, function(err, rooms) {

    // if there is an error retrieving, send the error. nothing after res.send(err) will execute
    if (err)
      res.send(err)

    res.json(rooms); // return all properties in JSON format
  });
});

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
