import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import statusCode from "../statusCode.js";
import {
	asyncFormParser,
	getDetailsFromJWT,
	generateAccessToken,
	sendAuthDetails,
	generateResetToken,
	generateVerificationToken,
	createUser,
	createSocialUserWithUniqueUsername,
	verifyGoogleToken,
} from "../utils/userUtils.js";
import sendMail from "../config/nodemailer.js";

/**
 *
 * @api {post} /api/users/register Register new user
 * @apiName apiName
 * @apiGroup User
 * @apiVersion  1.0.0
 *
 *
 * @apiParam  {String} username User's Username
 * @apiParam  {String} email  User's Email Address
 * @apiParam  {String} password User's Passsword
 *
 * @apiSuccess (200) {json} username User's username
 * @apiSuccess (200) {json} access Access token (to be used for authentication)
 * @apiSuccess (200) {Set-Cookie} refresh Refresh token (to be used for refreshing access token)
 *
 * @apiParamExample  {Formdata} Request-Example:
 * {
 *     username : "John",
 *     email : "johndoe@example.com",
 *     password: 1234
 * }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 Created
 * {
 *     access : "<some string>"
 * }
 * @apiSuccessExample {Headers} Success-Response:
 * Set-Cookie: refresh=****
 *
 * @apiError EmptyFields Either any of the fields were not provided or empty.
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Validation Error
 * {
 *    "title": "VALIDATION ERROR",
 *    "error": "All fields are mandatory!"
 * }
 *
 * @apiError InvalidEmail {json} Email was of Invalid Format.
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Validation Error
 * {
 *    "title": "VALIDATION ERROR",
 *    "error": "Invalid Email Address!"
 * }
 *
 * @apiError UsernameAlreadyExists
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Validation Error
 * {
 *    "title": "VALIDATION ERROR",
 *    "error": "Username already exists!"
 * }
 *
 * @apiError {json} EmailAlreadyExists
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Validation Error
 * {
 *    "title": "VALIDATION ERROR",
 *    "error": "Email already exists!"
 * }
 *
 */
export const register = asyncHandler(async (req, res) => {
	//Get the username, email, and password from the form.
	try {
		var {
			username: [username],
			email: [email],
			password: [password],
		} = await asyncFormParser(req).catch((err) => {
			throw err;
		});
	} catch (error) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("All fields are mandatory!");
	}

	// Credit: https://www.tutorialspoint.com/How-to-validate-email-address-in-JavaScript
	const emailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

	// Reject Form Data if required details not available
	if (!(username && email && password)) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("All fields are mandatory!");
	}

	if (username.includes(" ")) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Username Can't have spaces!");
	}

	if (!email.match(emailformat)) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Invalid Email Address!");
	}

	const user = await createUser(username, email, password).catch((err) => {
		if (err.code === 11000) res.status(400);
		throw err;
	});
	if (user) sendAuthDetails(res, user, statusCode.CREATED);
	else throw new Error("Something went Wrong!");
});

/**
 *
 * @api {post} /api/users/login Log in the Existing User
 * @apiName login
 * @apiGroup User
 * @apiVersion  1.0.0
 *
 *
 * @apiParam {String} username User's username or email address
 * @apiParam {String} password User's upassword
 *
 * @apiSuccess (200) {json} username User's username
 * @apiSuccess (200) {json} access Access token (to be used for authentication)
 * @apiSuccess (200) {Set-Cookie} refresh Refresh token (to be used for refreshing access token)
 *
 * @apiParamExample  {Formdata} Request-Example(1):
 * {
 *     username : "John",
 *     password: 1234
 * }
 *
 * @apiParamExample {Formdata} Request-Example(2):
 * {
 *     username : "johndoe@example.com",
 *     password: 1234
 * }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 202 ACCEPTED
 * {
 *     access : "<some string>"
 * }
 * @apiSuccessExample {Headers} Success-Response:
 * Set-Cookie: refresh=****
 *
 * @apiError {json} InvalidCredentials
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Validation Error
 * {
 *    "title": "VALIDATION ERROR",
 *    "error": "Invalid Credentials!"
 * }
 */
