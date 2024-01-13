import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import { ParamsDictionary } from 'express-serve-static-core'
import usersService from '~/services/users.services'
import {
	ExplainSentenceReqBody,
	GiveMeQuizReqBody,
	LoginReqBody,
	LogoutReqBody,
	registerReqBody
} from '~/models/request/User.requests'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { OpenAIClient, AzureKeyCredential, ChatRequestMessage } from '@azure/openai'
import { config } from 'dotenv'
config()

const endpoint = process.env.AZURE_OPENAI_ENDPOINT
const azureApiKey = process.env.AZURE_OPENAI_KEY

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
	const user = req.user as User
	const user_id = user._id as ObjectId
	const { access_token, refresh_token } = await usersService.login(user_id.toString())
	res.cookie('access_token', access_token, { httpOnly: true, secure: true })
	res.cookie('refresh_token', refresh_token, { httpOnly: true, secure: true })
	return res.status(200).json({
		message: USERS_MESSAGES.LOGIN_SUCCESS
	})
}

export const registerController = async (
	req: Request<ParamsDictionary, any, registerReqBody>,
	res: Response,
	next: NextFunction
) => {
	const { access_token, refresh_token } = await usersService.register(req.body)
	res.cookie('access_token', access_token, { httpOnly: true, secure: true })
	res.cookie('refresh_token', refresh_token, { httpOnly: true, secure: true })
	return res.status(200).json({
		message: USERS_MESSAGES.REGISTER_SUCCESS
	})
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
	const { refresh_token } = req.body
	const result = await usersService.logout(refresh_token)
	return res.json(result)
}

export const quizController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
	const { number_of_quiz, level, type_of_quiz } = req.query
	const messages: ChatRequestMessage[] = [
		{
			role: 'user',
			content: `    
          Please create a list of ${number_of_quiz} ${level}-level Japanese ${type_of_quiz} multiple-choice questions in the following JSON format within the same file:
          [
            {
              "question": "Question 1?",
              "choices": {
                "A": "Option 1",
                "B": "Option 2",
                "C": "Option 3",
                "D": "Option 4"
              },
              "answer": X
            },
            {
              "question": "Question 2?",
              "choices": {
                "A": "Option 1",
                "B": "Option 2",
                "C": "Option 3",
                "D": "Option 4"
              },
              "answer": X
            },
            ...
          ]
        `
		}
	]
	console.log(messages)

	console.log('== Chat Completions Sample ==')

	const client = new OpenAIClient(endpoint as string, new AzureKeyCredential(azureApiKey as string))
	const deploymentId = 'GPT35TURBO16K'
	const result = await client.getChatCompletions(deploymentId, messages)
	const str = result.choices![0]!.message!.content

	const obj = JSON.parse(str as string)
	console.log(obj)
	return res.status(200).json({
		message: USERS_MESSAGES.GET_COMPLETIONS_SUCCESS,
		result: obj
	})
}

export const explainSentenceController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
	const { sentence } = req.query
	const messages: ChatRequestMessage[] = [
		{
			role: 'user',
			content: `
        Perform an in-depth analysis of a given Japanese sentence '${sentence}', and present the findings in a well-organized JSON format with the following detailed structure:
    
        {
          "structure": {
            "topic": "",
            "action_or_characteristic": "",
            "clauses": ""
          },
          "grammar": {
            "used": "",
            "meaning": "",
            "examples": "",
            "comparison": ""
          },
          "analysis": {
            "choice_reason": "",
            "context_and_usage": "",
            "comparison_with_other_cases": ""
          }
        }
        Explanation:
          Structure:
  
            Topic: Identify the main subject or theme of the sentence. This helps establish the primary focus.
            Action or Characteristic: Describe the primary action or characteristic conveyed by the sentence.
            Clauses: Analyze the sentence's main and subordinate clauses to understand its syntactic structure.
          Grammar:
  
            Used: Specify the key grammar structure employed in the sentence, such as a specific particle or tense.
            Meaning: Describe the intended meaning of the identified grammar structure in the context of the sentence.
            Examples: Provide illustrative examples showcasing how the grammar is applied in the sentence.
            Comparison: Compare the identified grammar with at least one similar structure, highlighting differences in meaning.
          Analysis:
  
            Choice Reason: Pose questions to explore the rationale behind choosing the specific grammar structure. Consider factors like nuance or emphasis.
            Context and Usage: Investigate the communicative context and usage situations in which the grammar is employed. This helps understand pragmatic choices.
            Comparison with Other Cases: Compare the usage of the identified grammar with other instances to suggest variations in its application, considering diverse contexts.
           
            This enhanced prompt aims to provide more detailed guidance for the analysis of a Japanese sentence. Feel free to use this version for more specific and nuanced results.                `
		}
	]
	console.log(messages)
	console.log('== Chat Completions Sample ==')

	const client = new OpenAIClient(endpoint as string, new AzureKeyCredential(azureApiKey as string))
	const deploymentId = 'GPT35TURBO16K'
	const result = await client.getChatCompletions(deploymentId, messages)

	const str = result.choices![0]!.message!.content
	const obj = JSON.parse(str as string)
	console.log(obj)

	return res.status(200).json({
		message: USERS_MESSAGES.GET_COMPLETIONS_SUCCESS,
		result: obj
	})
}
