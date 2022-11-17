const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000
const app = express();
require('dotenv').config()
const jwt = require('jsonwebtoken')


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



const verifyJwt = (req,res,next) =>{
    const authHeader = req.headers.authorization
    if(!authHeader){
       return res.status(401).send({message:"unothorized user"})
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET , (err,decoded)=>{
        if(err){
          return  res.status(401).send({message:"unothorized user"})
        }
        req.decoded = decoded
        next()
    })
}


const run = async () =>{
    try{
        const serviceCollection = client.db('musico').collection('services')
        const reviewCollection = client.db('musico').collection('reviews')


        //jwt token post api 
        app.post('/jwt',(req,res)=>{
            const user = req.body
            const token = jwt.sign(user, process.env.ACCES_TOKEN_SECRET )
            res.send({token})

        })


        // load services from database and limit 
        app.get('/services', async (req , res)=>{
            
            const seeLimit =parseInt(req.query.service)
            const query = {}
            const count = await serviceCollection.estimatedDocumentCount()
            const cursor = serviceCollection.find(query) 
            const services = await cursor.limit(seeLimit).toArray()
            res.send({count,services})

        })

        //post a service
        app.post('/services', async (req, res) => {
            const service = req.body
            
            const result = await serviceCollection.insertOne(service)
            res.send(result)
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
            
            const reviewId = await reviewCollection.insertOne(review)
            res.send(reviewId)
        })


        // get review by id 
        app.get('/reviews/:id', async (req, res) => {
            const reviewId = req.params.id
            const query = {service : reviewId}
            const cursor = reviewCollection.find(query).sort({date: -1})
            const review = await cursor.toArray()
            res.send(review)
        })

        // get my review by email 

        app.get('/reviews', verifyJwt, async (req, res) => {

            const decoded = req.decoded
            let query = {}

            if(decoded.email !== req.query.email){
                return  res.status(403).send({message:"unothorized user"})
            }
          
            
            if(req.query.email){
                query = {email: req.query.email}
            }
          
            const cursor = reviewCollection.find(query)
            const myReviews = await cursor.toArray()
            res.send(myReviews)      

        })



        // delete review by id 

        app.delete('/reviews/:id',verifyJwt, async (req,res)=>{
            const id = req.params.id 
            
            const query = {_id : ObjectId(id)}
            const result = await reviewCollection.deleteOne(query)
            res.send(result)

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