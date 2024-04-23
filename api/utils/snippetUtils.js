import Snippet from "../models/snippetModel.js";

export async function createSnippet(user, snippet, language) {
	const snippet = new Snippet({user, snippet, language});
	await snippet.save();
	return snippet;
}