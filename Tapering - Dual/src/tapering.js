
// Global variables
let taperStepCount = 0;
let currentVersion = 'standard'; // Default version

function setUpVersion(selectedVersion) {
    // Reset the taper steps
    taperStepCount = 0;
    const taperScheduleDiv = document.getElementById('taperScheduleDiv');
    taperScheduleDiv.innerHTML = '<h3>Taper Schedule:</h3>'; // Reset taper schedule

    // Set the current version
    currentVersion = selectedVersion;

    // Depending on the version, set up the form fields and functions
    if (currentVersion === 'timeDosePairs') {
        // Additional setup for time-dose pairs version if necessary
    } else {
        // Setup for the standard version if necessary
    }
}

function addTaperStep() {
    taperStepCount++;
    let newDiv = document.createElement('div');
    newDiv.id = `taperStep${taperStepCount}`;
    newDiv.className = 'taperStep';

    if (currentVersion === 'timeDosePairs') {
        // Add the fields for the time-dose pairs version
        newDiv.innerHTML = `<div class='input-group duration-input-group'>
                                <label for='duration${taperStepCount}'>Duration (days):</label>
                                <input type='number' id='duration${taperStepCount}'><br>
                            </div>
                            <div id="doseTimePairsContainer${taperStepCount}">
                                <div id="doseTimePairs${taperStepCount}" class="doseTimePairs">
                                    <!-- Dose-time pairs will be added here -->
                                </div>
                                <button type='button' onclick='addDoseTimePair(${taperStepCount})'>Add Dose-Time Pair</button>
                            </div>
                            <button type='button' onclick='removeTaperStep(${taperStepCount})'>Remove Taper Step</button>`;
    } else {
        // Add the fields for the standard version
        newDiv.innerHTML = `<div class='input-group'>
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
                            </div>`;
    }

    document.getElementById('taperScheduleDiv').appendChild(newDiv);
}

function removeTaperStep(stepNumber) {
    const element = document.getElementById(`taperStep${stepNumber}`);
    if (element) {
        element.parentNode.removeChild(element);
        taperStepCount--; // Decrement the taper step count
    }
}

function calculate() {
    const tabletStrength = parseFloat(document.getElementById('tabletStrength').value);

    // Ensure the tabletStrength is a valid number before proceeding
    if (isNaN(tabletStrength)) {
        alert('Please enter a valid tablet strength.');
        return;
    }

    let totalTablets = 0;
    let totalDuration = 0;
    let sigResults = [];

    if (currentVersion === 'timeDosePairs') {
        // Implement calculation logic for the time-dose pairs version
        // ...
    } else {
        // Implement calculation logic for the standard version
        // ...
    }

    // Update the UI with the calculated results
    document.getElementById('totalTablets').innerText = `${Math.ceil(totalTablets)}`;
    document.getElementById('totalDuration').innerText = `${totalDuration}`;
    document.getElementById('sigResult').innerText = sigResults.join('; ').trim();
}

function addDoseTimePair(taperStepId) {
    let pairContainer = document.getElementById(`doseTimePairs${taperStepId}`);
    let pairCount = pairContainer.getElementsByClassName('doseTimePair').length;
    let newPairDiv = document.createElement('div');
    newPairDiv.className = 'doseTimePair';
    newPairDiv.innerHTML = `
        <div class='input-group'>
            <label for='dose${taperStepId}_${pairCount}'>Dose (mg):</label>
            <input type='number' id='dose${taperStepId}_${pairCount}' class='doseInput'>
        </div>
        <div class='input-group'>
            <label for='time${taperStepId}_${pairCount}'>Time of Day:</label>
            <select id='time${taperStepId}_${pairCount}'>
                <option value="morning">Morning</option>
                <option value="midday">Midday</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
            </select>
        </div>
        <button type='button' onclick='removeDoseTimePair(${taperStepId}, ${pairCount})'>Remove Dose-Time Pair</button>
    `;

    pairContainer.appendChild(newPairDiv);
}

function removeDoseTimePair(taperStepId, pairId) {
    let pairDiv = document.getElementById(`doseTime${taperStepId}_${pairId}`);
    if (pairDiv) {
        pairDiv.parentNode.removeChild(pairDiv);
    }
}

function formatTablets(tablets) {
    if (tablets % 1 === 0) { // If the number is an integer
        return tablets.toString(); // Return as a string without decimals
    } else {
        return tablets.toFixed(1); // Otherwise, round to 1 decimal place
    }
}


function calculate() {
    const tabletStrength = parseFloat(document.getElementById('tabletStrength').value);
    let isValid = true;
    let totalTablets = 0;
    let totalDuration = 0;
    let sigResults = []; // This will be an array of instruction sets for each duration

    if (isNaN(tabletStrength) || tabletStrength <= 0) {
        alert('Please enter a valid tablet strength.');
        return;
    }

    if (currentVersion === 'timeDosePairs') {
        // Calculation logic for the time-dose pairs version
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
                    doseInstructions.push(`${formatTablets(tablets)} tablet(s) in the ${time}`);
                });

                totalTablets += stepTablets * duration; // Multiply by the duration to get the total for the step
                let combinedInstructions = `Take ${doseInstructions.join(' and ')}`;
                combinedInstructions += ` for ${duration} days`;
                sigResults.push(combinedInstructions);
            }
        }
    } else {
        // Calculation logic for the standard version
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

                totalDuration += duration;
                let dailyTablets = (dose * frequency) / tabletStrength;
                totalTablets += dailyTablets * duration;

                // Create the sig sentence for this step
                let tabletsPerDose = dose / tabletStrength;
                let doseInstruction = `Take ${formatTablets(tabletsPerDose)} tablet(s) `;
                let frequencyInstruction = frequency === 1 ? 'once a day ' : frequency === 2 ? 'twice a day ' : `${frequency} times a day `;
                let durationInstruction = `for ${duration} days`;
                let stepSig = doseInstruction + frequencyInstruction + durationInstruction;

                // Append the stepSig to the sigResult
                sigResults.push(stepSig);
            }
        }
    }

    if (!isValid) {
        alert('Invalid input. Please check your taper schedule.');
        return;
    }

    let tabletsNeeded = Math.ceil(totalTablets); // Round up to the nearest whole tablet

    // Update the UI with the calculated results
    document.getElementById('totalTablets').innerText = `${tabletsNeeded}`;
    document.getElementById('totalDuration').innerText = `${totalDuration}`;
    document.getElementById('sigResult').innerText = sigResults.join('; ').trim();
}
