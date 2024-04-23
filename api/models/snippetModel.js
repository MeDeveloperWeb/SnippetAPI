import mongoose, { Schema } from "mongoose";

export const SnippetSchema = new mongoose.Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    title : {
      type: String,
      default: "Untitled"
    },
    description: {
      type: String
    },
    snippet: {
      type: String,
      required: [true, "Please provide Snippet"],
    },
    language: {
      type: String,
      required: [true, "Please provide the language used"]
    },
});

const Snippet = mongoose.model('Snippet', SnippetSchema);

export default Snippet;