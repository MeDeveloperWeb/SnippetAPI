import mongoose from "mongoose";
import passportLocalMongoose from 'passport-local-mongoose';

export const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: [true, "Please add the user name"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please add the user email address"],
      unique: true,
    },
    email_verified: {
      type: Boolean,
      default: false,
    }
});

// plugin for passport-local-mongoose
UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'username',
  usernameUnique: true,
  usernameQueryFields: ['username', 'email'],
});

const User = mongoose.model('User', UserSchema);

export default User;