const addSkillForm = document.getElementById("add-skill");
const skillListElement = document.querySelector(".skill-list");
const hiddenNoSkillText = document.getElementById("noSkillHeading");

function showNoSkillsText(){
    if(skillListElement.childElementCount === 0){
        hiddenNoSkillText.hidden = false;
    }else{
        hiddenNoSkillText.hidden = true;
    }
}

//New Skill form submition listener
addSkillForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const skillNameInput = document.getElementById("skillname");
    const skillProficiencyInput = document.getElementById("skillproficiency");
    const skillName = skillNameInput.value.trim();
    const skillProficiency = skillProficiencyInput.value;

    if (skillName === "") {
        return;
    }

    const newLiElement = document.createElement("li");

    const newSpanElement = document.createElement("span");
    newSpanElement.textContent = `${skillName}: ${skillProficiency}`;

    const newButtonElement = document.createElement("button");
    newButtonElement.type = "button";
    newButtonElement.textContent = "Delete";

    newLiElement.appendChild(newSpanElement);
    newLiElement.appendChild(newButtonElement);

    skillListElement.appendChild(newLiElement);

    showNoSkillsText();
    skillNameInput.value = "";
    console.log(skillName, skillProficiency);
});

//Delete Skill button listener
skillListElement.addEventListener("click", (event) => {
    const button = event.target.closest('button');
    if(!button){
        return;
    }

    const liElement = button.closest("li");
    liElement.remove();
    showNoSkillsText();
});

showNoSkillsText();