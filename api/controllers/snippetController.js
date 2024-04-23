import asyncHandler from "express-async-handler";
import statusCode from "../statusCode.js";
import { findUserById } from "../utils/userUtils.js";
import Snippet from "../models/snippetModel.js";
import User from "../models/userModel.js";
export const addSnippet = asyncHandler(async (req, res) => {
	const { title, description, snippet, language } = req.body;

	if (!snippet || !language) {
		res.status(statusCode.VALIDATION_ERROR);
		throw new Error("Please Provide both Code and language");
	}

	const newSnippet = new Snippet({
		user: req.user._id,
		title,
		description,
		snippet,
		language,
	});
	await newSnippet.save();
	res.end("Saved Snippet Successfully");
});

export const findAll = asyncHandler(async (req, res) => {
	const { q = "", offset = 0, limit = 10 } = req.query;

	const snippets = await Snippet.find(
		{
			$or: [
				{ title: { $regex: q, $options: "i" } },
				{ language: { $regex: q, $options: "i" } },
			],
		},
		"_id title language"
	)
		.skip(offset)
		.limit(limit);

	res.send(snippets);
});

export const getUserSnippets = asyncHandler(async (req, res) => {
	const { username } = req.params;
	const { q = "", offset = 0, limit = 10 } = req.query;

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
		"_id title language"
	)
		.and({
			$or: [
				{ title: { $regex: q, $options: "i" } },
				{ description: { $regex: q, $options: "i" } },
				{ language: { $regex: q, $options: "i" } },
			],
		})
		.skip(offset)
		.limit(limit);

	res.send(snippets);
});

export const getSnippet = asyncHandler(async (req, res) => {
	const { id } = req.params;

	console.log(id);

	try {
		const snippet = await Snippet.findById(id);
		if (!snippet) throw Error();

		res.send(snippet);
	} catch (error) {
		res.status(statusCode.VALIDATION_ERROR);
		res.end("Invalid Id");
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
	const { title, description, snippet, language, id } = req.body;

	const result = await Snippet.updateOne(
		{
			_id: id,
			user: req.user._id,
		},
		{
			title,
			description,
			snippet,
			language,
		}
	);

	res.send(result);
});
