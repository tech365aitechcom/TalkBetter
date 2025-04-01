/**
 * Custom error handler class that extends the built-in `Error` object.
 * It allows setting an HTTP status code along with an error message.
 * 
 * This class is useful for creating structured error responses in an Express application.
 * It also captures the stack trace for better debugging.
*/

class ErrorHandler extends Error {
    
    statusCode: number;
     
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;

        (Error as any).captureStackTrace(this, this.constructor);
    }
}

export default ErrorHandler;
