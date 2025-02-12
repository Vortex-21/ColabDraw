import express from "express";
import jwt from "jsonwebtoken";
import { auth } from "./middlewares";
import { CreateRoomSchema, SignUpSchema } from "@repo/common/types";
import { JWT_SECRET } from "@repo/backend-common/config";
import prisma from "@repo/Database/prismaClient";
import cors from "cors";
import cookieParser from "cookie-parser";
import { v2 } from "cloudinary";
import { config } from "dotenv";
import { v5 as uuidv5 } from "uuid";
config();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.post("/api/v1/signup", async (req, res) => {
  const parsedData = SignUpSchema.safeParse(req.body);

  if (parsedData.success) {
    try {
      await prisma.user.create({
        data: {
          username: parsedData.data.username,
          password: parsedData.data.password,
          email: parsedData.data.email,
        },
      });
      res.status(200).json({
        message: "Signed Up successfully!",
      });
    } catch (err: any) {
      if (err.code === "P2002") {
        res.status(409).json({
          message: "Username already exists!",
        });
        return;
      }
      res.status(500).json({
        message: "Internal Server Error",
      });
      console.log("ERROR signing up: ", err);
    }
  } else {
    res.status(400).json({
      message: parsedData.error?.issues,
    });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findFirst({ where: { username, password } });

    if (!user) {
      res.status(401).json({
        message: "Invalid Credentials!",
      });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.cookie("token", token, { maxAge: 30 * 24 * 60 * 60 * 1000 });
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

app.post("/api/v1/create-room", auth, async (req, res) => {
  console.log("Create room Marker");
  try {
    const adminId = req.id;
    // const { slug } = req.body;
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({
        message: parsedData.error?.issues,
      });
      return;
    }
    if (!adminId) {
      throw new Error("No admin found!");
    }
    const hashed_slug = uuidv5(parsedData.data.slug, adminId);
    console.log("Hashed data: " + hashed_slug);
    const newRoom = await prisma.room.create({
      data: {
        adminId,
        slug: hashed_slug,
      },
    });

    res.status(200).json({
      message: "created room!",
      roomId: newRoom.id,
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(409).json({
        message: "A Room already exists with the same name.",
      });
      return;
    }
    console.log("Error Creating Room: " + err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.post("/api/v1/get-room-id", auth, async (req, res) => {
  const { unique_room_id } = req.body;
  const room = await prisma.room.findFirst({ where: { slug: unique_room_id } });
  res.status(200).json({
    message: room.id,
  });
});

app.get("/api/v1/geometryHistory/:roomId", auth, async (req, res) => {
  const roomId = Number(req.params.roomId);

  try {
    const geometryHistory = await prisma.geometry.findMany({
      where: {
        roomId,
      },
    });
    console.log('prisma response : ', geometryHistory); 
    // let geometryHistory = {shape:response.shape, startX: response.startX, startY: response.startY, width: response.width, height: response.height}; 
    console.log(geometryHistory);
    res.status(200).json({
      geometryHistory,
    });
  } catch (err: any) {
    console.log("Error fetching geometry history: " + err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.post("/api/v1/share-room", auth, async (req, res) => {
  const { roomId } = req.body;
  const room = await prisma.room.findFirst({ where: { id: roomId } });
  res.status(200).json({
    shareId: room.slug,
  });
});

app.get("/api/v1/chathistory/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);
  const cursorId = req.body.cursorId;

  const queryOptions: any = {
    take: -50,
    where: { roomId: roomId },
    orderBy: {
      createdAt: "desc",
    },
  };

  if (cursorId) {
    queryOptions.cursor = { id: cursorId };
  }

  try {
    const chatHistory = await prisma.chat.findMany(queryOptions);
    res.status(200).json({
      chats: chatHistory,
    });
  } catch (err: any) {
    console.log("Error fetching chat history: " + err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.get("/api/v1/sign-cloudinary", async (req, res) => {
  // const { params } = req.body;
  try {
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw Error("Incomplete Environment Variables!");
    }
    // const signature = await v2.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = v2.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: "colabdraw",
      },
      process.env.CLOUDINARY_API_SECRET
    );

    // return { timestamp, signature };
    res.status(200).json({
      timestamp,
      signature,
    });
  } catch (err: any) {
    console.log("Error cloudinary signing: " + err);
    res.status(500).json({
      message: "Internal Server Error.",
    });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to Excalidraw");
});

app.listen(3002, () => {
  console.log("Listening at port 3002");
});
