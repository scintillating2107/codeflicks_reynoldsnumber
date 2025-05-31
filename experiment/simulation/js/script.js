// Fluid properties database
const fluidProperties = {
    water: {
        density: 1000,    // kg/m³
        viscosity: 0.001  // Pa·s
    },
    oil: {
        density: 900,     // kg/m³
        viscosity: 0.0012 // Pa·s
    },
    air: {
        density: 800,     // kg/m³ (adjusted to fit range)
        viscosity: 0.0008 // Pa·s (adjusted to fit range)
    }
};

// Global array to store recorded data
const recordedData = [];

// DOM Elements
const fluidTypeSelect = document.getElementById('fluid-type');
const customProperties = document.getElementById('custom-properties');
const calculateBtn = document.getElementById('calculate-btn');
const recordBtn = document.getElementById('record-btn');
const exportBtn = document.getElementById('export-btn');
const resetBtn = document.getElementById('reset-btn');
const reynoldsNumber = document.getElementById('reynolds-number');
const flowType = document.getElementById('flow-type');
const flowAnimation = document.getElementById('flow-animation');

// Welcome Screen Elements
const welcomeScreen = document.getElementById('welcome-screen');
const simulationContent = document.getElementById('simulation-content');
const startButton = document.getElementById('start-btn');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing simulator...'); // Debug log
    
    // Get all required elements
    const recordBtn = document.getElementById('record-btn');
    
    if (!recordBtn) {
        console.error('Record button not found!');
        return;
    }

    // Add event listeners
    fluidTypeSelect.addEventListener('change', handleFluidTypeChange);
    calculateBtn.addEventListener('click', calculateReynoldsNumber);
    recordBtn.addEventListener('click', recordCurrentData);
    exportBtn.addEventListener('click', exportToPDF);
    resetBtn.addEventListener('click', resetSimulation);
    
    // Initially disable record button
    recordBtn.disabled = true;
    console.log('Record button initially disabled'); // Debug log
    
    // Initialize the simulator
    handleFluidTypeChange();
    initializePlotly();
});

// Theme-aware colors
function getThemeColors() {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        background: isDarkMode ? '#1E1E1E' : '#FFFFFF',
        text: isDarkMode ? '#E0E0E0' : '#2C3E50',
        grid: isDarkMode ? '#333333' : '#E0E0E0',
        laminar: isDarkMode ? '#81C784' : '#4CAF50',
        transitional: isDarkMode ? '#FFD54F' : '#FFC107',
        turbulent: isDarkMode ? '#E57373' : '#F44336'
    };
}

// Initialize Plotly.js elements
function initializePlotly() {
    const colors = getThemeColors();

    // Initialize flow animation
    const flowTrace = {
        type: 'scatter',
        mode: 'lines',
        line: {
            width: 2,
            color: colors.text
        }
    };

    const flowLayout = {
        title: {
            text: '',
            font: {
                color: colors.text
            }
        },
        showlegend: false,
        paper_bgcolor: colors.background,
        plot_bgcolor: colors.background,
        margin: { t: 30, l: 30, r: 30, b: 30 },
        xaxis: { 
            showgrid: false, 
            zeroline: false, 
            showticklabels: false,
            color: colors.text
        },
        yaxis: { 
            showgrid: false, 
            zeroline: false, 
            showticklabels: false,
            color: colors.text
        },
        autosize: true
    };

    const config = {
        displayModeBar: false,    // This removes the toolbar
        responsive: true,
        useResizeHandler: true,
        autosize: true
    };

    Plotly.newPlot('flow-animation', [flowTrace], flowLayout, config);

    // Add window resize event listener
    window.addEventListener('resize', () => {
        Plotly.Plots.resize('flow-animation');
    });
}

