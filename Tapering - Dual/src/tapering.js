
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
                                <label for='frequency${taperStepCount}'>Times per Day:</label>
                                <input type='number' id='frequency${taperStepCount}'>
                            </div>
                            <div class='input-group'>
                            <label for='duration${taperStepCount}'>Duration (days):</label>
                            <input type='number' id='duration${taperStepCount}'>
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
    newPairDiv.id = `doseTimePair${taperStepId}_${pairCount}`; // Set the correct ID for the div
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
    let pairDiv = document.getElementById(`doseTimePair${taperStepId}_${pairId}`); // Corrected to match the ID set on creation
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

    // Helper function to format the "Take" instruction
    function formatTakeInstruction(index) {
        return index === 0 ? "Take" : "then take";
    }

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
                let takeInstruction = formatTakeInstruction(sigResults.length);
                let combinedInstructions = `${takeInstruction} ${doseInstructions.join(' and ')}`;
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
                let takeInstruction = formatTakeInstruction(sigResults.length);
                let doseInstruction = `${takeInstruction} ${formatTablets(tabletsPerDose)} tablet(s) `;
                let frequencyInstruction = frequency === 1 ? 'once a day' : frequency === 2 ? 'twice a day' : `${frequency} times a day`;
                let durationInstruction = ` for ${duration} days`;
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

// New function to gather tapering data from the form
function gatherTaperingData() {
    let taperingData = [];

    for (let i = 1; i <= taperStepCount; i++) {
        if (currentVersion === 'timeDosePairs') {
            // Handle the time-dose pairs version
            let duration = document.getElementById(`duration${i}`).value;
            let doseTimePairsContainer = document.getElementById(`doseTimePairs${i}`);
            let doseTimePairs = doseTimePairsContainer.getElementsByClassName('doseTimePair');
            
            let pairsData = [];
            for (let pair of doseTimePairs) {
                let dose = pair.querySelector('.doseInput').value;
                let time = pair.querySelector('select').value;
                pairsData.push({ dose, time });
            }

            taperingData.push({ duration, pairsData });
        } else {
            // Handle the standard version
            let dose = document.getElementById(`dose${i}`).value;
            let frequency = document.getElementById(`frequency${i}`).value;
            let duration = document.getElementById(`duration${i}`).value;
            taperingData.push({ dose, frequency, duration });
        }
    }

    return taperingData;
}


// Utility function to format dates as DD-MM-YYYY
function formatDate(date) {
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth is zero-indexed
    let year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// New function to generate a schedule from tapering data
function generateSchedule(taperingData, startDate) {
    let schedule = [];
    let currentDate = new Date(startDate);

    taperingData.forEach((step) => {
        if (currentVersion === 'timeDosePairs') {
            // Handle the time-dose pairs version
            for (let i = 0; i < step.duration; i++) {
                step.pairsData.forEach((pair) => {
                    schedule.push({
                        date: formatDate(currentDate), // Use the formatDate function
                        dosage: pair.dose,
                        timeOfDay: pair.time
                    });
                });
                currentDate.setDate(currentDate.getDate() + 1); // increment the day
            }
        } else {
            // Handle the standard version
            for (let i = 0; i < step.duration; i++) {
                schedule.push({
                    date: formatDate(currentDate), // Use the formatDate function
                    dosage: step.dose,
                    frequency: step.frequency
                });
                currentDate.setDate(currentDate.getDate() + 1); // increment the day
            }
        }
    });

    return schedule;
}


// create a PDF of the schedule
function createPDF(schedule, medicationName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let title = 'Medication Schedule';
    if (medicationName) {
        title += ' for ' + medicationName;
    }

    doc.setFontSize(18);
    doc.text(title, 14, 22);

    doc.setFontSize(11);
    let yOffset = 30; // Initial Y-offset for the first line after the title

    schedule.forEach((entry, index) => {
        let scheduleText = '';
        if (currentVersion === 'timeDosePairs') {
            scheduleText = `${entry.date}: Take ${entry.dosage} mg in the ${entry.timeOfDay}`;
        } else {
            scheduleText = `${entry.date}: Take ${entry.dosage} mg ${entry.frequency} time(s) a day`;
        }

        // Check if we need to add a new page
        if (yOffset >= (doc.internal.pageSize.height - 10)) {
            doc.addPage();
            yOffset = 10; // Reset yOffset for the new page
        }

        doc.text(scheduleText, 14, yOffset);
        yOffset += 10; // Increase the Y-offset for the next line
    });

    // Save the created PDF
    doc.save('tapering_schedule.pdf');
}



// function to handle the PDF download
function calculateAndDownloadPDF() {
    // Check if the tablet strength is entered
    const tabletStrength = document.getElementById('tabletStrength').value;
    if (!tabletStrength) {
        alert("Please enter the tablet strength.");
        return;
    }

    // Get the medication name from the input field
    let medicationName = document.getElementById('medicationName').value.trim();

    // Read the start date from the date picker and validate it
    let startDateInput = document.getElementById('startDatePicker').value;
    if (!startDateInput) {
        alert("Please select a start date.");
        return;
    }

    let startDate = new Date(startDateInput);
    if (isNaN(startDate.getTime())) {
        alert("Invalid start date. Please select a valid date.");
        return;
    }

    // Generate the tapering data from the form inputs
    const taperingData = gatherTaperingData();
    // Generate the schedule using the user-selected start date
    const schedule = generateSchedule(taperingData, startDate);
    // Create and download the PDF with the schedule and the medication name
    createPDF(schedule, medicationName);
}

// Add event listener to the 'DOMContentLoaded' event to attach the PDF download handler
document.addEventListener('DOMContentLoaded', function() {
    const downloadButton = document.getElementById('downloadPDFButton');
    downloadButton.addEventListener('click', calculateAndDownloadPDF);
});
