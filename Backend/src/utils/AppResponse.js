class AppResponse {
    constructor(statusCode, message = "success", data = null) {
        this.success = statusCode >= 200 && statusCode <= 299 ? true : false;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}

export default AppResponse;