function updateVisualization(Re) {
    const colors = getThemeColors();
    const numPoints = 100;
    let frameCount = 0;
    
    // Create base arrays for x and y coordinates
    const x = Array.from({length: numPoints}, (_, i) => i);
    let y = new Array(numPoints).fill(0);
    
    // Cancel any existing animation frame
    if (window.animationFrameId) {
        cancelAnimationFrame(window.animationFrameId);
    }
    
    // Different animation patterns based on Reynolds number
    function animate() {
        frameCount++;
        
        if (Re < 2000) {
            // Laminar flow - Straight horizontal lines
            y = x.map(() => {
                // Create 3 parallel straight lines
                const lineSpacing = 0.5;
                const line1 = 0.8;  // Top line
                const line2 = 0;    // Middle line
                const line3 = -0.8; // Bottom line
                
                // Alternate between the three lines based on x position
                if (frameCount % 300 < 100) return line1;
                if (frameCount % 300 < 200) return line2;
                return line3;
            });
        } 
        else if (Re > 4000) {
            // Turbulent flow - Shaky sine wave
            y = x.map(val => {
                const baseWave = Math.sin(val * 0.1 + frameCount * 0.05) * 0.6;
                const shake = (Math.random() - 0.5) * 1.0;
                return baseWave + shake;
            });
        } 
        else {
            // Transitional flow - Pure sine wave
            y = x.map(val => 
                Math.sin(val * 0.1 + frameCount * 0.05) * 0.8
            );
        }

        // Update the plot with new y values
        Plotly.animate('flow-animation', {
            data: [{
                x: x,
                y: y
            }],
            traces: [0],
            layout: {}
        }, {
            transition: {
                duration: 0
            },
            frame: {
                duration: 0,
                redraw: false
            }
        });

        window.animationFrameId = requestAnimationFrame(animate);
    }

    // Initialize flow animation with a clean slate
    const flowTrace = {
        type: 'scatter',
        mode: 'lines',
        line: {
            width: 3,
            color: colors.text
        },
        x: x,
        y: y
    };

    const flowLayout = {
        title: {
            text: '',
            font: {
                color: colors.text
            }
        },
        showlegend: false,
        paper_bgcolor: colors.background,
        plot_bgcolor: colors.background,
        margin: { t: 30, l: 30, r: 30, b: 30 },
        xaxis: { 
            showgrid: false, 
            zeroline: false, 
            showticklabels: false,
            color: colors.text,
            range: [0, numPoints]
        },
        yaxis: { 
            showgrid: false, 
            zeroline: false, 
            showticklabels: false,
            color: colors.text,
            range: [-1.5, 1.5]
        }
    };

    const config = {
        displayModeBar: false,
        responsive: true
    };

    // Clear existing plot and create new one
    Plotly.purge('flow-animation');
    Plotly.newPlot('flow-animation', [flowTrace], flowLayout, config)
        .then(() => {
            // Start animation after plot is created
            animate();
        });
}

// Theme change observer
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
            initializePlotly();
            const Re = parseFloat(reynoldsNumber.querySelector('.value').textContent);
            if (!isNaN(Re)) {
                updateVisualization(Re);
            }
        }
    });
});

observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
});

// Start button click handler
startButton.addEventListener('click', () => {
    welcomeScreen.classList.add('hidden');
    simulationContent.classList.remove('hidden');
});

function handleFluidTypeChange() {
    const selectedFluid = fluidTypeSelect.value;
    customProperties.classList.toggle('hidden', selectedFluid !== 'custom');
    
    if (selectedFluid !== 'custom') {
        const properties = fluidProperties[selectedFluid];
        document.getElementById('density').value = properties.density;
        document.getElementById('viscosity').value = properties.viscosity;
    }
}

function calculateReynoldsNumber() {
    console.log('Calculating Reynolds number...'); // Debug log
    
    // Get input values
    const diameter = parseFloat(document.getElementById('diameter').value);
    const velocity = parseFloat(document.getElementById('velocity').value);
    const selectedFluid = fluidTypeSelect.value;
    
    let density, viscosity;
    if (selectedFluid === 'custom') {
        density = parseFloat(document.getElementById('density').value);
        viscosity = parseFloat(document.getElementById('viscosity').value);
    } else {
        const properties = fluidProperties[selectedFluid];
        density = properties.density;
        viscosity = properties.viscosity;
    }

    // Validate inputs
    if (isNaN(diameter) || isNaN(velocity) || isNaN(density) || isNaN(viscosity)) {
        alert('Please enter valid numbers for all fields');
        return;
    }

    // Calculate Reynolds number
    const Re = (density * velocity * diameter) / viscosity;
    console.log('Reynolds number calculated:', Re); // Debug log
    
    // Update results
    displayResults(Re);
    updateVisualization(Re);
    
    // Double-check that the button is enabled
    setTimeout(() => {
        const recordBtn = document.getElementById('record-btn');
        if (recordBtn.disabled) {
            console.log('Forcing record button enable'); // Debug log
            recordBtn.disabled = false;
        }
    }, 100);
}

function displayResults(Re) {
    console.log('Displaying results for Re:', Re); // Debug log
    
    reynoldsNumber.querySelector('.value').textContent = Re.toFixed(2);
    
    const flowTypeValue = flowType.querySelector('.value');
    let flowClass = '';
    let flowText = '';
    
    if (Re < 2000) {
        flowClass = 'laminar';
        flowText = 'Laminar Flow';
    } else if (Re > 4000) {
        flowClass = 'turbulent';
        flowText = 'Turbulent Flow';
    } else {
        flowClass = 'transitional';
        flowText = 'Transitional Flow';
    }
    
    flowTypeValue.className = 'value ' + flowClass;
    flowTypeValue.textContent = flowText;

    // Enable record button after results are displayed
    document.getElementById('record-btn').disabled = false;
    console.log('Record button enabled in displayResults'); // Debug log
}

