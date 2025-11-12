require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion } = require("mongodb");
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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db("krishi_db");
    const cropsCollection = db.collection("all_crops");
    const usersCollection = db.collection("users");
    
    app.post("/crop", async (req, res) => {
      const newCrop = req.body;
      const result = await cropsCollection.insertOne(newCrop);
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

    app.get("/crop/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await cropsCollection.findOne(query);
      res.send(result);
    });

app.patch("/crop/:id", async (req, res) => {
  const id = req.params.id;
  const updatedCrop = req.body;
  const query = { _id: new ObjectId(id) };
  const update = {
    $set: { name: updatedCrop.name, price: updatedCrop.price },
  };
  const options = {};
  cropsCollection.updateOne(query, update, options);
});

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
 
  }
}
run().catch(console.dir);
