import { createServer } from "node:http";
import { portNumeric } from "./config.js";

function isCreateTaskInput(value: unknown): value is { title: string }{
    if(value !== null && typeof value === "object" && !Array.isArray(value))
        if("title" in value && typeof value.title === "string")
            if(value.title.trim() !== "")
                return true;
    return false;
}

const server = createServer((request, response) => {
    
    switch(request.method){
        case "GET":
            if(request.url === "/"){
                response.statusCode = 200;
                response.setHeader("Content-Type","text/plain; charset=utf-8");
                response.end("Node server is running");
                break;
            }

            if(request.url === "/health"){
                response.statusCode = 200;
                response.setHeader("Content-Type","application/json; charset=utf-8");
                response.end(JSON.stringify({"status": "ok"}));
                break;
            }

            response.statusCode = 404;
            response.setHeader("Content-Type","application/json; charset=utf-8");
            response.end(JSON.stringify({"error": "Not found"}));
            break;

        default:
            response.statusCode = 404;
            response.setHeader("Content-Type","application/json; charset=utf-8");
            response.end(JSON.stringify({"error": "Not found"}));
            break;
    };
});

server.listen(portNumeric, () => {
    console.log(`Server is running at http://localhost:${portNumeric}`);
});
