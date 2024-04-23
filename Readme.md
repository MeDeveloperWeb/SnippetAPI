# Query Wizard API

Query Wizard API is a Node.js server that provides an API for the Query Wizard app.

## Installation

To install and run the Query Wizard API locally, please follow these steps:

1. Ensure that you have [Node.js](https://nodejs.org/) installed on your machine.

2. Clone this repository to your local machine using the following command:
   ```
   git clone https://github.com/MeDeveloperWeb/QueryWizardAPI.git
   ```

3. Navigate to the project directory:
   ```
   cd QueryWizardApi
   ```

4. Install the dependencies by running the following command:
   ```
   npm install
   ```

5. Add Required `.env ` file
  ```
  PORT=5000
  DB_CONNECTION_STRING=<get from mongodb.com>
  JWT_ACCESS_SECRET=<any random key>
  JWT_REFRESH_SECRET=<any random key>
  JWT_RESET_SECRET=<any random key>
  JWT_VERIFY_SECRET=<any random key>
  GOOGLE_CLIENT_SECRET=<get from console.cloud.google.com>
  CLIENT_ID=<get from console.cloud.google.com>
  GMAIL_ID=<your email>
  GMAIL_PASSWORD=<your app password [See this:(https://www.getmailbird.com/gmail-app-password/)]>
  CHANGE_PASSWORD_LINK=<frontend link here (Example: http://localhost:3000/change-password/)>
  ```
3. Run the app in development mode
  ```
  npm run dev
  ```

## Running the API

Once you have installed the dependencies, you can start the API server using the following command:

```
npm run dev
```

The API server will start running on `http://localhost:5000`.

## API Documentation

[See here](./docs/API.md)

## Contributing

As this API is for private use, contributions are not currently accepted. However, thank you for your interest.

## License

This project is currently unlicensed.

Feel free to customize this template further based on your specific requirements.