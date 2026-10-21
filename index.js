const dns = require("node:dns");
dns.setServers(["8.8.8.8"]);
require("dotenv").config();

const { MongoClient } = require("mongodb");
const express = require("express");
const app = express();
const port = 4000;
app.use(express.json());

const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.fmz6hpp.mongodb.net/`;

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");

    // database collection
    const db = client.db("simple-gadgets");
    const productsCollection = db.collection("products");

    // !CRUD OPERATION START
    // post product
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });
    // !CRUD OPERATION END

    app.get("/", (req, res) => {
      res.send("server is running");
    });

    app.listen(port, () => {
      console.log(`the server is running on port ${port}`);
    });
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
