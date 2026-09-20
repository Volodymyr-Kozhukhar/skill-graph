import express, {type NextFunction, type Request, type Response,} from "express";
import { portNumeric } from "./config.js";
import { databasePool } from "./db.js";
import type { ProficiencyLevel, CreateSkillInput, UpdateSkillInput } from "./models/skill.js";
import { findAllSkills, findSkillById, createSkill, updateSkill, deleteSkill} from "./repositories/skillRepository.js";

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

app.get("/ready", async (_request, response, next) => {
    try {
        await databasePool.query("SELECT 1");
        response.json({ status: "ready" });
    } catch (error) {
        next(error);
    }
});

app.get("/skills", async (request, response, next) => {
    try {
        const databaseSkills = await findAllSkills();
        response.json(databaseSkills);
    }catch(error) {
        next(error);
    }
});

app.get("/skills/:id", async (request, response, next) => {
    const id = Number(request.params.id);
    
    if(Number.isInteger(id) && id > 0){
        try{
            const databaseSkill = await findSkillById(id);
            if(databaseSkill === undefined){
                sendApiError(response, 404, "NOT_FOUND", `No skill with id:${id}`);
                return;
            }
            response.json(databaseSkill);
            return;
        } catch(error) {
            next(error)
            return;
        }
    }
    sendApiError(response, 400, "INVALID_ID", "Invalid skill id");
});

app.get("/skills/:id/score", async (request, response, next) => {
    const id = Number(request.params.id);
    
    if(Number.isInteger(id) && id > 0){
        try{
            const skill = await findSkillById(id);
            if(skill === undefined){
                sendApiError(response, 404, "NOT_FOUND", `No skill with id:${id}`);
                return;
            }
            response.json({skillId: skill.id, proficiency: skill.proficiency, score: proficiencyScores[skill.proficiency]});
            return;
        } catch(error){
            next(error);
            return;
        }
    }
    sendApiError(response, 400, "INVALID_ID", "Invalid skill id");
});

//POST
app.post("/skills", async (request, response, next) => {
    const body: unknown = request.body;
    if(!isCreateSkillInput(body)){
        sendApiError(response, 400, "INVALID_BODY", "Invalid skill input");
        return;
    }

    const skillInput: CreateSkillInput = {
        title: body.title.trim(),
        proficiency: body.proficiency,
    };

    try{
        const newSkill = await createSkill(skillInput);
        response.status(201).json(newSkill);
    } catch(error){
        next(error);
    }
});

//PATCH
app.patch("/skills/:id", async (request, response, next) =>{
    const id = Number(request.params.id);
    
    if(Number.isInteger(id) && id > 0){
        const skillUpdateProperties: unknown = request.body;
        if(!isUpdateSkillInput(skillUpdateProperties)){
            sendApiError(response, 400, "INVALID_BODY", "Invalid update properties");
            return;
        }

        const updateSkillInput: UpdateSkillInput = {};
        if(skillUpdateProperties.title !== undefined){
            updateSkillInput.title = skillUpdateProperties.title.trim();
        }
        if(skillUpdateProperties.proficiency !== undefined){
            updateSkillInput.proficiency = skillUpdateProperties.proficiency;
        }

        try{
            const updatedSkill = await updateSkill(id, updateSkillInput);

            if(updatedSkill === undefined){
                sendApiError(response, 404, "NOT_FOUND", `No skill with id:${id}`);
                return;
            }
            response.json(updatedSkill);
            return;

        } catch(error){
            next(error);
            return;
        }
    }
    sendApiError(response, 400, "INVALID_ID", "Invalid skill id");
});

//DELETE
app.delete("/skills/:id", async(request, response, next) => {
    const id = Number(request.params.id);

    if(Number.isInteger(id) && id > 0){
        try{
            const isDeleted = await deleteSkill(id);
            if(!isDeleted){
                sendApiError(response, 404, "NOT_FOUND", `No skill with id:${id}`);
                return;
            }
            response.status(204).send();
            return;
        } catch (error){
            next(error);
            return;
        }
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
