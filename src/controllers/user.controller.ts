/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Response } from 'express'

import {
	deleteDocument,
	getAllDocuments,
	getOneDocument,
} from '~controllers/factory.handler'
import { UserModel } from '~models/user.model'
import { HttpStatus } from '~typings/http-status.enum'
import { IUser } from '~typings/user.interface'
import { WithUserReq } from '~typings/withUserReq'
import { catchAsync } from '~utils/catchAsync'
import { CustomError } from '~utils/customError'
import { sendResponse } from '~utils/sendResponse'

type UpdateUserDto = Partial<Pick<IUser, 'name' | 'email' | 'photo'>>

export const updateUserProfile = catchAsync(async (req: WithUserReq, res, _next) => {
	const { name, email, photo } = req.body as UpdateUserDto
	const authenticatedUser = req.user as IUser
	try {
		const dbUser = await UserModel.findById(authenticatedUser._id)
		if (!dbUser) {
			throw new CustomError(
				`User doesn't exist or has been deleted`,
				HttpStatus.NOT_FOUND
			)
		}
		name && (dbUser.name = name)
		email && (dbUser.email = email)
		photo && (dbUser.photo = photo)
		await dbUser.save({ validateModifiedOnly: true })
		sendResponse({
			res,
			status: 'Success',
			message: 'Successfully updated user profile',
		})
	} catch (error: any) {
		throw new CustomError(error, HttpStatus.UNAUTHORIZED)
	}
})

//middleware to put user id in req.params
export const getMe = (req: WithUserReq, res: Response, next: NextFunction): void => {
	req.user && (req.params.id = req.user.id)
	next()
}
export const getOneUser = getOneDocument(UserModel)
export const getAllUsers = getAllDocuments(UserModel)
export const deleteUser = deleteDocument(UserModel)
