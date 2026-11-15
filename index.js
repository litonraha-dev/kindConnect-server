import express from "express"
import cors from 'cors'
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import { createRemoteJWKSet, jwtVerify } from "jose";

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
const joinEventCollection= db.collection('joinEvent')



// const verifyToken = async(req, res, next)=>{
//   const authHeader = req.headers.authorization;
//   if(!authHeader){
//     return res.status(401).send({msg:"Unauthorized"})
//   }
//   const token = authHeader.split(" ")[1];
//   if(!token){
//     return res.status(401).send({msg: "Unauthorized"})
//   }
//   const JWKS=createRemoteJWKSet(new URL(`${CLIENT_URL}/api/auth/jwks`))
//   try{
//     const {payload}=await jwtVerify(token,JWKS)
//   }
//   catch(error){
//     return res.status(500).send({msg:"Server Error"})
//   }
// }


const CLIENT_URL = process.env.CLIENT_URL;

if (!CLIENT_URL) {
  throw new Error("CLIENT_URL is missing from environment variables");
}

// Create JWKS resolver once, not on every request.
const JWKS = createRemoteJWKSet(
  new URL(`${CLIENT_URL}/api/auth/jwks`)
);

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized: Bearer token required",
      });
    }

    const token = authHeader.split(" ")[1];

    const { payload } = await jwtVerify(token, JWKS);

    // Store verified JWT payload for later routes.
    req.user = payload;

    // IMPORTANT: Continue to the route handler.
    next();

  } catch (error) {
    console.error("JWT verification error:", error);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};


app.post("/create-events", verifyToken, async (req, res) => {
  try {
    const eventsData = req.body;

    const result = await eventsCollection.insertOne(eventsData);

    return res.status(201).json({
      message: "Event created successfully",
      result,
    });
  } catch (error) {
    console.error("Create event error:", error);

    return res.status(500).json({
      message: "Failed to create event",
    });
  }
});



app.get("/events/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await eventsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.json(event);
  } catch (error) {
    console.error("Get event error:", error);
    return res.status(500).json({ message: "Failed to fetch event" });
  }
});

app.patch("/events/:id", verifyToken, async(req, res)=>{
  const id = req.params.id;
  const updatedData= req.body;
  const result = await eventsCollection.updateOne({
    _id: new ObjectId(id)},
    {
      $set:updatedData
    }
  )
  res.send(result)
})

app.delete('/events/:id',verifyToken,async(req, res)=>{
  const id = req.params.id;
  const result = await eventsCollection.deleteOne(
    {
      _id: new ObjectId(id)
    },
    
  )
  res.send(result)
})

app.post("/join-event",verifyToken, async(req, res)=>{
  const joinData = req.body;
  console.log(req.body);
  const result = await joinEventCollection.insertOne(joinData);
  res.send(result)
})

app.get("/join-event", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).send({
        message: "User ID is required",
      });
    }

    const result = await joinEventCollection
      .find({ userId })
      .toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch joined events",
    });
  }
});
app.get('/join-event/:id', verifyToken, async(req, res)=>{
 const id = req.params.id;
const joinEvent=  await joinEventCollection.findOne({_id: new ObjectId(id)});
res.send(joinEvent)
})

app.get("/events", verifyToken, async (req, res) => {
  try {
    const result = await eventsCollection.find().toArray();
    return res.json(result);
  } catch (error) {
    console.error("Fetch events error:", error);
    return res.status(500).json({
      message: "Failed to fetch events",
    });
  }
});


//http://localhost:8000/create-events

// app.get('/', (req, res)=>{
//     res.send({msg:'server is running fine'})
// })

app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
})

export default app;