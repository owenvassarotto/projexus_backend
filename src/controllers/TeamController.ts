import { Request, Response } from "express"
import User from "../models/User"
import Project from "../models/Project"

export class TeamMemberController {
    static findMemberByEmail = async (req: Request, res: Response) => {
        const { email } = req.body
        // find user by email
        const user = await User.findOne({ email }).select('_id email name')
        
        // if user is not found
        if(!user) return res.status(404).json({ error: new Error('User not found').message })      

        // check if user is the manager of the project
        if (req.project.manager.toString() === user._id.toString()) return res.status(400).json({ error: new Error('The email corresponds to the project manager.').message })   

        // if user is found
        res.json(user)
    }

    static getProjectTeam = async (req: Request, res: Response) => {
        const { projectId } = req.params
        const project = await Project.findById(projectId).populate({
            path: 'team',
            select: 'id email name'
        })
        res.json(project.team)
    }

    static addMemberById = async (req: Request, res: Response) => {
        const { id } = req.body
        try {
            // find user by email
            const user = await User.findById(id).select('_id')
            
            // if user is not found
            if(!user) return res.status(404).json({ error: new Error('User not found').message })      

            // check if user is already a member of the project
            if (req.project.team.includes(user.id)) {
                const error = new Error('User is already a member of the project')
                return res.status(400).json({ error: error.message })
            }

            // if user is found -> add as a new member of the project
            req.project.team.push(user.id)
            await req.project.save()

            res.send("Member added successfully")
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'An error occurred while adding the member' })
        }
    }

    static removeMemberById = async (req: Request, res: Response) => {
        const { userId } = req.params
        // check if user is a member of the project
        if (!req.project.team.some(team => team.toString() === userId)) {
            const error = new Error('User does not exist in the project')
            return res.status(409).json({ error: error.message })
        }
        req.project.team = req.project.team.filter(member => member.toString() !== userId)
        await req.project.save()
        res.send("Member removed successfully")
    }
}