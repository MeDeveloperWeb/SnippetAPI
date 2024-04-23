import { connect } from "mongoose";

export default async function connectDb() {
  try {
    await connect(process.env.DB_CONNECTION_STRING);
    console.log(
      "Database connected!",
    );
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}
