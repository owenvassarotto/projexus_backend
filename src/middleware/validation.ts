import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const handleInputErrors = (req: Request, res: Response, next: NextFunction) => {

    let errors = validationResult(req)

    if(!errors.isEmpty()){
        // if there are errors we return a response with them
        return res.status(400).json({ errors: errors.array() });
    }
    next()
}