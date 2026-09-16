Create table skills(
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    proficiency TEXT NOT NULL,
    CONSTRAINT skills_title_not_blank CHECK(CHAR_LENGTH(TRIM(title)) > 0),
    CONSTRAINT skills_proficiency_valid CHECK (proficiency IN ('beginner', 'intermediate', 'advanced'))
);