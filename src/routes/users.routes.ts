import { Router } from 'express'
import {
	explainSentenceController,
	loginController,
	logoutController,
	quizController,
	registerController
} from '~/controllers/users.controllers'
import { wrapResquestHandler } from '../utils/handlers'
import {
	accessTokenValidator,
	loginValidator,
	quizReqValidator,
	refreshTokenValidator,
	registerValidator
} from '../middlewares/users.middlewares'
const usersRouter = Router()

/**
 * Path: /register
 * Method: POST
 * Body: { email: string, password: string, confirmPassword: string, username: string, name: string }
 */
usersRouter.post('/register', registerValidator, wrapResquestHandler(registerController))

/**
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string }
 */
usersRouter.post('/login', loginValidator, wrapResquestHandler(loginController))

/**
 * Path: /logout
 * Method: POST
 * Cookie: { access_token: string, refresh_token: string }
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapResquestHandler(logoutController))

/**
 * Path: /quiz
 * Method: GET
 * Cookie: { access_token: string }
 * Body: { type_of_quiz: string, level: string, number_of_quiz: string }
 */
usersRouter.get('/quiz', accessTokenValidator, quizReqValidator, wrapResquestHandler(quizController))

/**
 * Path: /explainSentence
 * Method: GET
 * Cookie: { access_token: string }
 * Body: { sentence: string }
 */
usersRouter.get('/explainSentence', accessTokenValidator, wrapResquestHandler(explainSentenceController))

export default usersRouter
