import { Router } from 'express'
import { explainSentenceController, quizController, registerController } from '~/controllers/users.controllers'
import { wrapResquestHandler } from '../utils/handlers'
import { registerValidator } from '../middlewares/users.middlewares'
const usersRouter = Router()

usersRouter.post('/register', registerValidator, wrapResquestHandler(registerController))

// /**
//  * Path: /login
//  * Method: GET
//  * Body: { email: string, password: string }
//  */
// usersRouter.post('/login', loginValidator, wrapResquestHandler(loginController))

// /**
//  * Path: /logout
//  * Method: POST
//  * Body: { refresh_token: string }
//  */
// usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapResquestHandler(logoutController))

// /**
//  * Path: /forgot-password
//  * Method: POST
//  * Body: { email: string }
//  */
// usersRouter.post('/forgot-password', forgotPasswordValidator, wrapResquestHandler(forgotPasswordController))

// /**
//  * Path: /verify-forgot-password
//  * Method: POST
//  * Body: { forgot_password_token }
//  */
// usersRouter.post(
// 	'/verify-forgot-password',
// 	verifyForgotPasswordTokenValidator,
// 	wrapResquestHandler(verifyForgotPasswordTokenController)
// )

// /**
//  * Path: /reset-password
//  * Method: POST
//  * Body: { forgot_password_token: string, password: string, confirm_password: string }
//  */
// usersRouter.post('/reset-password', resetPasswordValidator, wrapResquestHandler(resetPasswordController))

usersRouter.get('/quiz', wrapResquestHandler(quizController))
usersRouter.get('/explainSentence', wrapResquestHandler(explainSentenceController))

export default usersRouter
