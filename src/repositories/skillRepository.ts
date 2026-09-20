import { databasePool } from "../db.js";
import { type CreateSkillInput, type Skill, type UpdateSkillInput } from "../models/skill.js";

export async function findAllSkills(): Promise<Skill[]>{
    const result = await databasePool.query<Skill>("SELECT id, title, proficiency FROM skills ORDER BY id ASC");

    return result.rows;
}

export async function findSkillById(id: number): Promise<Skill | undefined>{
    const result = await databasePool.query<Skill>("SELECT id, title, proficiency FROM skills WHERE id = $1", [id]);

    return result.rows[0];
}

export async function createSkill(input: CreateSkillInput): Promise<Skill>{
    const result = await databasePool.query<Skill>(
        `INSERT INTO skills(title, proficiency)
        VALUES ($1, $2) RETURNING id, title, proficiency`,
        [input.title, input.proficiency]
    );
    const createdSkill = result.rows[0];

    if (createdSkill === undefined) {
        throw new Error("Database did not return the created skill");
    }

    return createdSkill;
}

export async function updateSkill(id: number, input: UpdateSkillInput): Promise<Skill | undefined>{
    // Null keeps the current value when a PATCH field is omitted.
    const result = await databasePool.query<Skill>(`
        UPDATE skills
        SET
            title = COALESCE($2, title),
            proficiency = COALESCE($3, proficiency)
        WHERE id = $1
        RETURNING id, title, proficiency`,
        [id, input.title ?? null, input.proficiency ?? null]
    );

    return result.rows[0];
}

export async function deleteSkill(id: number): Promise<boolean>{
    // RETURNING tells us whether a row was deleted.
    const result = await databasePool.query<{id: number}>(
        `DELETE FROM skills
        WHERE id = $1
        RETURNING id`,
        [id]
    );

    return result.rows[0] ? true : false;
}
