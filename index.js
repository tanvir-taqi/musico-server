const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

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



app.listen(port,()=>{
console.log('server is listening on port');
});