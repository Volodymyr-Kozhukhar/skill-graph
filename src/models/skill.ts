export type ProficiencyLevel = "beginner" | "intermediate" | "advanced";

export type Skill = {
    id: number,
    title: string,
    proficiency: ProficiencyLevel,
}

export type CreateSkillInput = Pick<
    Skill,
    "title" | "proficiency"
>;

export type UpdateSkillInput = Partial<CreateSkillInput>;