export const login = asyncHandler(async (req, res) => {
	try {
		var {
			username: [username],
			password: [password],
		} = await asyncFormParser(req).catch((err) => {
			throw err;
		});
	} catch (error) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("All fields are mandatory!");
	}

	const { user } = await User.authenticate()(username, password);
	if (!user) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Invalid Credentials!");
	} else sendAuthDetails(res, user, statusCode.ACCEPTED);
});

/**
 *
 * @api {post} /api/users/auth/google Log in with Google.
 * @apiName googleLogin
 * @apiGroup User
 * @apiVersion  1.0.0
 *
 * @apiDescription This API take in the credentials returned from Google Auth Login
 * Refer : https://www.npmjs.com/package/@react-oauth/google
 * And Use Sign in with google method to send credentials.
 *
 * @apiParam {String} credential Google login Credentials
 *
 * @apiSuccess (200) {json} username User's username
 * @apiSuccess (200) {json} access Access token (to be used for authentication)
 * @apiSuccess (200) {Set-Cookie} refresh Refresh token (to be used for refreshing access token)
 *
 * @apiParamExample  {Formdata} Request-Example(1):
 * {
 *     ...someData,
 *     credential: "<credential token here>"
 * }
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 202 ACCEPTED
 * {
 *     access : "<some string>"
 * }
 * @apiSuccessExample {Headers} Success-Response:
 * Set-Cookie: refresh=****
 *
 */
export const googleLogin = asyncHandler(async (req, res) => {
	const credential = req.body["credential"];
	const {
		name: username,
		email,
		email_verified,
	} = await verifyGoogleToken(credential).catch((err) => {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Invalid Credential!");
	});

	try {
		const user = await User.findOne({ email });
		if (user) sendAuthDetails(res, user);
		else throw new Error("Does not Exist!");
	} catch (err) {
		const user = await createSocialUserWithUniqueUsername(
			username,
			email,
			email_verified
		);
		if (!user) {
			throw new Error("Sorry, Can't sign in with Google!");
		} else {
			sendAuthDetails(res, user, statusCode.ACCEPTED);
		}
	}
});

/**
 *
 * @api {get} /api/users/token/refresh Refresh the access token.
 * @apiName refresh
 * @apiGroup User
 * @apiVersion  1.0.0
 *
 *
 * @apiParam {String} refresh Refresh token of User(It will be taken from the cookie. No intervention needed.)
 *
 * @apiSuccess (200) {json} username User's username
 * @apiSuccess (200) {json} access Access token (to be used for authentication)
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 202 ACCEPTED
 * {
 *     access : "<some string>"
 * }
 *
 * @apiError {json} Unauthorized
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 401 Unauthorized
 * {
 *    "title": "UNAUTHORIZED",
 *    "error": "User not Logged in!"
 * }
 */
export const refresh = asyncHandler(async (req, res) => {
	try {
		const refresh = req.cookies["refresh"];
		const user = getDetailsFromJWT(refresh, "refresh");
		const access = generateAccessToken(user.sub);
		res.status(statusCode.ACCEPTED).send({
			access,
			username: user.username,
			id: user.sub,
		});
	} catch (error) {
		res.status(statusCode.UNAUTHORIZED);
		res.end("User not logged in");
	}
});

/**
 *
 * @api {post} /api/users/change-username Change Username
 * @apiName changeUsername
 * @apiGroup User
 * @apiVersion  1.0.0
 *
 *
 * @apiParam  {String} username User's username
 *
 * @apiSuccess (202) {text} UsernameChanged Username Changed Successfully!
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *     username : JohnDoe
 * }
 *
 *
 * @apiSuccessExample {type} Success-Response:
 * {
 *     Username Changed Successfully!
 * }
 *
 * @apiError {json} UsernameExists
 * @apiError {json} NewUsernameSameAsOld
 *
 */
export const changeUsername = asyncHandler(async (req, res) => {
	try {
		var {
			username: [username],
		} = await asyncFormParser(req).catch((err) => {
			throw err;
		});
	} catch (error) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Please Provide a username!");
	}

	if (!username) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Please Provide a username!");
	}

	const user = req.user;
	if (username === user?.username) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Provide A different Username than the existing one.");
	}

	user.set("username", username);
	await user.save().catch((err) => {
		if (err.code === 11000) {
			res.status(statusCode.VALIDATION_ERROR);
			throw new Error("Username already Exists!");
		}
		throw err;
	});

	res.status(statusCode.ACCEPTED).send("Username Changed Successfully");
});

