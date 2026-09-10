import express, {type NextFunction, type Request, type Response,} from "express";
import { portNumeric } from "./config.js";

type ProficiencyLevel = "beginner" | "intermediate" | "advanced";
type ErrorCodes = "INVALID_ID" | "INVALID_BODY" | "INVALID_JSON" | "NOT_FOUND" | "INTERNAL_ERROR";

type JsonParseError = SyntaxError & {
    status: number;
    type: string;
};

type ApiErrorResponse  = {
    error:{
        code: ErrorCodes,
        message: string;
    }
}

const proficiencyScores: Record<ProficiencyLevel, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3
};

type Skill = {
    id: number,
    title: string,
    proficiency: ProficiencyLevel,
}

type CreateSkillInput = Pick<
    Skill,
    "title" | "proficiency"
>;

type UpdateSkillInput = Partial<CreateSkillInput>;

let skills: Skill[] = [];
let nextSkillId: number = 1;

//Predicate for an error in middleware
function isJsonParseError(error: unknown): error is JsonParseError {
    return error instanceof SyntaxError 
    && "status" in error && error.status === 400 && "type" in error && error.type === "entity.parse.failed";
}

function sendApiError(response: Response, status: number, code:ErrorCodes, message: string){
    const errorResponse: ApiErrorResponse = {error:{code: code, message: message}}
    response.status(status).json(errorResponse);
}

function isProficiencyLevel(value: unknown): value is ProficiencyLevel {
    return value === "beginner" || value === "intermediate" || value === "advanced";
}

function isCreateSkillInput(value: unknown): value is CreateSkillInput {
    if(value !== null && typeof value === "object" && !Array.isArray(value))
        if("title" in value && "proficiency" in value && typeof value.title === "string" && isProficiencyLevel(value.proficiency))
            if(value.title.trim() !== "")
                return true;
    return false;
}

function isUpdateSkillInput(value: unknown): value is UpdateSkillInput{
    if(value === null || typeof value !== "object" || Array.isArray(value))    {
        return false;
    }
    const hasTitle = "title" in value;
    const hasProficiency = "proficiency" in value;
    if(!hasTitle && !hasProficiency)
        return false;
    if(hasTitle && (typeof value.title !== "string" || value.title.trim() === ""))
        return false;
    if(hasProficiency && !isProficiencyLevel(value.proficiency))
        return false;
    return true;
}

const app = express();
app.use(express.json());

//GET
app.get("/", (request, response) => {
    response.send("Node server is running");
});

app.get("/health", (request, response) => {
    response.json({ status: "ok" });
});

app.get("/skills", (request, response) => {
    response.json(skills);
});

app.get("/skills/:id", (request, response) => {
    const id = Number(request.params.id);
    
    if(Number.isInteger(id) && id > 0){
        const skill = skills.find(skill => skill.id === id);
        if(skill === undefined){
            sendApiError(response, 404, "NOT_FOUND", `No skill with id:${id}`);
            return;
        }
        response.json(skill);
        return;
    }
    sendApiError(response, 400, "INVALID_ID", "Invalid skill id");
});

app.get("/skills/:id/score", (request, response) => {
    const id = Number(request.params.id);
    
    if(Number.isInteger(id) && id > 0){
        const skill = skills.find(skill => skill.id === id);
        if(skill === undefined){
            sendApiError(response, 404, "NOT_FOUND", `No skill with id:${id}`);
            return;
        }
        response.json({skillId: skill.id, proficiency: skill.proficiency, score: proficiencyScores[skill.proficiency]});
        return;
    }
    sendApiError(response, 400, "INVALID_ID", "Invalid skill id");
});

//POST
app.post("/skills", (request, response) => {
    const body: unknown = request.body;
    if(isCreateSkillInput(body)){
        const newSkill: Skill = {id: nextSkillId, title: body.title.trim(), proficiency: body.proficiency};
        skills.push(newSkill);
        response.status(201).json(newSkill);
        nextSkillId += 1;
        return;
    }
    sendApiError(response, 400, "INVALID_BODY", "Invalid skill input");
});

//PATCH
app.patch("/skills/:id", (request, response) =>{
    const id = Number(request.params.id);
    
    if(Number.isInteger(id) && id > 0){
        const skillUpdateProperties: unknown = request.body;
        if(!isUpdateSkillInput(skillUpdateProperties)){
            sendApiError(response, 400, "INVALID_BODY", "Invalid update properties");
            return;
        }
        const skill = skills.find(skill => skill.id === id);
        if(skill === undefined){
            sendApiError(response, 404, "NOT_FOUND", `No skill with id:${id}`);
            return;
        }
        const updatedSkill: Skill = {
            id: skill.id, 
            title: skillUpdateProperties.title !== undefined ? skillUpdateProperties.title.trim() : skill.title, 
            proficiency: skillUpdateProperties.proficiency !== undefined ? skillUpdateProperties.proficiency : skill.proficiency 
        };
        skills = skills.map((skill) => {
            if(skill.id === id)
                return updatedSkill;
            return skill;
        });
        response.json(updatedSkill);
        return;
    }
    sendApiError(response, 400, "INVALID_ID", "Invalid skill id");
});

//DELETE
app.delete("/skills/:id", (request, response) => {
    const id = Number(request.params.id);

    if(Number.isInteger(id) && id > 0){
        const skill = skills.find(skill => skill.id === id);
        if(skill === undefined){
            sendApiError(response, 404, "NOT_FOUND", `No skill with id:${id}`);
            return;
        }
        skills = skills.filter(skill => skill.id !== id);
        response.status(204).send();
        return;
    }
    sendApiError(response, 400, "INVALID_ID", "Invalid skill id");
});

// Callback
app.use((request, response) => {
    sendApiError(response, 404, "NOT_FOUND", "Invalid URL");
});

//Error handling middleware
app.use((error: unknown, _request: Request, response: Response, next: NextFunction) => {
    if(response.headersSent){
        next(error);
        return;
    }
    if(isJsonParseError(error)){
        sendApiError(response, 400, "INVALID_JSON", "Invalid JSON");
        return;
    }
    sendApiError(response, 500, "INTERNAL_ERROR", "Internal server error");
});


app.listen(portNumeric, (error) => {
    if(error){
        console.log(error.message);
        return;
    }

    console.log(`Server is running at http://localhost:${portNumeric}`);
});
