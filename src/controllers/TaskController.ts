import Task from "../models/Task"
import { Request, Response } from "express"

export class TaskController {
    static createTask = async (req: Request, res: Response) => {
        const project = req.project
        try {
            const task = new Task(req.body)
            task.project = project.id
            project.tasks.push(task.id)
            await Promise.allSettled([task.save(), project.save()])
            res.send('Task created successfully')
        } catch (error) {
            res.status(500).json({ error: 'There was an error'})
        }
    }

    static getProjectTasks = async (req: Request, res: Response) => {
        try {
            const tasks = await Task.find({ project: req.project.id }).populate('project')
            res.json(tasks)
        } catch (error) {
            res.status(500).json({ error: 'There was an error'})
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.task.id).populate({ path: 'completedBy.user', select: 'id name email' })
            res.json(task)
        } catch (error) {
            res.status(500).json({ error: 'There was an error'})
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try {
            req.task.name = req.body.name
            req.task.description = req.body.description
            await req.task.save()
            res.send('Task updated successfully')
        } catch (error) {
            res.status(500).json({ error: 'There was an error'})
        }
    }

    static deleteTask = async (req: Request, res: Response) => {
        try {
            req.project.tasks = [...req.project.tasks.filter(task => task.toString() !== req.task.id.toString())]
            
            await Promise.allSettled([req.task.deleteOne(), req.project.save()])

            res.send('Task deleted successfully')
        } catch (error) {
            res.status(500).json({ error: 'There was an error'})
        }
    }

    static updateStatus = async (req: Request, res: Response) => {
        try {
            const { status } = req.body
            req.task.status = status
            const data = {
                user: req.user.id,
                status: status
            }
            req.task.completedBy.push(data)
            await req.task.save()
            res.send('Task status updated successfully')
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'There was an error'})
        }
    }
}