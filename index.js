const dns = require("node:dns");
dns.setServers(["8.8.8.8"]);
require("dotenv").config();

const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const port = 4000;
const cors = require("cors");
app.use(express.json());
app.use(cors());

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

    // get products
    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });

    // get products by slug
    // app.get("/products/:slug", async (req, res) => {
    //   const slug = req.params.slug;
    //   const result = await productsCollection.findOne({ slug: slug });
    //   res.send(result);
    // });

    app.get("/products/:identifier", async (req, res) => {
      const identifier = req.params.identifier;

      const query = {
        $or: [
          { productName: identifier },
          { slug: identifier },
          { brand: identifier },
          { category: identifier },
          { price: identifier },
          { color: identifier },
          { ram: identifier },
          { internalStorage: identifier },
        ],
      };

      if (ObjectId.isValid(identifier)) {
        query.$or.push({ _id: new ObjectId(identifier) });
      }

      const result = await productsCollection.find(query).toArray();
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
    // await client.close();
  }
}

run().catch(console.dir);
