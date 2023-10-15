const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_SECRET_KEY}@cluster0.bjwj9uc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const coffeeCollection = client.db('coffeeDB').collection('coffee');

        // user database
        const userCollection = client.db('coffeeDB').collection('user')
        // step 2
        // get api data from server
        app.get('/coffee', async (req, res) => {
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // get api data id wise
        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })

        //step-1
        // create database & send to the server
        app.post('/coffee', async (req, res) => {
            const newCoffeeItem = req.body;
            console.log(newCoffeeItem);
            // send data to database
            const result = await coffeeCollection.insertOne(newCoffeeItem);
            res.send(result);
        })

        //step -3
        // delete a api data
        app.delete('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        })

        // update a single api
        app.put('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedCoffee = req.body;

            const newCoffee = {
                $set: {
                    name: updatedCoffee.name,
                    quantity: updatedCoffee.quantity,
                    supplier: updatedCoffee.supplier,
                    taste: updatedCoffee.taste, category: updatedCoffee.category,
                    details: updatedCoffee.details,
                    photo: updatedCoffee.photo
                }
            }
            const result = await coffeeCollection.updateOne(filter, newCoffee, options);
            res.send(result);

        })

        // user related api

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            console.log(newUser);
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        app.patch('/users', async (req, res) => {
            const updateUser = req.body;
            const filter = { email: updateUser.email };
            const updateDoc = {
                $set: {
                    lastLoggedAt: updateUser.lastLoggedAt
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Coffee store server is running')
})

app.listen(port, () => {
    console.log(`coffee server is running on port ${port}`);
})