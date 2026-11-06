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
      console.log("GET ROUTE HIT");
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

    // update product data
    app.patch("/products/:id", async (req, res) => {
      console.log("PATCH ROUTE HIT");

      const id = req.params.id;
      const updatedProduct = req.body;

      console.log("ID:", id);
      console.log("Updated Product:", updatedProduct);

      const result = await productsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedProduct });

      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;

      const result = await productsCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });

    // brand route handler
    const brandCollections = db.collection("brands");

    // post brand data
    app.post("/brands", async (req, res) => {
      const formData = req.body;

      const result = await brandCollections.insertOne(formData);

      res.send(result);
    });

    // get brands
    app.get("/brands", async (req, res) => {
      const result = await brandCollections.find().toArray();
      res.send(result);
    });

    // get brand by id or slug
    app.get("/brands/:id", async (req, res) => {
      const id = req.params.id;

      const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { slug: id };

      const result = await brandCollections.findOne(query);

      if (!result) {
        return res.status(404).send({ message: "Brand not found" });
      }

      res.send(result);
    });

    // update brand by id or slug
    app.patch("/brands/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      console.log("id:---", id);
      console.log("updated data:---", updatedData);

      const query = { _id: new ObjectId(id) };
      const result = await brandCollections.updateOne(query, { $set: updatedData });

      res.send(result);
    });

    // delete brand data
    // app.delete("/brands/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };

    //   const result = await brandCollections.deleteOne(query);
    //   res.send(result);
    // });

    // delete multiple brand data
    app.delete("/brands/bulk", async (req, res) => {
      const { ids } = req.body;

      console.log("ids:----", ids);

      const query = {
        _id: {
          $in: ids.map((id) => new ObjectId(id)),
        },
      };

      const result = await brandCollections.deleteMany(query);

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
