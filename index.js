import express from "express"
import cors from 'cors'
import { MongoClient } from "mongodb";


const app = express();
const PORT = 8000;


const uri = process.env.MONGODB_URI;

console.log("MongoDB URI:", uri);
app.use(cors());
app.use(express.json())
const client = new MongoClient(process.env.MONGODB_URI)

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

app.get('/', (req, res)=>{

})


app.listen(PORT, ()=>{
    console.log(`server is running at ${PORT}`);
})