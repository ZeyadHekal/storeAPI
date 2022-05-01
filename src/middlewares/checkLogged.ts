import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const checkLogged = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.body.token) {
        try {
            jwt.verify(req.body.token, process.env.JWT_SECRET as string);
            next();
        } catch (_) {
            res.status(403).json({ message: "access denied" });
        }
    } else {
        res.status(401).json({ message: "token needed" });
    }
};

export default checkLogged;
