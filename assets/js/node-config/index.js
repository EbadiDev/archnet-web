// Node Configuration Module Index
// This file provides compatibility exports for the node configuration modules

// All classes are now loaded globally via script tags in the HTML
// This file can be used for future module bundling or exports

// Global reference for external use
if (typeof window !== 'undefined') {
    window.NodeConfigModules = {
        JSONEditor: window.JSONEditor,
        TransportConfigEditor: window.TransportConfigEditor,
        SecurityConfigEditor: window.SecurityConfigEditor,
        NodeConfigUtils: window.NodeConfigUtils,
        NodeConfigForm: window.NodeConfigForm
    };
}
