import { Request, Response } from "express"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/generateToken"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body
            //check if user email already exists in the database 
            const userExists = await User.findOne({ email })
            if(userExists) {
                return res.status(409).json({ error: new Error('User already exists').message })
            }

            const user = new User(req.body)
            // Hash password
            user.password = await hashPassword(password)

            // Generate token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Send email to confirm account
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send('Account created successfully, check your email to confirm')
        } catch (error) {
            res.status(500).json({ error: 'There was an error creating the account' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({ token })
            if(!tokenExists){
                return res.status(404).json({ error: new Error('Invalid token').message })
            }
            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([
                user.save(),
                tokenExists.deleteOne()
            ])

            res.send('Account confirmed successfully')
        } catch (error) {
            res.status(500).json({ error: 'There was an error creating the account' })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })
            if(!user) {
                return res.status(404).json({ error: new Error('User not found').message })
            }
            if(!user.confirmed){
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                // Send email to confirm account
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                return res.status(401).json({ error: new Error('Account not confirmed. Please check your email to confirm your account.').message })
            }

            //Check password 
            const isCorrectPassword = await checkPassword(password, user.password)
            if(!isCorrectPassword){
                return res.status(401).json({ error: new Error('Incorrect password').message })
            }
            
            const token = generateJWT({ id: user.id })

            res.send(token)
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            //check if user exists
            const user = await User.findOne({ email })
            
            if(!user) return res.status(409).json({ error: new Error('User not registered').message })

            if(user.confirmed) return res.status(409).json({ error: new Error('User already confirmed').message })

            // Generate token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Send email to confirm account
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send('New token sent, check your e-mail to confirm')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            //check if user exists
            const user = await User.findOne({ email })
            
            if(!user) return res.status(409).json({ error: new Error('User not registered').message })

            // Generate token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()
            
            // Send email to confirm account
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            res.send('We have sent instructions to reset your password to your e-mail')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({ token })
            if(!tokenExists){
                return res.status(404).json({ error: new Error('Invalid token').message })
            }
            res.send('Token validated, please set your new password')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const tokenExists = await Token.findOne({ token })
            if(!tokenExists){
                return res.status(404).json({ error: new Error('Invalid token').message })
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(req.body.password)
            
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.send('Password updated successfully')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static user = async (req: Request, res: Response) => res.json(req.user)
}