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

// Global variables for visualization mode
let currentMode = '2d';
let currentReynolds = null;

// DOM Elements - will be assigned after DOM loads
let fluidTypeSelect, customProperties, calculateBtn, recordBtn, exportBtn, resetBtn;
let reynoldsNumber, flowType, flowAnimation;
let welcomeScreen, simulationContent, startButton;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing simulator...'); // Debug log
    
    // Get all required DOM elements after DOM is loaded
    fluidTypeSelect = document.getElementById('fluid-type');
    customProperties = document.getElementById('custom-properties');
    calculateBtn = document.getElementById('calculate-btn');
    recordBtn = document.getElementById('record-btn');
    exportBtn = document.getElementById('export-btn');
    resetBtn = document.getElementById('reset-btn');
    reynoldsNumber = document.getElementById('reynolds-number');
    flowType = document.getElementById('flow-type');
    flowAnimation = document.getElementById('flow-animation');
    
    // Welcome Screen Elements
    welcomeScreen = document.getElementById('welcome-screen');
    simulationContent = document.getElementById('simulation-content');
    startButton = document.getElementById('start-btn');
    
    // Check if all elements exist
    if (!recordBtn || !startButton || !welcomeScreen || !simulationContent) {
        console.error('Required elements not found!');
        return;
    }

    // Add event listeners
    fluidTypeSelect.addEventListener('change', handleFluidTypeChange);
    calculateBtn.addEventListener('click', calculateReynoldsNumber);
    recordBtn.addEventListener('click', recordCurrentData);
    exportBtn.addEventListener('click', exportToPDF);
    resetBtn.addEventListener('click', resetSimulation);
    
    // Add start button event listener
    startButton.addEventListener('click', () => {
        console.log('Start button clicked!'); // Debug log
        welcomeScreen.classList.add('hidden');
        simulationContent.classList.remove('hidden');
    });
    
    // Add mode toggle event listeners
    setupModeToggle();
    
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
    
    // Store Reynolds number globally
    currentReynolds = Re;
    
    // Update results
    displayResults(Re);
    
    // Show visualization and default to 2D waveform
    showFlowVisualization();
    
    // Reset to 2D mode
    currentMode = '2d';
    const modeToggles = document.querySelectorAll('.mode-toggle');
    modeToggles.forEach(toggle => {
        toggle.classList.toggle('active', toggle.dataset.mode === '2d');
    });
    
    // Show 2D view by default
    const waveformView = document.getElementById('waveform-view');
    const threeDView = document.getElementById('3d-view');
    waveformView.classList.add('active');
    threeDView.classList.remove('active');
    
    // Initialize 2D visualization
    updateVisualization(Re);
    updateCurrentPattern(Re);
    
    // Double-check that the button is enabled
    setTimeout(() => {
        const recordBtn = document.getElementById('record-btn');
        if (recordBtn.disabled) {
            console.log('Forcing record button enable'); // Debug log
            recordBtn.disabled = false;
        }
    }, 100);
}

// Function to show the 3D visualization after calculation
function showFlowVisualization() {
    const placeholder = document.getElementById('visualization-placeholder');
    const flowVisualization = document.getElementById('flow-visualization');
    
    if (placeholder && flowVisualization) {
        // Hide placeholder with fade out
        placeholder.style.transition = 'opacity 0.3s ease-out';
        placeholder.style.opacity = '0';
        
        setTimeout(() => {
            placeholder.style.display = 'none';
            flowVisualization.classList.remove('hidden');
            
            // Trigger reflow for animation
            setTimeout(() => {
                flowVisualization.style.opacity = '1';
            }, 50);
        }, 300);
    }
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
        // Hide visualization and show placeholder
        hideFlowVisualization();
        
        // Reset visualization mode variables
        currentMode = '2d';
        currentReynolds = null;
        
        // Reset all form values
        document.getElementById('diameter').value = '0.05';
        document.getElementById('velocity').value = '1.5';
        document.getElementById('fluid-type').value = 'water';
        
        // Reset results
        reynoldsNumber.querySelector('.value').textContent = '-';
        flowType.querySelector('.value').textContent = '-';
        flowType.querySelector('.value').className = 'value';
        
        // Reset current pattern display
        const patternElement = document.getElementById('current-pattern');
        if (patternElement) {
            patternElement.textContent = '-';
            patternElement.className = '';
        }
        
        // Clear recorded data
        recordedData.length = 0;
        updateRecordCount();
        
        // Remove data table if it exists
        const tableContainer = document.getElementById('data-table-container');
        if (tableContainer) {
            tableContainer.remove();
        }
        
        // Disable record button
        document.getElementById('record-btn').disabled = true;
        
        // Handle fluid type change to reset custom properties
        handleFluidTypeChange();
        
        // Clear any existing animation
        if (window.animationFrameId) {
            cancelAnimationFrame(window.animationFrameId);
        }
        
        // Reinitialize Plotly
        initializePlotly();
    }
}

