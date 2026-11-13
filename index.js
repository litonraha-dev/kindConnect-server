import express from "express"
import cors from 'cors'
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";


const app = express();
const PORT = 8000;
app.use(cors());
app.use(express.json())


const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
  await client.close();
}


const connectClient = await connectToMongoDB()
const db = connectClient.db('kindConnect')
const eventsCollection = db.collection('events')


app.post('/create-events',async(req, res)=>{
    console.log('api called');
    res.send({msg:"Api working....."})
    const eventsData = req.body;
    const result = await eventsCollection.insertOne(eventsData)

    console.log(eventsData);
    res.send(result)

})


app.get("/events/:id", async(req, res)=>{
  const id = req.params.id;
  // res.send({msg: `details,${id}` });
  const events = await eventsCollection.findOne({_id: new ObjectId(id)});
  res.send(events)
})

app.get('/events', async(req, res)=>{
    const result = await eventsCollection.find().toArray();
    res.send(result)
})

//http://localhost:8000/create-events

app.get('/', (req, res)=>{
    res.send({msg:'server is running fine'})
})

app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
})

export default app;