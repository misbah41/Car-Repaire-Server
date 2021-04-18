const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const cors = require("cors");
const fs = require("fs-extra");
require("dotenv").config();
const app = express();
const port = 3500;

app.use(fileUpload());
app.use(bodyParser.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qwvsk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  console.log(err);
  const adminCollection = client.db("carRepairDatabase").collection("admin");
  const reviewCollection = client.db("carRepairDatabase").collection("reviews");
  const ordersCollection = client.db("carRepairDatabase").collection("orders");
  const servicesCollection = client
    .db("carRepairDatabase")
    .collection("services");

  //root api
  app.get("/", (req, res) => {
    res.send("Wonderful Misbah Hasan Error not solved solved");
  });

  app.post("/addReview", (req, res) => {
    const review = req.body;
    console.log("here is review", review);
    reviewCollection.insertOne(review).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/userReview", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //add service by post method start
  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const servicePrice = req.body.servicePrice;
    const discount = req.body.discount;
    const serviceOff = req.body.serviceOff;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    servicesCollection
      .insertOne({
        name,
        servicePrice,
        file,
        discount,
        serviceOff,
        description,
        image,
      })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });
  //add service by post method end

  // //get sngle service by get method
  app.get("/serviceById/:id", (req, res) => {
    servicesCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, service) => {
        res.send(service[0]);
      });
  });

  app.get("/loadServicesData", (req, res) => {
    servicesCollection.find({}).toArray((err, items) => {
      res.send(items);
    });
  });


  //user ordersCollection
  app.post("/addorder", (req, res) => {
    const newOrder = req.body;
    console.log('here und',newOrder);
    ordersCollection.insertOne(newOrder).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });






//all orders list
app.get('/allOrdersList',(req, res)=>{
  ordersCollection.find({})
  .toArray((err, documents)=>{
    res.send(documents)
  })
})



  //add admin for the appliaction
  app.post('/adminAccess',(req, res) => {
    const adminemail = req.body;
    adminCollection.insertOne(adminemail).then((result) => {
      res.send(result.insertedCount > 0);
    })
  });

//conditional rendering api
  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email }).toArray((err, doctors) => {
      res.send(doctors.length > 0);
    });
  });




  app.get("/bookingList/:email", (req, res) => {
		ordersCollection.find({ email: req.params.email }).toArray(
			(err, documents) => {
				console.log(documents);
				res.send(documents);
			}
		);
	});


  //manage service api
  app.delete("/delete/:id", (req, res) => {
    servicesCollection
      .findOneAndDelete({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });

  


  console.log("database connected successfully");
});

app.listen(process.env.PORT ||port );