// Function to hide the 3D visualization and show placeholder
function hideFlowVisualization() {
    const placeholder = document.getElementById('visualization-placeholder');
    const flowVisualization = document.getElementById('flow-visualization');
    
    if (placeholder && flowVisualization) {
        // Hide 3D visualization
        flowVisualization.classList.add('hidden');
        
        // Show placeholder with fade in
        placeholder.style.display = 'block';
        placeholder.style.opacity = '0';
        
        setTimeout(() => {
            placeholder.style.transition = 'opacity 0.3s ease-in';
            placeholder.style.opacity = '1';
        }, 50);
    }
}

// Setup mode toggle functionality
function setupModeToggle() {
    const modeToggles = document.querySelectorAll('.mode-toggle');
    
    modeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const mode = toggle.dataset.mode;
            switchVisualizationMode(mode);
        });
    });
    
    // Setup 2D animation controls
    const pause2DBtn = document.getElementById('pause-2d-btn');
    const restart2DBtn = document.getElementById('restart-2d-btn');
    
    if (pause2DBtn) {
        pause2DBtn.addEventListener('click', toggle2DAnimation);
    }
    
    if (restart2DBtn) {
        restart2DBtn.addEventListener('click', restart2DAnimation);
    }
}

// Switch between visualization modes
function switchVisualizationMode(mode) {
    currentMode = mode;
    
    // Update toggle buttons
    const modeToggles = document.querySelectorAll('.mode-toggle');
    modeToggles.forEach(toggle => {
        toggle.classList.toggle('active', toggle.dataset.mode === mode);
    });
    
    // Update view containers
    const waveformView = document.getElementById('waveform-view');
    const threeDView = document.getElementById('3d-view');
    
    if (mode === '2d') {
        waveformView.classList.add('active');
        threeDView.classList.remove('active');
        
        // Initialize or update 2D visualization
        if (currentReynolds !== null) {
            updateVisualization(currentReynolds);
            updateCurrentPattern(currentReynolds);
        }
    } else if (mode === '3d') {
        waveformView.classList.remove('active');
        threeDView.classList.add('active');
        
        // Initialize and update 3D visualization
        if (currentReynolds !== null) {
            // Initialize 3D visualization if not already done
            if (typeof initialize3DVisualization === 'function') {
                initialize3DVisualization();
            }
            
            // Update 3D flow profile
            if (typeof update3DFlowProfile === 'function') {
                setTimeout(() => {
                    update3DFlowProfile();
                }, 100); // Small delay to ensure container is visible
            } else if (typeof updateFlowProfile === 'function') {
                setTimeout(() => {
                    updateFlowProfile();
                }, 100);
            }
        }
    }
}

// Toggle 2D animation
function toggle2DAnimation() {
    const pauseBtn = document.getElementById('pause-2d-btn');
    
    if (window.animationFrameId) {
        cancelAnimationFrame(window.animationFrameId);
        window.animationFrameId = null;
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
    } else {
        if (currentReynolds !== null) {
            updateVisualization(currentReynolds);
        }
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    }
}

// Restart 2D animation
function restart2DAnimation() {
    if (currentReynolds !== null) {
        updateVisualization(currentReynolds);
        const pauseBtn = document.getElementById('pause-2d-btn');
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    }
}

