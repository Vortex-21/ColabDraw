import express from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { auth } from "./middlewares";
import { SignUpSchema } from "@repo/common/types";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/Database/prismaClient";
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.post("/signup", async (req, res) => {
  // res.send("signup route!")
  const { username, password, name = "John Doe", photo = "dp.jpg" } = req.body;
  const result = SignUpSchema.safeParse({ username, password, name });

  if (result.success) {
    // store in DB
    try {
      const existingUser = await prisma.user.findFirst({where:{username}}); 
      if(existingUser){
        res.status(409).json({
          message:"Username already exists!"
        })
        return;
      }
      await prisma.user.create({
        data: {
          username,
          password,
          name,
          photo,
        },
      });
      res.status(200).json({
        message: "Signed Up successfully!",
      });
    } catch (err: any) {
      console.log("ERROR signing up: ", err);
    }
  } else {
    res.status(400).json({
      message: result.error?.issues,
    });
  }
});

app.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  try {
    //check the DB for the creds
    const user = await prisma.user.findFirst({ where: { username, password } });

    //if not present in the DB dont log in
    if (!user) {
      res.status(401).json({
        message: "Invalid Credentials!",
      });
      return;
    }
    //if present sign jwt send back to the user :
    const token = jwt.sign({ username: username }, JWT_SECRET);
    res.status(200).json({
      token: token,
      message: "Signed in successfully!",
    });
  } catch (err: any) {
    console.log("Error signing in: " + err);
  }
});

app.post("/create-room", auth, async (req, res) => {
  try {
    const adminId = req.id;
    const { slug } = req.body;
    if (!adminId) {
      throw new Error("No admin found!");
    }
    //create room
    await prisma.room.create({
      data: {
        adminId,
        slug,
      },
    });
    res.status(200).json({
      message: "created room!",
    });
  } catch (err: any) {
    console.log("Error Creating Room: " + err);
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to Excalidraw");
});

app.listen(3002, () => {
  console.log("Listening at port 3002");
});
