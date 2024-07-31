import { Router } from "express"
import { AuthController } from "../controllers/AuthController"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware/validation"
import { authenticate } from "../middleware/auth"

const router = Router()

router.post('/create-account', 
    body('name').notEmpty().withMessage('User name is required'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .notEmpty().withMessage('Password is required'),
    body('password_confirmation').custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Passwords are not equal')
        }
        return true
    }), 
    body('email')
        .isEmail().withMessage('Invalid email address')
        .notEmpty().withMessage('User email is required'),
    handleInputErrors,
    AuthController.createAccount
)

router.post('/confirm-account',
    body('token').notEmpty().withMessage('Token is required'),
    handleInputErrors,
    AuthController.confirmAccount
)

router.post('/login',
    body('email')
        .isEmail().withMessage('Invalid email address'),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleInputErrors,
    AuthController.login
)

router.post('/request-code',
    body('email')
        .isEmail().withMessage('Invalid email address'),
    handleInputErrors,
    AuthController.requestConfirmationCode
)

router.post('/forgot-password',
    body('email')
        .isEmail().withMessage('Invalid email address'),
    handleInputErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
    body('token').notEmpty().withMessage('Token is required'),
    handleInputErrors,
    AuthController.validateToken
)

router.post('/update-password/:token',
    param('token').notEmpty().withMessage('Token is required'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .notEmpty().withMessage('Password is required'),
    body('password_confirmation').custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Passwords are not equal')
        }
        return true
    }),
    handleInputErrors,
    AuthController.updatePasswordWithToken
)

router.get('/user',
    authenticate,
    AuthController.user
)

export default router