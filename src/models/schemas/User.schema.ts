import { ObjectId } from 'mongodb'

export default class User {
	_id?: ObjectId
	name: string
	email: string
	password: string
	username: string
	created_at?: Date
	updated_at?: Date
	forgot_password_token?: string // jwt hoặc '' nếu đã xác thực email

	constructor(user: UserType) {
		const date = new Date()
		this._id = user._id || new ObjectId()
		this.name = user.name || ''
		this.email = user.email
		this.username = user.username
		this.password = user.password
		this.created_at = user.created_at || date
		this.updated_at = user.updated_at || date
		this.forgot_password_token = user.forgot_password_token || ''
	}
}

interface UserType {
	_id?: ObjectId
	name: string
	email: string
	username: string
	password: string
	created_at?: Date
	updated_at?: Date
	forgot_password_token?: string // jwt hoặc '' nếu đã xác thực email
}
