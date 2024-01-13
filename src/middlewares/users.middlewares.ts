import { ErrorWithStatus } from 'src/models/Errors'
import { Request } from 'express'
import { checkSchema } from 'express-validator'
import usersService from '~/services/users.services'
import { validate } from '~/utils/validation'
import { USERS_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.service'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import HTTP_STATUS from '~/constants/httpStatus'
import { JsonWebTokenError } from 'jsonwebtoken'
import { REGEX_USERNAME } from '~/constants/regex'

export const loginValidator = validate(
	checkSchema(
		{
			email: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.EMAIL_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 8,
						max: 50
					},
					errorMessage: USERS_MESSAGES.EMAIL_LENGTH_MUST_BE_FROM_8_TO_50
				},
				trim: true,
				isEmail: {
					errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
				},
				custom: {
					options: async (value, { req }) => {
						const user = await databaseService.users.findOne({
							email: value,
							password: hashPassword(req.body.password)
						})
						if (user === null) {
							throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORECT)
						}
						req.user = user
						return true
					}
				}
			},
			password: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 8,
						max: 50
					},
					errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
				},
				trim: true
			}
		},
		['body']
	)
)

export const registerValidator = validate(
	checkSchema(
		{
			name: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 5,
						max: 50
					},
					errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_5_TO_50
				},
				trim: true
			},
			email: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.EMAIL_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 8,
						max: 50
					},
					errorMessage: USERS_MESSAGES.EMAIL_LENGTH_MUST_BE_FROM_8_TO_50
				},
				trim: true,
				isEmail: {
					errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
				},
				custom: {
					options: async (value) => {
						const result = await usersService.checkEmailExist(value)
						if (result) {
							throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
						}
						return true
					}
				}
			},
			password: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 8,
						max: 50
					},
					errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
				},
				trim: true,
				isStrongPassword: {
					options: {
						minLength: 8,
						minLowercase: 1,
						minSymbols: 1,
						minUppercase: 1
					},
					errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
				}
			},
			confirmPassword: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 8,
						max: 50
					},
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
				},
				trim: true,
				isStrongPassword: {
					options: {
						minLength: 8,
						minLowercase: 1,
						minSymbols: 1,
						minUppercase: 1
					},
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
				},
				custom: {
					options: (value, { req }) => {
						if (value !== req.body.password) {
							throw new Error('Confirm password phai giong voi pass word')
						}
						return true
					},
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_NOT_DIFFERENT_FROM_PASSWORD
				}
			},
			username: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.USERNAME_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_STRING
				},
				isLength: {
					options: {
						min: 4,
						max: 15
					},
					errorMessage: USERS_MESSAGES.USERNAME_LENGTH_MUST_BE_FROM_4_TO_15
				},
				trim: true,
				custom: {
					options: async (value: string, { req }) => {
						if (!REGEX_USERNAME.test(value)) {
							throw Error(USERS_MESSAGES.USERNAME_INVALID)
						}
						const user = await databaseService.users.findOne({ username: value })
						if (user) {
							throw Error(USERS_MESSAGES.USERNAME_ALREADY_USED)
						}
					}
				}
			}
		},
		['body']
	)
)

export const accessTokenValidator = validate(
	checkSchema(
		{
			Authorization: {
				trim: true,
				custom: {
					options: async (value: string, { req }) => {
						const access_token = req.cookies?.['access_token']
						if (!access_token) {
							throw new ErrorWithStatus({
								message: USERS_MESSAGES.PLEASE_LOGIN_TO_USE_THIS,
								status: HTTP_STATUS.UNAUTHORIZED
							})
						}
						try {
							const decoded_authorization = await verifyToken({
								token: access_token,
								secretOnPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
							})
							;(req as Request).decoded_authorization = decoded_authorization
						} catch (error) {
							throw new ErrorWithStatus({
								message: USERS_MESSAGES.PLEASE_LOGIN_TO_USE_THIS,
								status: HTTP_STATUS.UNAUTHORIZED
							})
						}
						return true
					}
				}
			}
		},
		['headers']
	)
)

export const refreshTokenValidator = validate(
	checkSchema(
		{
			refresh_token: {
				trim: true,
				custom: {
					options: async (value: string, { req }) => {
						const refresh_token = req.cookies?.['refresh_token']
						if (!refresh_token) {
							throw new ErrorWithStatus({
								message: USERS_MESSAGES.PLEASE_LOGIN_TO_USE_THIS,
								status: HTTP_STATUS.UNAUTHORIZED
							})
						}
						try {
							const [decoded_refresh_token, returned_refresh_token] = await Promise.all([
								verifyToken({
									token: refresh_token,
									secretOnPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
								}),
								databaseService.refreshTokens.findOne({ token: refresh_token })
							])
							if (returned_refresh_token === null) {
								throw new ErrorWithStatus({
									message: USERS_MESSAGES.PLEASE_LOGIN_TO_USE_THIS,
									status: HTTP_STATUS.UNAUTHORIZED
								})
							}
							;(req as Request).decoded_refresh_token = decoded_refresh_token
						} catch (error) {
							if (error instanceof JsonWebTokenError) {
								throw new ErrorWithStatus({
									message: USERS_MESSAGES.PLEASE_LOGIN_TO_USE_THIS,
									status: HTTP_STATUS.UNAUTHORIZED
								})
							}
							throw error
						}
						return true
					}
				}
			}
		},
		['body']
	)
)

export const quizReqValidator = validate(
	checkSchema(
		{
			type_of_quiz: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.TYPE_OF_QUIZ_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.TYPE_OF_QUIZ_MUST_BE_A_STRING
				},
				trim: true,
				isIn: {
					options: [['Noun', 'Adj', 'Verb', 'Grammar', 'Reading']],
					errorMessage: 'Level must be one of: Noun, Adj, Verb, Grammar, Reading'
				}
			},
			number_of_quiz: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.NUMBER_OF_QUIZ_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.NUMBER_OF_QUIZ_MUST_BE_A_STRING
				},
				trim: true,
				custom: {
					options: async (value, { req }) => {
						const isNonNegative = parseInt(value, 10) >= 1

						if (!isNonNegative) {
							throw new Error('Number of quiz must be larger than 0')
						}

						return true
					}
				}
			},
			level: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.LEVEL_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.LEVEL_MUST_BE_A_STRING
				},
				trim: true,
				isIn: {
					options: [['N1', 'N2', 'N3', 'N4', 'N5']],
					errorMessage: 'Level must be one of: N1, N2, N3, N4, N5'
				}
			}
		},
		['query']
	)
)
