let taperStepCount = 0;

function addTaperStep() {
    taperStepCount++;
    let newDiv = document.createElement('div');
    newDiv.id = `taperStep${taperStepCount}`;
    newDiv.className = 'taperStep';
    newDiv.innerHTML = `
        <div class='input-group'>
            <label for='dose${taperStepCount}'>Dose (mg):</label>
            <input type='number' id='dose${taperStepCount}' class='doseInput'>
        </div>
        <div class='input-group'>
            <label for='duration${taperStepCount}'>Duration (days):</label>
            <input type='number' id='duration${taperStepCount}'>
        </div>
        <div class='input-group'>
            <label for='frequency${taperStepCount}'>Times per Day:</label>
            <input type='number' id='frequency${taperStepCount}'>
        </div>
        <div class='input-group removeButtonContainer'>
            <button type='button' onclick='removeTaperStep(${taperStepCount})'>Remove</button>
        </div>
    `;
    document.getElementById('taperScheduleDiv').appendChild(newDiv);
    }



function removeTaperStep(stepNumber) {
    const element = document.getElementById(`taperStep${stepNumber}`);
    element.parentNode.removeChild(element);
    }

function calculate() {
    const tabletStrength = parseFloat(document.getElementById('tabletStrength').value);

    let isValid = true;

    let totalDose = 0;
    let totalDuration = 0;
    let sigResult = ""; // Initialize the Sig result string

    for (let i = 1; i <= taperStepCount; i++) {
        const doseElement = document.getElementById(`dose${i}`);
        const durationElement = document.getElementById(`duration${i}`);
        const frequencyElement = document.getElementById(`frequency${i}`);
    
        if (doseElement && durationElement && frequencyElement) {
            const dose = parseFloat(doseElement.value);
            const duration = parseFloat(durationElement.value);
            const frequency = parseFloat(frequencyElement.value);
    
            if (isNaN(dose) || isNaN(duration) || isNaN(frequency)) {
                isValid = false;
                break;
            }
    
            totalDose += dose * duration * frequency;
            totalDuration += duration;
    
            // Create the sig sentence for this step
            let tabletsPerDose = dose / tabletStrength;
            let doseInstruction = `Take ${tabletsPerDose} tablet(s) `;
            let frequencyInstruction = '';
            if (frequency === 1) {
                frequencyInstruction = 'once a day ';
            } else if (frequency === 2) {
                frequencyInstruction = 'twice a day ';
            } else {
                frequencyInstruction = `${frequency} times a day `;
            }
            let durationInstruction = `for ${duration} days`;
            let stepSig = doseInstruction + frequencyInstruction + durationInstruction;
    
            // Append the stepSig to the sigResult, adding a newline for readability
            sigResult += stepSig + "; ";
        }
    }
    

    if (!isValid) {
        alert('Invalid input. Please check your taper schedule.');
        return;
    }

    let tabletsNeeded = totalDose / tabletStrength;
    tabletsNeeded = Math.ceil(tabletsNeeded * 2) / 2; // Round up to the nearest half-tablet

    document.getElementById('totalTablets').innerText = `${tabletsNeeded} (Tablet Strength: ${tabletStrength}mg)`;
    document.getElementById('totalDuration').innerText = totalDuration;
    document.getElementById('sigResult').innerText = sigResult.trim(); // Set the sigResult text
    }
