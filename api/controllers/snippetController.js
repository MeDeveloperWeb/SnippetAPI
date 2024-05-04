import asyncHandler from "express-async-handler";
import statusCode from "../statusCode.js";
import Snippet from "../models/snippetModel.js";
import User from "../models/userModel.js";
import { Types } from "mongoose";

export const addSnippet = asyncHandler(async (req, res) => {
	const { title, files } = req.body;

	if (!files || !files.length) {
		res.status(statusCode.VALIDATION_ERROR);
		throw Error("Please Provide Code File");
	}

	for (const file of files) {
		if (!file || !file.language) {
			res.status(statusCode.VALIDATION_ERROR);
			throw Error("Please Provide Language of Code");
		}
	}
	const snippetId = new Types.ObjectId();

	const newSnippet = new Snippet({
		_id: snippetId,
		user: req.user._id,
		title,
		files,
	});
	await newSnippet.save();
	res.send({
		message: "Saved Snippet Successfully",
		id: snippetId,
		user: req.user._id,
	});
});

export const findAll = asyncHandler(async (req, res) => {
	const { q = "", offset = 0, limit = 12 } = req.query;

	const snippets = await Snippet.find(
		{
			$or: [
				{ title: { $regex: q, $options: "i" } },
				{ "files.language": { $regex: q, $options: "i" } },
			],
		},
		"_id title files.language"
	)
		.skip(offset)
		.limit(limit);

	res.send(snippets);
});

export const getUserSnippets = asyncHandler(async (req, res) => {
	const { username } = req.params;
	const { q = "", offset = 0, limit = 12 } = req.query;

	const user = await User.findOne({
		username,
	});

	if (!user) {
		res.status(statusCode.NOT_FOUND);
		throw Error("User not Found!");
	}

	const snippets = await Snippet.find(
		{
			user: user._id,
		},
		"_id title files.language user"
	)
		.and({
			$or: [
				{ title: { $regex: q, $options: "i" } },
				{ "files.language": { $regex: q, $options: "i" } },
			],
		})
		.skip(offset)
		.limit(limit);

	res.send(snippets);
});

export const getSnippet = asyncHandler(async (req, res) => {
	const { id } = req.params;

	try {
		const snippet = await Snippet.findById(id);
		if (!snippet) throw Error();

		res.send(snippet);
	} catch (error) {
		res.status(statusCode.VALIDATION_ERROR);
		throw Error("Invalid Id");
	}
});

export const deleteSnippet = asyncHandler(async (req, res) => {
	const { id } = req.body;

	const result = await Snippet.deleteOne({
		_id: id,
		user: req.user._id,
	});

	res.send(result);
});

export const updateSnippet = asyncHandler(async (req, res) => {
	const { title, files, _id } = req.body;

	if (!files || !files.length) {
		res.status(statusCode.VALIDATION_ERROR);
		throw Error("Please Provide Code File");
	}

	for (const file of files) {
		if (!file || !file.language) {
			res.status(statusCode.VALIDATION_ERROR);
			throw Error("Please Provide Language of Code");
		}
	}

	const result = await Snippet.updateOne(
		{
			_id,
			user: req.user._id,
		},
		{
			title,
			files,
		}
	);
	if (result.matchedCount === 1)
		res.send({ message: "Snippet updated Successfully" });
	else {
		res.status(statusCode.VALIDATION_ERROR);
		throw Error("Snippet Not Found");
	}
});
