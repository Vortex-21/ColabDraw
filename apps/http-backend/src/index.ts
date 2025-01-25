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

// const creds = z.object({
//   username: z.string().min(3, {
//     message: "Username should contain atleast 3 characters.",
//   }),
//   password: z
//     .string()
//     .min(8)
//     .regex(
//       /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
//       {
//         message:
//           "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
//       }
//     ),
// });

app.post("/signup", async (req, res) => {
  // res.send("signup route!")
  const { username, password, name = "John Doe", photo = "dp.jpg" } = req.body;
  const result = SignUpSchema.safeParse({ username, password, name });

  if (result.success) {
    // store in DB
    try{await prisma.user.create({
      data: {
        username,
        password,
        name,
        photo
      },
    });
    res.status(200).json({
      message: "Signed Up successfully!",
    });}
    catch(err:any){
      console.log("ERROR signing up: ", err);
    }
  } else {
    res.status(400).json({
      message: result.error?.issues,
    });
  }
});

// const JWT_SECRET = "my_jwt_secret"

app.post("/signin", (req, res) => {
  const { username, password } = req.body;

  //check the DB for the creds

  //if not present in the DB dont log in

  //if present sign jwt send back to the user :
  const token = jwt.sign({ username: username }, JWT_SECRET);
  res.status(200).json({
    token: token,
    message: "Signed in successfully!",
  });
});

app.post("/create-room", auth, (req, res) => {
  console.log("id : ", req.id);
  res.status(200).json({
    message: "created room!",
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to Excalidraw");
});
app.listen(3002, () => {
  console.log("Listening at port 3002");
});
