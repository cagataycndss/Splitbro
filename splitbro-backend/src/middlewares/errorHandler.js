const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  if (!statusCode) {
    statusCode = 500;
    message = 'Internal Server Error';
  }

  res.locals.errorMessage = err.message;

  console.error("HATA YAKALANDI:", err);

  const response = {
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'development\r' ? { stack: err.stack } : {}),
  };

  res.status(statusCode).send(response);
};

export default errorHandler;
