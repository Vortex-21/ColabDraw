import { prisma } from "@repo/Database/prismaClient";
import { Request, Response, NextFunction } from "express";
import jwt, { decode } from "jsonwebtoken";
const JWT_SECRET = "my_jwt_secret";
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authtoken ?? "";
  console.log("token: ", token);
  if (!token) {
    res.status(403).json({
      message: "Token invalid!",
    });
    return;
  }
  try {
    if (typeof token == "string") {
      const decodedToken = jwt.verify(token, JWT_SECRET);
      if (typeof decodedToken === "string") {
        throw new Error("Invalid Token");
      } else {
        if ("userId" in decodedToken) {
          const username: string = decodedToken.username;
          const user = await prisma.user.findFirst({ where: { username } });
          if (!user) {
            throw new Error("User not Signed up!");
          }
         
          const id = user.id; 
          req.id = id;
          next();
        } else {
          throw new Error("Attribute not found in Token!");
        }
      }
    } else {
      res.status(403).json({
        message: "Invalid token!",
      });
    }
  } catch (err) {
    console.log("Error: ", err);
    res.status(403).json({
      message: "Token invalid!",
    });
  }
};
