import { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController {

    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)
        // set project manager
        project.manager = req.user.id
        try {
            await project.save()
            res.send('Project created successfully')
        } catch (error) {
            console.log(error)
        }
    }

    static getAllProjects = async (req: Request, res: Response) => {
        const { id } = req.user
        try {
            const projects = await Project.find({ 
                $or: [
                    { manager: { $in: id } },
                    { team: { $in: id }}
                ]
            })
            res.json(projects)
        } catch (error) {
            console.log(error);
        }
    }

    static getProjectById = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            const project = await Project.findById(id).populate('tasks')
            if(!project) return res.status(404).json({ error: new Error('Project not found').message })

            if(project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) return res.status(400).json({ error: new Error('Unauthorized action').message })

            res.json(project)
        } catch (error) {
            console.log(error)
        }
    }

    static updateProject = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            const project = await Project.findById(id)
            if(!project) return res.status(404).json({ error: new Error('Project not found').message })

            if(project.manager.toString() !== req.user.id.toString()) return res.status(400).json({ error: new Error('Unauthorized action').message })

            project.clientName = req.body.clientName
            project.projectName = req.body.projectName
            project.description = req.body.description
            await project.save()
            res.send('Project updated successfully')
        } catch (error) {
            console.log(error)
        }
    }

    static deleteProject = async (req: Request, res: Response) => {

        const {id} = req.params
        try {
            const project = await Project.findById(id)
            if(!project) return res.status(404).json({ error: new Error('Project not found').message })

            if(project.manager.toString() !== req.user.id.toString()) return res.status(400).json({ error: new Error('Unauthorized action').message })
            
            await project.deleteOne()
            res.send('Project deleted successfully')
        } catch (error) {
            console.log(error)
        }
    }
}