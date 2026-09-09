import express  from "express";
import { portNumeric } from "./config.js";

type CreateSkillInput = {
    title: string,
};

type Skill = {
    id: number,
    title: string,
}

const skills: Skill[] = [];
let nextSkillId: number = 1;

function isCreateSkillInput(value: unknown): value is CreateSkillInput {
    if(value !== null && typeof value === "object" && !Array.isArray(value))
        if("title" in value && typeof value.title === "string")
            if(value.title.trim() !== "")
                return true;
    return false;
}

const app = express();
app.use(express.json());

app.get("/", (request, response) => {
    response.send("Node server is running");
});

app.get("/health", (request, response) => {
    response.json({ status: "ok" });
});

app.get("/skills", (request, response) => {
    response.json(skills);
});

app.post("/skills", (request, response) => {
    const body: unknown = request.body;
    if(isCreateSkillInput(body)){
        const newSkill: Skill = {id: nextSkillId, title: body.title.trim()};
        skills.push(newSkill);
        response.status(201).json(newSkill);
        nextSkillId += 1;
        return;
    }
    response.status(400).json({ "error": "Invalid skill input" });
});

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