// Update current pattern display
function updateCurrentPattern(Re) {
    const patternElement = document.getElementById('current-pattern');
    if (patternElement) {
        let pattern = 'Laminar';
        if (Re > 4000) pattern = 'Turbulent';
        else if (Re > 2000) pattern = 'Transitional';
        
        patternElement.textContent = pattern;
        patternElement.className = pattern.toLowerCase();
    }
}

// ===== 3D VISUALIZATION FUNCTIONALITY =====
// Flow Visualization Configuration
const config = {
    animate: true,
    rotation: false,
    currentView: '3d',
    speed: 1,
    flowData: {
        velocity: 0,
        section: 'Center'
    }
};

// Initialize the 3D visualization
function initialize3DVisualization() {
    const flowAnimation3D = document.getElementById('flow-animation-3d');
    
    if (!flowAnimation3D) {
        console.log('3D container not found');
        return;
    }
    
    // Create 3D visualization using Plotly
    const trace = {
        type: 'surface',
        colorscale: 'Viridis',
        showscale: false,
        lighting: {
            ambient: 0.8,
            diffuse: 0.9,
            fresnel: 0.8,
            specular: 0.7,
            roughness: 0.4
        }
    };

    // Generate flow profile data
    update3DFlowProfile();

    // Set up event listeners for 3D controls
    setup3DControls();
    setup3DViewButtons();
}

// Update the 3D flow profile based on current parameters
function update3DFlowProfile() {
    const flowAnimation3D = document.getElementById('flow-animation-3d');
    
    if (!flowAnimation3D) {
        console.log('3D container not found for update');
        return;
    }
    
    const diameter = parseFloat(document.getElementById('diameter').value) || 0.05;
    const velocity = parseFloat(document.getElementById('velocity').value) || 1.5;
    
    // Generate data points for the flow profile
    const points = 50;
    const x = Array.from({length: points}, (_, i) => (i - points/2) * (diameter/points));
    const y = Array.from({length: points}, (_, i) => (i - points/2) * (diameter/points));
    const z = [];

    // Calculate flow profile (parabolic for laminar flow)
    for (let i = 0; i < points; i++) {
        z[i] = [];
        for (let j = 0; j < points; j++) {
            const r = Math.sqrt(x[i]**2 + y[j]**2);
            const maxRadius = diameter / 2;
            if (r <= maxRadius) {
                z[i][j] = velocity * (1 - (r/maxRadius)**2);
            } else {
                z[i][j] = 0; // Outside pipe boundary
            }
        }
    }

    // Create streamlines for better visualization
    const streamlines = create3DStreamlines(x, y, z, diameter, velocity);

    // Combine surface and streamlines
    const data = [
        {
            type: 'surface',
            x: x,
            y: y,
            z: z,
            colorscale: [
                [0, 'rgb(68,1,84)'],     // Dark purple
                [0.25, 'rgb(59,82,139)'], // Blue
                [0.5, 'rgb(33,144,140)'], // Teal
                [0.75, 'rgb(93,201,99)'], // Green
                [1, 'rgb(253,231,37)']    // Yellow
            ],
            showscale: true,
            colorbar: {
                title: 'Velocity (m/s)',
                titleside: 'right'
            },
            opacity: 0.8,
            lighting: {
                ambient: 0.8,
                diffuse: 0.9,
                fresnel: 0.8,
                specular: 0.7,
                roughness: 0.4
            }
        },
        ...streamlines
    ];

    const layout = {
        scene: {
            camera: get3DViewCamera(),
            xaxis: {title: 'Width (m)', range: [-diameter/2, diameter/2]},
            yaxis: {title: 'Height (m)', range: [-diameter/2, diameter/2]},
            zaxis: {title: 'Velocity (m/s)', range: [0, velocity]},
            bgcolor: 'rgba(0,0,0,0)',
            aspectmode: 'cube'
        },
        margin: {l: 0, r: 0, t: 0, b: 0},
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot('flow-animation-3d', data, layout, {
        responsive: true,
        displayModeBar: false
    });

    // Update flow information
    update3DFlowInfo(velocity);
}

// Create 3D streamlines for flow visualization
function create3DStreamlines(x, y, z, diameter, velocity) {
    const streamlines = [];
    const numStreamlines = 8;
    const maxRadius = diameter / 2;
    
    for (let i = 0; i < numStreamlines; i++) {
        const angle = (i / numStreamlines) * 2 * Math.PI;
        const radius = maxRadius * 0.7; // Stay within pipe
        const xStart = radius * Math.cos(angle);
        const yStart = radius * Math.sin(angle);
        
        // Create streamline points
        const streamX = [];
        const streamY = [];
        const streamZ = [];
        
        for (let t = 0; t < 20; t++) {
            streamX.push(xStart);
            streamY.push(yStart);
            
            // Calculate velocity at this position
            const r = Math.sqrt(xStart**2 + yStart**2);
            const velAtPoint = velocity * (1 - (r/maxRadius)**2);
            streamZ.push(velAtPoint + t * 0.01);
        }
        
        streamlines.push({
            type: 'scatter3d',
            x: streamX,
            y: streamY,
            z: streamZ,
            mode: 'lines',
            line: {
                color: 'rgba(255,255,255,0.8)',
                width: 4
            },
            showlegend: false
        });
    }
    
    return streamlines;
}

// Set up 3D control buttons and sliders
function setup3DControls() {
    const pauseBtn = document.getElementById('pause-btn');
    const rotateBtn = document.getElementById('rotate-btn');
    const speedSlider = document.getElementById('animation-speed');
    const graph = document.getElementById('flow-animation-3d');

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            config.animate = !config.animate;
            pauseBtn.innerHTML = config.animate ? 
                '<i class="fas fa-pause"></i> Pause' : 
                '<i class="fas fa-play"></i> Play';
            if (config.animate) {
                update3DFlowProfile();
            }
        });
    }

    if (rotateBtn) {
        rotateBtn.addEventListener('click', () => {
            config.rotation = !config.rotation;
            if (graph) {
                graph.classList.toggle('rotating');
            }
            rotateBtn.innerHTML = config.rotation ? 
                '<i class="fas fa-sync-alt fa-spin"></i> Stop Rotation' : 
                '<i class="fas fa-sync-alt"></i> Rotate View';
        });
    }

    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            config.speed = parseFloat(e.target.value);
            if (config.animate) {
                update3DFlowProfile();
            }
        });
    }
}

