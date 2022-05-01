import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const checkOwner = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const auth = req.headers.authorization;
    if (auth) {
        try {
            let decode: jwt.JwtPayload;
            const jwtCode = auth.split(" ")[1];
            decode = jwt.verify(jwtCode, process.env.JWT_SECRET as string) as jwt.JwtPayload;
            const user_id = req.params.id;
            if (decode && decode.id === parseInt(user_id)) {
                next();
            } else {
                throw new Error();
            }
        } catch (_) {
            res.status(403).json({ message: "access denied" });
        }
    } else {
        res.status(401).json({ message: "token needed" });
    }
};

export default checkOwner;
