import {Request, Response, NextFunction} from "express";
import {encryptPassword} from "../libraries/crypto";

export function hashPassword(req: Request, res: Response, next: NextFunction) {

    if(req.body.password) {
        req.body.password = encryptPassword(req.body.password);
    }

    if(req.body.newPassword) {
        req.body.newPassword = encryptPassword(req.body.newPassword);
    }

    if(req.body.oldPassword) {
        req.body.oldPassword = encryptPassword(req.body.oldPassword);
    }

    next();

};
