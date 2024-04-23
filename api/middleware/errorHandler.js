import statusCode from "../statusCode.js";

const errorHandler = (err, req, res, next) => {
  let status = res.statusCode;
  if (status === 200 ) status = statusCode.SERVER_ERROR;

  const getStatusTitle = (code)=> (
    Object.keys(statusCode).find((key) => statusCode[key] === code) || "OOPS! Something Bad happened."
  );

  const prettyText = (string) => (
    string.split('_').join(' ')
  );

  res.status(status).json({
    title: prettyText(getStatusTitle(status)),
    error: err.message,
    stackTrace: err.stack,
  });
}

export default errorHandler;