// Set up 3D view control buttons
function setup3DViewButtons() {
    const viewBtns = document.querySelectorAll('.view-btn');
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            config.currentView = btn.dataset.view;
            update3DFlowProfile();
        });
    });
}

// Get camera position based on current view
function get3DViewCamera() {
    switch(config.currentView) {
        case '3d':
            return {
                eye: {x: 1.5, y: 1.5, z: 1.5},
                center: {x: 0, y: 0, z: 0},
                up: {x: 0, y: 0, z: 1}
            };
        case 'top':
            return {
                eye: {x: 0, y: 0, z: 2},
                center: {x: 0, y: 0, z: 0},
                up: {x: 0, y: 1, z: 0}
            };
        case 'side':
            return {
                eye: {x: 2, y: 0, z: 0},
                center: {x: 0, y: 0, z: 0},
                up: {x: 0, y: 0, z: 1}
            };
        default:
            return {
                eye: {x: 1.5, y: 1.5, z: 1.5},
                center: {x: 0, y: 0, z: 0},
                up: {x: 0, y: 0, z: 1}
            };
    }
}

// Update 3D flow information display
function update3DFlowInfo(velocity) {
    const currentVelocityElement = document.getElementById('current-velocity');
    const currentSectionElement = document.getElementById('current-section');
    
    if (currentVelocityElement) {
        currentVelocityElement.textContent = `${velocity.toFixed(2)} m/s`;
    }
    
    if (currentSectionElement) {
        const section = Math.abs(velocity) < 1 ? 'Near Wall' : 
                       Math.abs(velocity) < 2 ? 'Intermediate' : 'Center';
        currentSectionElement.textContent = section;
    }
}

// Legacy function name for compatibility
function updateFlowProfile() {
    update3DFlowProfile();
}

// Initialize 3D visualization when called
function initializeVisualization() {
    initialize3DVisualization();
} 
