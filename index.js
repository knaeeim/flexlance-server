const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;

require("dotenv").config();
app.use(cors());
app.use(express.json());


const uri =
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.plgxbak.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const postedDataCollection = client.db("flexlance").collection("postedData");
        const userCollection = client.db("flexlance").collection("users");
        const bidCountCollection = client.db("flexlance").collection("bidCount");

        //fetching all data by email
        app.get("/alldatabyemail/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await postedDataCollection.find(query).toArray();
            res.send(result);
        })

        // get a specific user by email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            if(user){
                res.send(user);
            }
            else{
                res.status(404).send({message: 'User not found'});
            }
            
        })

        app.get('/category', async (req, res) => {
            const category = req.query.category;
            console.log(category);
            const query = { category: category }; 
            const result = await postedDataCollection.find(query).toArray(); 
            res.send(result);
        })

        // POST API for user data
        app.get('/users', async (req, res) => {
            const user = await userCollection.find().toArray()
            res.send(user);
        })

        // user creation post API
        app.post('/users', async (req, res) => {
            console.log(req.body);
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        })


        // get API for posted data
        app.get('/allData', async (req, res) => {
            const allData = await postedDataCollection.find().toArray();
            res.send(allData);
        })

        // single Data
        app.get('/allData/:id', async (req, res) => {
            console.log(req.params.id);
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await postedDataCollection.findOne(query);
            res.send(result);
        })

        // Update a specific data
        app.put('/updateData/:id', async (req, res) =>{
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    ...data
                }
            }
            const result = await postedDataCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })


        app.patch("/updateData/:id", async (req, res) => {
            const id = req.params.id;
            const { bidCount } = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: { bidCount : bidCount
                }
            }
            const result = await postedDataCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.post("/bidCount", async (req, res) => {
            const bid = req.body;
            const result = await bidCountCollection.insertOne(bid);
            res.send(result); 
        })


        // add task api
        app.post('/addTask', async (req, res) => {
            const task = req.body;
            const result = await postedDataCollection.insertOne(task);
            res.send(result);
        })

        // delete a specific data
        app.delete('/deleteData/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id : new ObjectId(id) };
            const result = await postedDataCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
