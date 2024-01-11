import { registerReqBody } from '~/models/request/User.requests'
import databaseService from './database.service'
import User from '~/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { USERS_MESSAGES } from '~/constants/messages'
import { verify } from 'crypto'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenType } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
config()
class UsersService {
	private signAccessToken(user_id: string) {
		return signToken({
			payload: {
				user_id,
				token_type: TokenType.AccessToken
			},
			privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
			options: {
				expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
			}
		})
	}

	private signRefreshToken(user_id: string) {
		return signToken({
			payload: {
				user_id,
				token_type: TokenType.RefreshToken,
				verify: verify
			},
			privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
			options: {
				expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
			}
		})
	}

	private signForgotPasswordToken(user_id: string) {
		return signToken({
			payload: {
				user_id,
				token_type: TokenType.ForgetPasswordToken,
				verify: verify
			},
			privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
			options: {
				expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
			}
		})
	}

	private signAccessAndRefreshToken(user_id: string) {
		return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
	}

	async register(payload: registerReqBody) {
		const user_id = new ObjectId()
		console.log(user_id)
		await databaseService.users.insertOne(
			new User({
				...payload,
				_id: user_id,
				password: hashPassword(payload.password)
			})
		)
		const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString())
		await databaseService.refreshTokens.insertOne(
			new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
		)
		return {
			access_token,
			refresh_token
		}
	}

	async checkEmailExist(email: string) {
		const user = await databaseService.users.findOne({ email })
		return Boolean(user)
	}

	async login(user_id: string) {
		const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString())
		await databaseService.refreshTokens.insertOne(
			new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
		)
		return {
			access_token,
			refresh_token
		}
	}

	async logout(refresh_token: string) {
		await databaseService.refreshTokens.deleteOne({ token: refresh_token })
		return {
			message: USERS_MESSAGES.LOGOUT_SUCCESS
		}
	}

	async forgotPassword(user_id: string) {
		const forgot_password_token = await this.signForgotPasswordToken(user_id.toString())
		await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
			{
				$set: {
					forgot_password_token: forgot_password_token,
					updated_at: '$$NOW'
				}
			}
		])
		return {
			message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
		}
	}

	async resetPassword(user_id: string, password: string) {
		await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
			{
				$set: {
					forgot_password_token: '',
					password: hashPassword(password),
					updated_at: '$$NOW'
				}
			}
		])
		return {
			message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
		}
	}
}

const usersService = new UsersService()
export default usersService