function recordCurrentData() {
    console.log('Recording data...'); // Debug log
    
    // Get current values
    const diameter = parseFloat(document.getElementById('diameter').value);
    const velocity = parseFloat(document.getElementById('velocity').value);
    const selectedFluid = fluidTypeSelect.value;
    
    let density, viscosity;
    if (selectedFluid === 'custom') {
        density = parseFloat(document.getElementById('density').value);
        viscosity = parseFloat(document.getElementById('viscosity').value);
    } else {
        const properties = fluidProperties[selectedFluid];
        density = properties.density;
        viscosity = properties.viscosity;
    }

    // Calculate Reynolds number
    const Re = (density * velocity * diameter) / viscosity;
    
    // Determine flow pattern
    let flowPattern = '';
    if (Re < 2000) flowPattern = 'Laminar';
    else if (Re > 4000) flowPattern = 'Turbulent';
    else flowPattern = 'Transitional';

    // Create data point
    const dataPoint = {
        timestamp: new Date().toLocaleString(),
        fluid: selectedFluid,
        diameter: diameter.toFixed(3),
        velocity: velocity.toFixed(2),
        density: density.toFixed(2),
        viscosity: viscosity.toFixed(6),
        reynoldsNumber: Re.toFixed(2),
        flowPattern: flowPattern
    };

    // Add to recorded data
    recordedData.push(dataPoint);
    console.log('Data recorded:', dataPoint); // Debug log
    
    // Update UI
    updateRecordCount();
    displayRecordedData();
}

function updateRecordCount() {
    const recordCount = document.getElementById('record-count');
    if (recordCount) {
        recordCount.textContent = `Recorded Data Points: ${recordedData.length}`;
        console.log('Updated record count:', recordedData.length); // Debug log
    }
}

function displayRecordedData() {
    console.log('Displaying recorded data...'); // Debug log
    
    // Create or get table container
    let tableContainer = document.getElementById('data-table-container');
    if (!tableContainer) {
        tableContainer = document.createElement('div');
        tableContainer.id = 'data-table-container';
        tableContainer.style.marginTop = '20px';
        tableContainer.style.overflowX = 'auto';
        
        const resultsSection = document.querySelector('.results-section');
        resultsSection.appendChild(tableContainer);
    }

    // Create table HTML
    const tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Fluid</th>
                    <th>Diameter (m)</th>
                    <th>Velocity (m/s)</th>
                    <th>Density (kg/m³)</th>
                    <th>Viscosity (Pa·s)</th>
                    <th>Re</th>
                    <th>Flow Type</th>
                </tr>
            </thead>
            <tbody>
                ${recordedData.map(data => `
                    <tr>
                        <td>${data.timestamp}</td>
                        <td>${data.fluid}</td>
                        <td>${data.diameter}</td>
                        <td>${data.velocity}</td>
                        <td>${data.density}</td>
                        <td>${data.viscosity}</td>
                        <td>${data.reynoldsNumber}</td>
                        <td class="${data.flowPattern.toLowerCase()}">${data.flowPattern}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    tableContainer.innerHTML = tableHTML;
    console.log('Table updated with', recordedData.length, 'rows'); // Debug log
}

function exportToPDF() {
    if (recordedData.length === 0) {
        alert('No data recorded yet. Please record some data first.');
        return;
    }

    // Create PDF document
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text('Reynolds Number Experiment Results', 15, 15);
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 25);

    // Define the table columns
    const headers = [
        ['Time', 'Fluid', 'Diameter (m)', 'Velocity (m/s)', 
         'Density (kg/m³)', 'Viscosity (Pa·s)', 'Re', 'Flow Type']
    ];

    // Prepare the data
    const data = recordedData.map(record => [
        record.timestamp,
        record.fluid,
        record.diameter,
        record.velocity,
        record.density,
        record.viscosity,
        record.reynoldsNumber,
        record.flowPattern
    ]);

    // Create the table
    doc.autoTable({
        head: headers,
        body: data,
        startY: 35,
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        headStyles: {
            fillColor: [33, 150, 243],
            textColor: 255
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        }
    });

    // Save the PDF
    doc.save('reynolds-number-results.pdf');
}

function resetSimulation() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to reset? This will clear all recorded data.')) {
        // Disable record button before reload
        recordBtn.disabled = true;
        location.reload();
    }
}

// Initialize the simulator
function initializeSimulator() {
    handleFluidTypeChange();
    initializePlotly();
    
    // Add event listeners for new buttons
    document.getElementById('record-btn').addEventListener('click', recordCurrentData);
    document.getElementById('export-btn').addEventListener('click', exportToPDF);
    
    // Initially disable record button
    document.getElementById('record-btn').disabled = true;
}

// Call initialize function when document is ready
document.addEventListener('DOMContentLoaded', initializeSimulator); 