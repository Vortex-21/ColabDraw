import express from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { auth } from "./middlewares";
import { CreateRoomSchema, SignUpSchema } from "@repo/common/types";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/Database/prismaClient";
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.post("/signup", async (req, res) => {
  
  
  const parsedData = SignUpSchema.safeParse(req.body);

  if (parsedData.success) {
    
    try {
     
      await prisma.user.create({
        data: {
          username:parsedData.data.username,
          password:parsedData.data.password,
          name:parsedData.data.name,
          photo:parsedData.data.photo,
        },
      });
      res.status(200).json({
        message: "Signed Up successfully!",
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        res.status(409).json({
          message:"Username already exists!"
        }); 
        return; 
      }
      res.status(500).json({
        message:"Internal Server Error"
      });
      console.log("ERROR signing up: ", err);
    }
  } else {
    res.status(400).json({
      message: parsedData.error?.issues,
    });
  }
});

app.post("/signin", async (req, res) => {

  const { username, password } = req.body;

  try {
    
    const user = await prisma.user.findFirst({ where: { username, password } });

    
    if (!user) {
      res.status(401).json({
        message: "Invalid Credentials!",
      });
      return;
    }
    
    const token = jwt.sign({ username: username }, JWT_SECRET);
    res.status(200).json({
      token: token,
      message: "Signed in successfully!",
    });
  } catch (err: any) {
    console.log("Error signing in: " + err); 
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.post("/create-room", auth, async (req, res) => {
  try {
    const adminId = req.id;
    // const { slug } = req.body; 
    const parsedData = CreateRoomSchema.safeParse(req.body); 
    if(!parsedData.success){
      res.status(400).json({
        message: parsedData.error?.issues,
      });
      return;
    }
    if (!adminId) {
      throw new Error("No admin found!");
    }
    
    await prisma.room.create({
      data: {
        adminId,
        slug:parsedData.data.slug, 
      },
    });
    res.status(200).json({
      message: "created room!",
    });
  } catch (err: any) {
    console.log("Error Creating Room: " + err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to Excalidraw");
});

app.listen(3002, () => {
  console.log("Listening at port 3002");
});
