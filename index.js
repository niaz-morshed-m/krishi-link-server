require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

async function run() {
  try {
   
    const db = client.db("krishi_db");
    const cropsCollection = db.collection("all_crops");
    const usersCollection = db.collection("users");
    
    app.post("/crop", async (req, res) => {
      const newCrop = req.body;
      const result = await cropsCollection.insertOne(newCrop);
      res.send(result);
    });

app.delete("/crop/delete/:id", async (req, res) => {
  const id = req.params.id;
let query;
if (ObjectId.isValid(id)) {
  query = {
    $or: [{ _id: new ObjectId(id) }, { _id: id }],
  };
} else {
  query = { _id: id };
}
  const result = await cropsCollection.deleteOne(query);
  res.send(result);
});

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
    
      if (existingUser) {
        res.send("user already available");
        console.log(newUser);
      } else {
         const result = await usersCollection.insertOne(newUser);
      res.send(result);
      }
 
    });
    app.get("/crop/latest", async (req, res) => {
      const cursor = cropsCollection
        .find()
        .sort({
          addTime: -1,
        })
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/crop/all", async (req, res) => {
      const cursor = cropsCollection
        .find()
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/crop/details/:id", async (req, res) => {
      const id = req.params.id;
    let query;
    if (ObjectId.isValid(id)) {
      query = {
        $or: [{ _id: new ObjectId(id) }, { _id: id }],
      };
    } else {
      query = { _id: id };
    }
      const result = await cropsCollection.findOne(query);
      res.send(result);
    });

app.patch("/user/:email", async (req, res) => {
  const email = req.params.email;
  const updatedUser = req.body;
  const query = { email: email};
  const update = {
    $set: { name: updatedUser.name, image: updatedUser.photoUrl },
  };
  const options = {};
 usersCollection.updateOne(query, update, options);
});

app.patch("/crop/:id", async (req, res) => {
  const id = req.params.id;
  const updatedCrop = req.body;
  const query = { _id: new ObjectId(id) };
  const update = {
    $set: { name: updatedCrop.name, type: updatedCrop.type , 
pricePerUnit: updatedCrop.pricePerUnit, unit: updatedCrop.unit , quantity: updatedCrop.quantity, description: updatedCrop.description , location:  updatedCrop.location , image: updatedCrop.image, },
  };
  const options = {};
  cropsCollection.updateOne(query, update, options);
});

app.patch("/crop/addInterest/:id/", async (req, res) => {
  const id = req.params.id;
  const newInterest = req.body; 
  console.log(newInterest)
  let query;
  if (ObjectId.isValid(id)) {
    query = { _id: new ObjectId(id) };
  } else {
    query = { _id: id };
  }

  const update = { $push: { interests: newInterest } };

  const result = await cropsCollection.updateOne(query, update);
  res.send(result);
});

app.get("/interests/:email", async (req, res) => {
    const email = req.params.email;

    const result = await client
      .db("krishi_db")
      .collection("all_crops")
      .aggregate([
        { $unwind: "$interests" },
        { $match: { "interests.userEmail": email } },
        {
          $project: {
            _id: 0,
            cropId: "$_id",
            cropName: "$name",
            ownerInfo: "$owner",
            location: 1,
            interest: "$interests",
          },
        },
      ])
      .toArray();

    res.send(result);
 
});

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {

 
  }
}
run().catch(console.dir);