/**
 * Gives the token to allow user to change Password, incase user has forgotten his password.
 * @route GET /req-password
 * @access public
 */
export const reqPassword = asyncHandler(async (req, res) => {
	try {
		var {
			username: [username],
		} = await asyncFormParser(req).catch((err) => {
			throw err;
		});
	} catch (error) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Please Provide a username or Email!");
	}

	const user = await User.findByUsername(username, false);

	if (!user) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Invalid Credentials!");
	}

	const reset = generateResetToken(user.id);
	sendMail({
		to: user.email,
		subject: "Regarding Changing Your Password.",
		text: `Hey ${
			user.username
		}! We got to know You forgot your Password. Click on the following link to create a new password.\n Link: ${
			process.env.CHANGE_PASSWORD_LINK + reset
		} If this was not you Please ghost this email.\n Regards,\n Query Wizard `,
	});
	res.end("Reset Password Link sent to the email successfully!");
});

/**
 * Changes the User's password.
 * Takes in the
 * @route POST /forgot-password
 * @access private to user who has the token from the route /get-password
 * @auth Token <token from @route GET /req-password>
 */
export const forgotPassword = asyncHandler(async (req, res) => {
	try {
		var {
			password: [password],
		} = await asyncFormParser(req).catch((err) => {
			throw err;
		});
	} catch (error) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Please Provide a new Password!");
	}
	const user = req.user;
	await user.setPassword(password);
	await user.save();

	res.status(statusCode.ACCEPTED).send("Password Changed Successfully");
});

export const changePassword = asyncHandler(async (req, res) => {
	try {
		var {
			oldPassword: [oldPassword],
			newPassword: [newPassword],
		} = await asyncFormParser(req).catch((err) => {
			throw err;
		});
	} catch (error) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Please Provide both old and new Passwords!");
	}
	if (oldPassword === newPassword) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("New Password must be different than the old one!");
	}
	const user = req.user;
	await user.changePassword(oldPassword, newPassword).catch((err) => {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Invalid Old Password");
	});
	await user.save();

	res.status(statusCode.ACCEPTED).send("Password Changed Successfully");
});

export const reqEmailVerification = asyncHandler(async (req, res) => {
	const user = req.user;
	if (user.email_verified) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Email Already Verified!");
	}
	const token = generateVerificationToken(user.id);
	sendMail({
		to: user.email,
		subject: "Regarding Email Verification!",
		text: `Hey! This Email was added to the account with username ${
			user.username
		}. Click on the following link to verify the email.\nIf this was not you, Please contact us.\nLink: ${
			process.env.CHANGE_PASSWORD_LINK + token
		} `,
	});
	res.end("Email verification Link sent to the email successfully!");
});

export const verifyEmail = asyncHandler(async (req, res) => {
	const verifier = req.body["token"];
	try {
		var token = getDetailsFromJWT(verifier, "verify");
	} catch (error) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Invalid Link!");
	}
	const user = await User.findById(token.sub);
	if (!user) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Invalid Link!");
	}
	if (user.email_verified) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Email Already Verified!");
	}
	user.set("email_verified", true);
	await user.save();
	res.status(statusCode.ACCEPTED).json("Verified!");
});

export const logout = asyncHandler(async (req, res) => {
	res.clearCookie("refresh");
	res.end("User logged Out Successfully!");
});

export const getUser = asyncHandler(async (req, res) => {
	const { username } = req.params;
	const user = await User.findOne({
		username,
	});

	if (!user) {
		res.status(statusCode.NOT_FOUND);
		throw Error("User not Found!");
	}

	res.send(user);
});

export const findUsers = asyncHandler(async (req, res) => {
	const username = req.query.q || "";

	const { offset = 0, limit = 10 } = req.query;

	const users = await User.find({
		username: { $regex: username, $options: "i" },
	})
		.skip(offset)
		.limit(limit);

	res.send(users);
});
