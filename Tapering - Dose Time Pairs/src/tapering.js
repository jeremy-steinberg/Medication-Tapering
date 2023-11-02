let taperStepCount = 0;

function addTaperStep() {
    taperStepCount++;
    let newDiv = document.createElement('div');
    newDiv.id = `taperStep${taperStepCount}`;
    newDiv.className = 'taperStep';
    newDiv.innerHTML = `
        <div class='input-group duration-input-group'>
            <label for='duration${taperStepCount}'>Duration (days):</label>
            <input type='number' id='duration${taperStepCount}'><br>
        </div>

        <div id="doseTimePairsContainer${taperStepCount}">
            <div id="doseTimePairs${taperStepCount}" class="doseTimePairs">
                <!-- Dose-time pairs will be added here -->
            </div>
            <button type='button' onclick='addDoseTimePair(${taperStepCount})'>Add Dose-Time Pair</button>
        </div>
        <button type='button' onclick='removeTaperStep(${taperStepCount})'>Remove Taper Step</button>
    `;
    document.getElementById('taperScheduleDiv').appendChild(newDiv);

    // Automatically add the first dose-time pair
    addDoseTimePair(taperStepCount);
}


function addDoseTimePair(taperStepId) {
    let pairCount = document.querySelectorAll(`#taperStep${taperStepId} .doseTimePair`).length;
    let pairId = `doseTime${taperStepId}_${pairCount + 1}`;
    let newPairDiv = document.createElement('div');
    newPairDiv.className = 'doseTimePair';
    newPairDiv.id = pairId;
    newPairDiv.innerHTML = `
        <div class='input-group'>
            <label for='dose${pairId}'>Dose (mg):</label>
            <input type='number' id='dose${pairId}' class='doseInput'>
        </div>
        <div class='input-group'>
            <label for='time${pairId}'>Time of Day:</label>
            <select id='time${pairId}'>
                <option value="morning">Morning</option>
                <option value="midday">Midday</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
            </select>
        </div>
        <button type='button' onclick='removeDoseTimePair("${taperStepId}", "${pairId}")'>Remove Dose-Time</button>
    `;
    document.getElementById(`doseTimePairs${taperStepId}`).appendChild(newPairDiv);
}

function removeDoseTimePair(taperStepId, pairId) {
    let pairDiv = document.getElementById(pairId);
    pairDiv.parentNode.removeChild(pairDiv);
}





function removeTaperStep(stepNumber) {
    const element = document.getElementById(`taperStep${stepNumber}`);
    element.parentNode.removeChild(element);
    }

function calculate() {
    const tabletStrength = parseFloat(document.getElementById('tabletStrength').value);

    let isValid = true;
    let totalTablets = 0;
    let totalDuration = 0;
    let sigResults = []; // This will be an array of instruction sets for each duration

    for (let i = 1; i <= taperStepCount; i++) {
        const durationElement = document.getElementById(`duration${i}`);
        if (durationElement) {
            const duration = parseFloat(durationElement.value);
            if (isNaN(duration)) {
                isValid = false;
                break;
            }
            totalDuration += duration;

            let stepTablets = 0;
            let doseInstructions = [];
            let doseTimePairs = document.querySelectorAll(`#taperStep${i} .doseTimePair`);
            doseTimePairs.forEach(pair => {
                let doseInput = pair.querySelector('.doseInput');
                let timeSelect = pair.querySelector('select');

                const dose = parseFloat(doseInput.value);
                const time = timeSelect.value;

                if (isNaN(dose)) {
                    isValid = false;
                    return;
                }

                let tablets = dose / tabletStrength;
                stepTablets += tablets; // Accumulate tablets per dose-time pair
                doseInstructions.push(`${tablets} tablet(s) in the ${time}`);
            });

            totalTablets += stepTablets * duration; // Multiply by the duration to get the total for the step
            let combinedInstructions = `Take ${doseInstructions.join(' and ')}`;
            combinedInstructions += ` for ${duration} days`;
            sigResults.push(combinedInstructions);
        }
    }

    if (!isValid) {
        alert('Invalid input. Please check your taper schedule.');
        return;
    }

    let tabletsNeeded = Math.ceil(totalTablets); // Round up to the nearest whole tablet

    // Join the separate instructions into one Sig string, each separated by a semicolon
    let sigResult = sigResults.join('; ');

    document.getElementById('totalTablets').innerText = `${tabletsNeeded}`;
    document.getElementById('totalDuration').innerText = `${totalDuration}`;
    document.getElementById('sigResult').innerText = sigResult.trim(); // Set the sigResult text
}

    