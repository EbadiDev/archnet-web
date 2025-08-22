// Main Node Configuration Entry Point
// This file initializes the node configuration form when the page loads

// Global variables for backward compatibility
let transportEditor = null;
let tlsEditor = null;
let realityEditor = null;
let nodeConfigForm = null;

$(document).ready(function() {
    // Initialize the main form handler
    nodeConfigForm = new NodeConfigForm();
    
    // Set global editor references for backward compatibility
    setTimeout(() => {
        transportEditor = nodeConfigForm.transportEditor;
        tlsEditor = nodeConfigForm.tlsEditor;
        realityEditor = nodeConfigForm.realityEditor;
    }, 100);
});
