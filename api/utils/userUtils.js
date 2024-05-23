import multiparty from "multiparty";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { OAuth2Client } from "google-auth-library";
import sendMail from "../config/nodemailer.js";

/**
 * Parses the sent form and gives the corresponding values as list of string.
 * @param req
 * @returns {Promise<any>}
 * @example {username: ["John"], email: ["john@doe.com"]}
 */
export async function asyncFormParser(req) {
	return new Promise((resolve, reject) => {
		// Parse the form to get required values.
		const form = new multiparty.Form();
		form.parse(req, function (err, fields) {
			if (err) {
				return reject(err);
			}
			resolve(fields);
		});
	});
}

/**
 * Generates Access Token with Expiry time of 10 minutes.
 * @param {string} id
 * @returns {string} access
 */
export function generateAccessToken(id) {
	const payload = {
		sub: id,
	};

	const opts = {
		expiresIn: "3m",
	};

	const access = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, opts);

	return access;
}

/**
 * Generates Refresh Token with Expiry time of 7 days.
 * @param {IUser} user
 * @returns {string} refresh token
 */
export function generateRefreshToken(user) {
	const payload = {
		sub: user.id,
		username: user.username,
	};

	const opts = {
		expiresIn: "7d",
	};

	const refresh = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, opts);

	return refresh;
}

/**
 * Generates Password Reset Token with Expiry time of 15 minutes.
 * @param id
 * @returns password reset token
 */
export function generateResetToken(id) {
	const payload = {
		sub: id,
	};

	const opts = {
		expiresIn: "30m",
	};

	const reset = jwt.sign(payload, process.env.JWT_RESET_SECRET, opts);

	return reset;
}

/**
 * Generates Email Verification Token with Expiry time of 30 minutes.
 * @param id
 * @returns email verification token
 */
export function generateVerificationToken(id) {
	const payload = {
		sub: id,
	};

	const opts = {
		expiresIn: "30m",
	};

	const verify = jwt.sign(payload, process.env.JWT_VERIFY_SECRET, opts);

	return verify;
}

/**
 * Sends Access token and username in response.
 * @param res
 * @param user
 * @param {number} [statusCode=200]
 * @returns access token and username
 * @example{
 *    username: "John",
 *    access: "****"
 * }
 * @returns Refresh token as HttpOnly Cookie.
 * @example {refresh: "****"}
 */
export function sendAuthDetails(res, user, statusCode = 200) {
	const access = generateAccessToken(user.id);
	const refresh = generateRefreshToken(user);

	res.header("Access-Control-Allow-Credentials", "true");
	res.cookie("refresh", refresh, {
		maxAge: 7 * 24 * 60 * 60 * 1000,
		httpOnly: true,
		secure: process.env.IN_PRODUCTION,
		sameSite: "none",
	});
	res.status(statusCode).json({
		username: user.username,
		access,
		refresh,
		refreshMaxAge: 7 * 24 * 60 * 60 * 1000,
		id: user._id,
	});
}

/**
 * Verifies the JWT Token with provided secret.
 * Sends the decoded details.
 * @param jwt_token
 * @param verifier
 * @returns jwt_payload
 */
export function getDetailsFromJWT(jwt_token, verifier) {
	try {
		const secret = `JWT_${verifier.toUpperCase()}_SECRET`;
		if (!process.env[secret]) throw new Error("Invalid Secret");
		const secretKey = process.env[secret] || "secret";
		const token = jwt.verify(jwt_token, secretKey);
		return token;
	} catch (error) {
		return null;
	}
}

/**
 * Generate a random (n % 26) digit number.
 * @param n
 * @returns random (n % 26) digit number.
 */
export function generateRandomNumber(n) {
	n %= 26; // Cuz the function runs till n = 25 only.
	const min = (10 ** n) >>> 0;
	const max = (10 ** (n + 1)) >>> 0;
	return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Capitalizes the first Letter of given string.
 * @param {string} string
 * @returns the string after capitalizing its first letter.
 */
export function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Creates the user with given details.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @param {boolean} email_verified
 * @returns saved user
 * @throws Username already exist in case of duplication.
 * @throws Email already exist in case of duplication.
 */
export async function createUser(
	username,
	email,
	password,
	email_verified = false
) {
	try {
		const user = new User({ username, email, email_verified });
		await user.setPassword(password);
		await user.save();
		return user;
	} catch (err) {
		if (err.code === 11000) {
			err.message = `${capitalizeFirstLetter(
				Object.keys(err.keyValue)[0]
			)} already exists.`;
			throw err;
		}
	}
}

/**
 * Gives the available Username
 * @param {string} username
 * @returns {Promise<string>} available username
 */
export async function getUniqueUsername(username) {
	let counter = 0;
	const main = async () => {
		const unique = username + generateRandomNumber(counter);
		try {
			const user = await User.findOne({ username: unique });
			if (!user) return unique;
			counter++;
			return main();
		} catch (err) {
			return unique;
		}
	};
	return main();
}

/**
 * Creates the User from the Social Login Auth with a unique username and random password.
 * @param {string} username
 * @param {string} email
 * @param {boolean} email_verified
 * @returns user.
 */
export async function createSocialUserWithUniqueUsername(
	username,
	email,
	email_verified = false
) {
	const password =
		Math.random().toString(36).slice(2) +
		Math.random().toString(36).toUpperCase().slice(2);
	username = username.split(" ").join("_");
	try {
		const user = await createUser(
			username,
			email,
			password,
			email_verified
		);
		return user;
	} catch (err) {
		username = await getUniqueUsername(username);
		console.log(username, getUniqueUsername(username));
		const user = await createUser(username, email, password);
		return user;
	}
}

/**
 *
 * @param token
 * @returns
 */
export async function verifyGoogleToken(token) {
	const client = new OAuth2Client(process.env.CLIENT_ID);
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: process.env.CLIENT_ID,
	});
	return ticket.getPayload();
}

export async function findUserById(id) {
	const user = await User.findById(id);

	return user;
}

export function sendVerificationMail(user) {
	const token = generateVerificationToken(user.id);
	sendMail({
		to: user.email,
		subject: "Regarding Email Verification!",
		text: `Hey! This Email was added to the account with username ${
			user.username
		}. Click on the following link to verify the email.\nIf this was not you, Please contact us.\nLink: ${
			process.env.VERIFY_EMAIL_LINK + token
		} `,
	});
}
