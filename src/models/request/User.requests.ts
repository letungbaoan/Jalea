import exp from 'constants'
import { ExpressValidator } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { TokenType } from '~/constants/enums'

export interface registerReqBody {
	name: string
	email: string
	password: string
	confirmPassword: string
	username: string
}

export interface LoginReqBody {
	email: string
	password: string
}
export interface LogoutReqBody {
	refresh_token: string
}

export interface RefreshTokenReqBody {
	refresh_token: string
}

export interface ForgotPasswordReqBody {
	email: string
}

export interface verifyForgotPasswordTokenReqBody {
	forgot_password_token: string
}
export interface TokenPayLoad extends JwtPayload {
	user_id: string
	token_type: TokenType
}

export interface ResetPasswordReqBody {
	forgot_password_token: string
	password: string
	confirm_password: string
}

export interface ExplainSentenceReqBody {}

export interface GiveMeQuizReqBody {}
