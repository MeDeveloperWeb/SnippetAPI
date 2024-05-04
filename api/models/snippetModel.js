import mongoose, { Schema } from "mongoose";

export const SnippetSchema = new mongoose.Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	title: {
		type: String,
		default: "Untitled",
	},
	files: {
		type: [
			{
				content: {
					type: String,
				},
				language: {
					type: String,
				},
			},
		],
		required: [true, "Please provide Snippet"],
	},
});

const Snippet = mongoose.model("Snippet", SnippetSchema);

export default Snippet;
