import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import { ParamsDictionary } from 'express-serve-static-core'
import usersService from '~/services/users.services'
import {
	ExplainSentenceReqBody,
	ForgotPasswordReqBody,
	GiveMeQuizReqBody,
	LoginReqBody,
	LogoutReqBody,
	RefreshTokenReqBody,
	ResetPasswordReqBody,
	TokenPayLoad,
	registerReqBody,
	verifyForgotPasswordTokenReqBody
} from '~/models/request/User.requests'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { OpenAIClient, AzureKeyCredential, ChatRequestMessage } from '@azure/openai'
import { config } from 'dotenv'
config()

const endpoint = process.env.AZURE_OPENAI_ENDPOINT
const azureApiKey = process.env.AZURE_OPENAI_KEY

// export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
// 	const user = req.user as User
// 	const user_id = user._id as ObjectId
// 	const result = await usersService.login(user_id.toString())
// 	return res.status(200).json({
// 		message: USERS_MESSAGES.LOGIN_SUCCESS,
// 		result
// 	})
// }

export const registerController = async (
	req: Request<ParamsDictionary, any, registerReqBody>,
	res: Response,
	next: NextFunction
) => {
	const result = await usersService.register(req.body)
	return res.status(200).json({
		message: USERS_MESSAGES.REGISTER_SUCCESS,
		result
	})
}

// export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
// 	const { refresh_token } = req.body
// 	const result = await usersService.logout(refresh_token)
// 	return res.json(result)
// }

// export const forgotPasswordController = async (
// 	req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
// 	res: Response
// ) => {
// 	const { _id } = req.user as User
// 	const result = await usersService.forgotPassword((_id as ObjectId).toString())
// 	return res.json(result)
// }

// export const verifyForgotPasswordTokenController = async (
// 	req: Request<ParamsDictionary, any, verifyForgotPasswordTokenReqBody>,
// 	res: Response
// ) => {
// 	return res.json({
// 		message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
// 	})
// }

// export const resetPasswordController = async (
// 	req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
// 	res: Response
// ) => {
// 	const { user_id } = req.decoded_forgot_password_token as TokenPayLoad
// 	const { password } = req.body
// 	const result = await usersService.resetPassword(user_id, password)
// 	return res.json(result)
// }

export const quizController = async (req: Request<ParamsDictionary, any, GiveMeQuizReqBody>, res: Response) => {
	const { number_of_quiz, level, type_of_quiz } = req.query
	const messages: ChatRequestMessage[] = [
		{
			role: 'user',
			content: `Give me ${number_of_quiz} multiple choice quiz of japanese ${type_of_quiz} at JLPT ${level} level for japanese learner, don't add translation, furigana for word in the choices, and tell me which choice is right`
		}
	]
	console.log(messages)

	console.log('== Chat Completions Sample ==')

	const client = new OpenAIClient(endpoint as string, new AzureKeyCredential(azureApiKey as string))
	const deploymentId = 'GPT35TURBO16K'
	const result = await client.getChatCompletions(deploymentId, messages)

	const choicesArray = result.choices.map((choice) => ({ text: choice.message }))
	console.log(choicesArray)
	return res.status(200).json({
		message: USERS_MESSAGES.GET_COMPLETIONS_SUCCESS,
		choices: choicesArray
	})
}

export const explainSentenceController = async (
	req: Request<ParamsDictionary, any, ExplainSentenceReqBody>,
	res: Response
) => {
	const { sentence } = req.query
	const messages: ChatRequestMessage[] = [
		{
			role: 'user',
			content: `Given this sentence :"${sentence}", tell me which part is subject, predicate
      , and in them what is noun, verb, adj. More than that, explain the grammar used in that sentence and tell the different of use case between them versus other quite similar grammar`
		}
	]

	const client = new OpenAIClient(endpoint as string, new AzureKeyCredential(azureApiKey as string))
	const deploymentId = 'GPT35TURBO16K'
	const result = await client.getChatCompletions(deploymentId, messages)

	for (const choice of result.choices) {
		console.log(choice.message)
	}

	return res.status(200).json({
		message: USERS_MESSAGES.GET_COMPLETIONS_SUCCESS,
		result
	})
}
