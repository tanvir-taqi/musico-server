const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000
const app = express();
require('dotenv').config()


// musico
// kCto8dYGGzCCuocD

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
})



const uri = process.env.DATABASE_ACCESS


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    if (err) {
        console.log(err.message);
        
    }
    else {
        console.log("database connection established");
    }
});


const run = async () =>{
    try{
        const serviceCollection = client.db('musico').collection('services')
        const reviewCollection = client.db('musico').collection('reviews')

        // load services from database and limit 
        app.get('/services', async (req , res)=>{
            
            const seeLimit =parseInt(req.query.service)
            const query = {}
            const count = await serviceCollection.estimatedDocumentCount()
            const cursor = serviceCollection.find(query) 
            const services = await cursor.limit(seeLimit).toArray()
            res.send({count,services})

        })

        // load single service details 
        app.get('/services/:id', async (req, res)=>{
            const serviceId = req.params.id
            
            const query = {_id: ObjectId(serviceId)}
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })


        // post reviews in database
        app.post('/reviews', async (req, res) => {
            const review = req.body
            console.log(review);
            const reviewId = await reviewCollection.insertOne(review)
            res.send(reviewId)
        })


        // get review by id 
        app.get('/reviews/:id', async (req, res) => {
            const reviewId = req.params.id
            const query = {service : reviewId}
            const cursor = reviewCollection.find(query)
            const review = await cursor.toArray()
            res.send(review)
        })



    }
    catch(err){
        console.log(err.message);
    }finally{

    }

}

run().catch(err =>console.log(err.message))


app.listen(port,()=>{
console.log('server is listening on port');
});