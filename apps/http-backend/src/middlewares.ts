import { Request, Response, NextFunction } from "express";
import jwt, { decode } from "jsonwebtoken";
const JWT_SECRET = "my_jwt_secret";
export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authtoken ?? "";
  console.log("token: ", token);
  if (!token) {
    res.status(403).json({
      message: "Token invalid!",
    });
    return;
  }
  try {
    if(typeof(token) == "string"){
        const decodedToken = jwt.verify(token, JWT_SECRET);
        console.log("token contents: ", decodedToken);

    }
    else{
        res.status(403).json({
            message:"Invalid token!"
        })
    }
    //find the client with the username we got from the token in the DB .

    //if client present:
    const id = "123123"; // store the id of the user in the request field for convenience.
    req.id = id;
    next();
  } catch (err) {
    console.log("Error: ", err);
    res.status(403).json({
      message: "Token invalid!",
    });
  }
};
