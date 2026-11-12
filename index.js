import express from "express"
import cors from 'cors'
import { MongoClient } from "mongodb";
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



app.get('/', (req, res)=>{
    res.send({msg:'server is running fine'})
})

app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
})