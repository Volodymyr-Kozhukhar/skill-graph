import express  from "express";
import { portNumeric } from "./config.js";

type ProficiencyLevel = "beginner" | "intermediate" | "advanced";

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
            response.status(404).json({"error": `No skill with id:${id}`});
            return;
        }
        response.json(skill);
        return;
    }
    response.status(400).json({"error": "Invalid skill id"});
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
    response.status(400).json({ "error": "Invalid skill input" });
});

//PATCH
app.patch("/skills/:id", (request, response) =>{
    const id = Number(request.params.id);
    
    if(Number.isInteger(id) && id > 0){
        const skillUpdateProperties: unknown = request.body;
        if(!isUpdateSkillInput(skillUpdateProperties)){
            response.status(400).json({"error": "Invalid update properties"});
            return;
        }
        const skill = skills.find(skill => skill.id === id);
        if(skill === undefined){
            response.status(404).json({"error": `No skill with id:${id}`});
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
    response.status(400).json({"error": "Invalid skill id"});
});

//DELETE
app.delete("/skills/:id", (request, response) => {
    const id = Number(request.params.id);

    if(Number.isInteger(id) && id > 0){
        const skill = skills.find(skill => skill.id === id);
        if(skill === undefined){
            response.status(404).json({"error": `No skill with id:${id}`});
            return;
        }
        skills = skills.filter(skill => skill.id !== id);
        response.status(204).send();
        return;
    }
    response.status(400).json({ "error": "Invalid skill id" });
});

// Callback
app.use((request, response) => {
    response.status(404).json({"error": "Not found"});
});


app.listen(portNumeric, (error) => {
    if(error){
        console.log(error.message);
        return;
    }

    console.log(`Server is running at http://localhost:${portNumeric}`);
});
