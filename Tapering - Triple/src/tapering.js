
// Global variables
let taperStepCount = 0;
let currentVersion = 'standard'; // Default version

function setUpVersion(selectedVersion) {
    // Reset the taper steps
    taperStepCount = 0;
    const taperScheduleDiv = document.getElementById('taperScheduleDiv');
    taperScheduleDiv.innerHTML = '<h3>Taper Schedule:</h3>';
    currentVersion = selectedVersion;

    const tabletStrengthContainer = document.getElementById('tabletStrengthContainer');


    if (currentVersion === 'variableStrength') {
        tabletStrengthContainer.style.display = 'none'; // Hide the tablet strength input field
    } else {
        tabletStrengthContainer.style.display = ''; // Show the tablet strength input field
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
    } else if (currentVersion === 'variableStrength') {
        newDiv.innerHTML = `<div class='input-group'>
                        <label for='stepStrength${taperStepCount}'>Tablet Strength (mg):</label>
                        <input type='number' id='stepStrength${taperStepCount}' class='stepStrengthInput'>
                    </div>
                    <div class='input-group'>
                        <label for='dose${taperStepCount}'>Dose (mg):</label>
                        <input type='number' id='dose${taperStepCount}' class='doseInput'>
                    </div>
                    <div class='input-group'>
                        <label for='frequency${taperStepCount}'>Times per Day:</label>
                        <input type='number' id='frequency${taperStepCount}' class='frequencyInput'>
                    </div>
                    <div class='input-group'>
                        <label for='duration${taperStepCount}'>Duration (days):</label>
                        <input type='number' id='duration${taperStepCount}' class='durationInput'>
                    </div>
                    <div class='input-group removeButtonContainer'>
                        <button type='button' onclick='removeTaperStep(${taperStepCount})'>Remove</button>
                    </div>`;
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
    let isValid = true;
    let totalTabletsPerStrength = {}; // Object to store total tablets per strength
    let totalTablets = 0;
    let totalDuration = 0;
    let sigResults = []; // This will be an array of instruction sets for each duration

    // Helper function to format the "Take" instruction
    function formatTakeInstruction(index) {
        return index === 0 ? "Take" : "then take";
    }


    // Skip the tablet strength check if the current version is 'variableStrength'
    let tabletStrength = 1; // Default value to bypass the check

    if (currentVersion !== 'variableStrength') {
        tabletStrength = parseFloat(document.getElementById('tabletStrength').value);
        if (isNaN(tabletStrength) || tabletStrength <= 0) {
            alert('Please enter a valid tablet strength.');
            return;
        }
    }
    

    if (currentVersion === 'variableStrength') {
        for (let i = 1; i <= taperStepCount; i++) {
            const strengthElement = document.getElementById(`stepStrength${i}`);
            const doseElement = document.getElementById(`dose${i}`);
            const frequencyElement = document.getElementById(`frequency${i}`);
            const durationElement = document.getElementById(`duration${i}`);
    
            if (strengthElement && doseElement && frequencyElement && durationElement) {
                const strength = parseFloat(strengthElement.value);
                const dose = parseFloat(doseElement.value);
                const frequency = parseFloat(frequencyElement.value);
                const duration = parseFloat(durationElement.value);
    
                if (isNaN(strength) || isNaN(dose) || isNaN(frequency) || isNaN(duration)) {
                    isValid = false;
                    break;
                }
    
                totalDuration += duration;
                let dailyTablets = (dose * frequency) / strength;
                totalTabletsPerStrength[strength] = (totalTabletsPerStrength[strength] || 0) + dailyTablets * duration;
    
                let takeInstruction = formatTakeInstruction(sigResults.length);
                let tabletsPerDose = dose / strength;
                let doseInstruction = `${takeInstruction} ${numberToWords(Math.ceil(tabletsPerDose))} ${strength}mg tablet(s) `;
                let frequencyInstruction = frequency === 1 ? 'once a day' : frequency === 2 ? 'twice a day' : `${numberToWords(frequency)} times a day`;
                let durationInstruction = ` for ${duration} days`;
                let stepSig = doseInstruction + frequencyInstruction + durationInstruction;
                sigResults.push(stepSig);
            }
        }
    } else if (currentVersion === 'timeDosePairs') {
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

    if (currentVersion === 'variableStrength') {
        let totalTabletsDisplay = '';
        for (const [strength, tablets] of Object.entries(totalTabletsPerStrength)) {
            let roundedTablets = Math.ceil(tablets); // Round up to the nearest whole tablet
            totalTabletsDisplay += `${roundedTablets} tablet(s) of ${strength}mg; `;
        }
        document.getElementById('totalTablets').innerText = totalTabletsDisplay.slice(0, -2); // Remove the last "; "
    } else {
        document.getElementById('totalTablets').innerText = `${tabletsNeeded}`;
    }

    document.getElementById('totalDuration').innerText = `${totalDuration}`;
    document.getElementById('sigResult').innerText = sigResults.join('; ').trim();
}

// New function to gather tapering data from the form
function gatherTaperingData() {
    let taperingData = [];

    for (let i = 1; i <= taperStepCount; i++) {
        if (currentVersion === 'variableStrength') {
            let strength = document.getElementById(`stepStrength${i}`).value;
            let dose = document.getElementById(`dose${i}`).value;
            let frequency = document.getElementById(`frequency${i}`).value;
            let duration = document.getElementById(`duration${i}`).value;
            taperingData.push({ strength, dose, frequency, duration });
        } else if (currentVersion === 'timeDosePairs') {
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


// Helper function to convert number to words for 1 to 10
function numberToWords(num) {
    const numWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    return numWords[num] || num.toString();
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
        if (currentVersion === 'variableStrength') {
            for (let i = 0; i < step.duration; i++) {
                let tabletCount = Math.ceil(step.dose / step.strength);
                let tabletWord = tabletCount > 1 ? 'tablets' : 'tablet';
                let tabletDescription = `${tabletCount} x ${step.strength}mg ${tabletWord}`;
                let dosageDescription = `${step.dose}mg (${tabletDescription})`;
                // Do not append "/day" here, handle it in the createPDF function
                let frequencyDescription = `${step.frequency} ${step.frequency > 1 ? 'times' : 'time'}`; 

                schedule.push({
                    date: formatDate(currentDate),
                    dosage: dosageDescription,
                    frequency: frequencyDescription
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
        } else if (currentVersion === 'timeDosePairs') {
            // Assume `tabletStrength` is available and is applicable for each dose
            let tabletStrengthValue = Number(tabletStrength.value); // This needs to be defined appropriately
        
            for (let i = 0; i < step.duration; i++) {
                step.pairsData.forEach((pair) => {
                    let tabletCount = Math.ceil(pair.dose / tabletStrengthValue);
                    let tabletWord = tabletCount > 1 ? 'tablets' : 'tablet';
                    let tabletDescription = `${tabletCount} x ${tabletStrengthValue}mg ${tabletWord}`;
                    let dosageDescription = `${pair.dose}mg (${tabletDescription})`;
        
                    schedule.push({
                        date: formatDate(currentDate),
                        dosage: dosageDescription,
                        timeOfDay: pair.time
                    });
                });
                currentDate.setDate(currentDate.getDate() + 1); // Increment the day
            }
        } else {
            // Handle the standard version
            for (let i = 0; i < step.duration; i++) {
                let tabletStrengthValue = Number(tabletStrength.value); 
                let tabletCount = Math.ceil(step.dose / tabletStrengthValue);
                let tabletWord = tabletCount > 1 ? 'tablets' : 'tablet';
                let tabletDescription = `${tabletCount} x ${tabletStrengthValue}mg ${tabletWord}`;
                let dosageDescription = `${step.dose}mg (${tabletDescription})`;
                let frequencyDescription = `${step.frequency} ${step.frequency > 1 ? 'times' : 'time'}`;
            
                schedule.push({
                    date: formatDate(currentDate),
                    dosage: dosageDescription,
                    frequency: frequencyDescription // "per day" will be handled in createPDF function
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
    });

    return schedule;
}


// create a PDF of the schedule
function createPDF(schedule, medicationName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Constants for layout
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const lineHeight = 10;
    const headerHeight = 22;
    let yOffset = 30; // Initial Y-offset for the first line after the title

    // Column positions
    const dateColX = margin;
    const doseColX = pageWidth / 3; // One-third of the way across the page
    const timeOfDayColX = (2 * pageWidth) / 3; // Two-thirds of the way across the page

    // Set the font for the entire document
    doc.setFont('Helvetica', '');

    // Function to add headers
    const addHeaders = () => {
        doc.setFontSize(18);
        const scheduleText = 'Medication Schedule';
        doc.text(scheduleText, margin, headerHeight);
        
        if (medicationName) {
            const padding = 5;
            const scheduleWidth = doc.getTextWidth(scheduleText) + padding;
            const forXPosition = margin + scheduleWidth;
            doc.setFontSize(14);
            const forTextWidth = doc.getTextWidth(`for ${medicationName}`);
            if (forXPosition + forTextWidth <= pageWidth - margin) {
                // If it fits, draw 'for ...' text
                doc.text(`for ${medicationName}`, forXPosition, headerHeight);
            } else {
                // If it doesn't fit, reduce font size or split into two lines
                while (doc.getTextWidth(`for ${medicationName}`) + forXPosition > pageWidth - margin) {
                    doc.setFontSize(doc.getFontSize() - 1);
                }
                doc.text(`for ${medicationName}`, forXPosition, headerHeight);
                doc.setFontSize(11);
            }
        }
        // Set font size back to 11 for the rest of the header
        doc.setFontSize(11);
    };

    // Function to add footers
    const addFooters = () => {
        doc.setFontSize(10);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - margin, pageHeight - margin);
    };

    // Function to check and add new page if needed
    const checkAddNewPage = () => {
        if (yOffset >= (pageHeight - margin)) {
            doc.addPage();
            yOffset = margin;
            addHeaders();
            addFooters();
        }
    };

    // Add headers to the first page
    addHeaders();

    // Add column headers
    doc.setFontSize(12);
    doc.text('Date', dateColX, yOffset);
    doc.text('Dose (mg)', doseColX, yOffset);
    // Change the third column based on the calculator version
    if (currentVersion === 'timeDosePairs') {
        doc.text('Time of Day', timeOfDayColX, yOffset);
    } else {
        doc.text('Times per Day', timeOfDayColX, yOffset);
    }

    yOffset += lineHeight; // Move down one line

    doc.setFontSize(11); // Reset font size for entries

    let previousDate = ""; // Keep track of the date we're on
    let colorFlip = false; // Used to flip the color for each day

    // Add the schedule entries
    schedule.forEach((entry, index) => {
        // Apply the alternating background color
        if (index % 2 === 0) { // Color every other line for better readability
            doc.setFillColor(240, 240, 240); // Light grey
            doc.rect(margin, yOffset, pageWidth - (2 * margin), lineHeight, 'F');
        }
    
        // Add the date and dose in separate columns
        doc.text(entry.date, dateColX, yOffset + lineHeight / 2);
    
        // Calculate the dose text, which includes the dosage and the number of tablets
        let doseText;
        if (currentVersion === 'variableStrength') {
            doseText = entry.dosage; // `entry.dosage` already includes all the necessary information
        } else if (currentVersion === 'standard') {
            doseText = entry.dosage; // Do not append 'mg' for the standard version, as it's already included
        } else {
            // Append 'mg' for the other versions, if necessary
            doseText = `${entry.dosage}`;
        }        
    
        doc.text(doseText, doseColX, yOffset + lineHeight / 2);
    
        // For the timeDosePairs version, add the time of day
        if (currentVersion === 'timeDosePairs') {
            doc.text(entry.timeOfDay, timeOfDayColX, yOffset + lineHeight / 2);
        } else {
            // For standard and variableStrength, add the frequency (times per day)
            let frequencyText = currentVersion === 'variableStrength' || currentVersion === 'standard' ?
            `${entry.frequency} per day` : // For these versions, just append 'per day'
            entry.frequency; // For timeDosePairs, use the existing frequency text

            doc.text(frequencyText, timeOfDayColX, yOffset + lineHeight / 2);
        }
    
        // Increment the Y-offset for the next line
        yOffset += lineHeight;
    
        // Check if a new page is needed
        if (yOffset >= pageHeight - margin) {
            doc.addPage();
            yOffset = margin + headerHeight; // Reset Y-offset for new page
            // Re-add headers for new page
            doc.setFontSize(12);
            doc.text('Date', dateColX, yOffset);
            doc.text('Dose (mg)', doseColX, yOffset);
            if (currentVersion === 'timeDosePairs') {
                doc.text('Time of Day', timeOfDayColX, yOffset);
            } else {
                doc.text('Times per Day', timeOfDayColX, yOffset);
            }
            yOffset += lineHeight; // Move down one line after headers
        }
    });

    // Add footers to the last page
    addFooters();

    // Save the created PDF
    doc.save('tapering_schedule.pdf');
}



// function to handle the PDF download
function calculateAndDownloadPDF() {
    // Check if the tablet strength is entered only if not in variableStrength version
    if (currentVersion !== 'variableStrength') {
        const tabletStrength = document.getElementById('tabletStrength').value;
        if (!tabletStrength) {
            alert("Please enter the tablet strength.");
            return;
        }
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
