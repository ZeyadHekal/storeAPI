import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const checkOwner = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.body.token) {
        try {
            const decode = jwt.verify(req.body.token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
            const user_id = req.params.id;
            if (decode && decode.id === parseInt(user_id)) {
                next();
            } else {
                res.status(403).json({ message: "access denied" });
            }
        } catch (_) {
            res.status(403).json({ message: "access denied" });
        }
    } else {
        res.status(401).json({ message: "token needed" });
    }
};

export default checkOwner;
