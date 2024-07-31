import { transporter } from "../config/nodemailer";
import { IToken } from "../models/Token";
import { IUser } from "../models/User";

interface IEmail {
    email: IUser['email']
    name: IUser['name']
    token: IToken['token']
}

export class AuthEmail {
    static sendConfirmationEmail = async ( user : IEmail ) => {
        const { email, name, token } = user
        await transporter.sendMail({
            from: '"Projexus - Manage Projects and Tasks with Ease" <no-reply@projexus.com>',
            to: email,
            subject: 'Confirm Your Projexus Account',
            text: `Hello ${name},\n\nYour account is ready to use. Please confirm it by visiting the following link and entering the token provided below:\n\nLink: ${process.env.FRONTEND_URL}/confirm/${token}\nToken: ${token}\n\nPlease note that this token will expire in 10 minutes.\n\nIf you did not create this account, you can ignore this message.\n\nThank you for joining Projexus!`,
            html: `
                <div style="font-family: 'Montserrat', sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto;">
                    <h2 style="color: #FACC15;">Welcome to Projexus!</h2>
                    <p>Hello ${name},</p>
                    <p>Your account is ready to use. Please confirm it by visiting the following link and entering the token provided below:</p>
                    <p style="font-size: 20px; font-weight: bold; color: #FACC15;">Token: <span style="color: #000;">${token}</span></p>
                    <p style="font-size: 20px; margin-top: 10px; font-weight: bold;">Link: <a href="${process.env.FRONTEND_URL}/auth/confirm-account" style="color: #FACC15;">Confirm account</a></p>
                    <p style="color: red;">Please note that this token will expire in 10 minutes.</p>
                    <p>If you did not create this account, you can ignore this message.</p>
                    <p>Thank you for joining <span style="font-weight: 600;">Projexus</span>!</p>
                </div>
            `
        })
    }

    static sendPasswordResetToken = async ( user : IEmail ) => {
        const { email, name, token } = user
        await transporter.sendMail({
            from: '"Projexus - Manage Projects and Tasks with Ease" <no-reply@projexus.com>',
            to: email,
            subject: 'Reset Your Projexus Password',
            text: `Hello ${name},\n\nYou have requested to reset your password. Please click the link below and follow the instructions to reset your password. The token provided below will be needed:\n\nLink: ${process.env.FRONTEND_URL}/reset-password/${token}\nToken: ${token}\n\nPlease note that this token will expire in 10 minutes.\n\nIf you did not request a password reset, you can ignore this message.\n\nThank you for using Projexus!`,
            html: `
                <div style="font-family: 'Montserrat', sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto;">
                    <h2 style="color: #FACC15;">Reset Your Projexus Password</h2>
                    <p>Hello ${name},</p>
                    <p>You have requested to reset your password. Please click the link below and follow the instructions to reset your password. The token provided below will be needed:</p>
                    <p style="font-size: 20px; font-weight: bold; color: #FACC15;">Token: <span style="color: #000;">${token}</span></p>
                    <p style="font-size: 20px; margin-top: 10px; font-weight: bold;">Link: <a href="${process.env.FRONTEND_URL}/auth/new-password" style="color: #FACC15;">Reset Password</a></p>
                    <p style="color: red;">Please note that this token will expire in 10 minutes.</p>
                    <p>If you did not request a password reset, you can ignore this message.</p>
                    <p>Thank you for using <span style="font-weight: 600;">Projexus</span>!</p>
                </div>
            `
        });
        
    }
}