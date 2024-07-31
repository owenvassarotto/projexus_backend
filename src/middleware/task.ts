import { Request, Response, NextFunction } from "express"
import Task, { ITask } from "../models/Task"

declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

export async function taskExists(req: Request, res: Response, next: NextFunction){
    try {
        const { taskId } = req.params
        const task = await Task.findById(taskId)
        if(!task) return res.status(400).json({ error: new Error('Task not found').message })
        req.task = task
        next()
    } catch (error) {
        res.status(500).json({ error: 'There was an error'})
    }
}

export function taskBelongsToProject(req: Request, res: Response, next: NextFunction){
    if(req.task.project.toString() !== req.project.id.toString()) return res.status(400).json({ error: new Error('Invalid action').message })
    next()
}

export function hasAuthorization(req: Request, res: Response, next: NextFunction){
    if(req.user.id.toString() !== req.project.manager.toString()) return res.status(400).json({ error: new Error('Invalid action').message })
    next()
}