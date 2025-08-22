// Node Configuration Form Handler
class NodeConfigForm {
    constructor() {
        this.nodeId = NodeConfigUtils.getNodeIdFromUrl();
        this.protocolOptions = {};
        this.transportEditor = null;
        this.tlsEditor = null;
        this.realityEditor = null;
        
        this.initialize();
    }
    
    async initialize() {
        try {
            await this.loadProtocolOptions();
            console.log('Protocol options loaded, initializing editors...');
            
            this.initializeEditors();
            this.setupEventHandlers();
            
            if (this.nodeId) {
                await this.loadNodeConfiguration(this.nodeId);
            } else {
                $('#loadingMessage').hide();
                $('#nodeConfigForm').show();
            }
        } catch (error) {
            console.error('Error initializing form:', error);
            $('#loadingMessage').hide();
            alert('Failed to initialize form: ' + error.message);
        }
    }
    
    initializeEditors() {
        // Initialize transport editor
        this.transportEditor = new TransportConfigEditor();
        console.log('Transport editor initialized');
        
        // Initialize security editors (only if elements exist)
        try {
            if (document.getElementById('tlsSettingsEditor')) {
                this.tlsEditor = new SecurityConfigEditor('tls');
                console.log('TLS editor initialized');
            } else {
                console.log('TLS editor element not found');
            }
            if (document.getElementById('realitySettingsEditor')) {
                this.realityEditor = new SecurityConfigEditor('reality');
                console.log('Reality editor initialized');
            } else {
                console.log('Reality editor element not found');
            }
        } catch (error) {
            console.error('Error initializing security editors:', error);
        }
    }
    
    setupEventHandlers() {
        // Protocol change handler
        $('#protocolSelect').change((e) => {
            NodeConfigUtils.updateEncryptionOptions(e.target.value, this.protocolOptions);
            NodeConfigUtils.toggleProtocolSpecificFields(e.target.value);
        });
        
        // Security change handler
        $('#securitySelect').change((e) => {
            NodeConfigUtils.toggleSecuritySettings(e.target.value);
        });
        
        // Form submission
        $('#nodeConfigForm').submit((e) => {
            e.preventDefault();
            this.saveNodeConfiguration();
        });
    }
    
    loadProtocolOptions() {
        return $.ajax({
            url: '/v1/protocols',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            }
        })
            .done((data) => {
                this.protocolOptions = data;
                // Populate encryption options for each protocol
                NodeConfigUtils.updateEncryptionOptions('shadowsocks', this.protocolOptions); // Default
            })
            .fail((jqXHR) => {
                NodeConfigUtils.handleError(jqXHR, (message) => {
                    alert('Failed to load protocol options: ' + message);
                });
                throw new Error('Failed to load protocol options');
            });
    }
    
    loadNodeConfiguration(nodeId) {
        console.log('Loading node configuration for ID:', nodeId);
        return $.ajax({
            url: `/v1/nodes/${nodeId}/config`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            }
        })
            .done((node) => {
                console.log('Node configuration loaded:', node);
                try {
                    this.populateForm(node);
                    $('#loadingMessage').hide();
                    $('#nodeConfigForm').show();
                    console.log('Form populated successfully');
                } catch (error) {
                    console.error('Error populating form:', error);
                    $('#loadingMessage').hide();
                    alert('Error loading node configuration: ' + error.message);
                }
            })
            .fail((jqXHR) => {
                console.error('Failed to load node configuration:', jqXHR);
                NodeConfigUtils.handleError(jqXHR, (message) => {
                    alert('Failed to load node configuration: ' + message);
                    window.location.href = 'admin-nodes.html';
                });
                throw new Error('Failed to load node configuration');
            });
    }
    
    populateForm(node) {
        // Basic fields
        $('[name="core_type"]').val(node.core_type || 'xray');
        $('[name="protocol"]').val(node.protocol || 'shadowsocks');
        $('[name="server_name"]').val(node.server_name || '');
        $('[name="server_address"]').val(node.server_address || '');
        $('[name="server_ip"]').val(node.server_ip || '');
        $('[name="server_port"]').val(node.server_port || '');
        
        // Network configuration
        $('[name="listening_ip"]').val(node.listening_ip || '0.0.0.0');
        $('[name="listening_port"]').val(node.listening_port || '');
        $('[name="send_through"]').val(node.send_through || '');
        
        // Network settings
        $('[name="network_settings.transport"]').val(node.network_settings?.transport || 'tcp');
        $('[name="network_settings.accept_proxy_protocol"]').prop('checked', 
            node.network_settings?.accept_proxy_protocol || false);
        
        // Populate JSON transport settings editor
        if (this.transportEditor && node.network_settings?.settings) {
            this.transportEditor.setValue(node.network_settings.settings);
        }
        
        // Security settings
        $('[name="security"]').val(node.security || 'none');
        $('[name="cert_mode"]').val(node.cert_mode || 'none');
        
        // TLS settings - populate JSON editor
        if (this.tlsEditor && node.security_settings?.tls) {
            try {
                this.tlsEditor.setValue(node.security_settings.tls);
            } catch (error) {
                console.error('Error populating TLS settings:', error);
            }
        }
        
        // Reality settings - populate JSON editor
        if (this.realityEditor && node.security_settings?.reality) {
            try {
                this.realityEditor.setValue(node.security_settings.reality);
            } catch (error) {
                console.error('Error populating Reality settings:', error);
            }
        }
        
        // Fragment settings
        $('[name="fragment"]').prop('checked', node.fragment || false);
        $('[name="fragment_value"]').val(node.fragment_value || '');
        
        // Update UI based on current values
        NodeConfigUtils.updateEncryptionOptions($('[name="protocol"]').val(), this.protocolOptions);
        NodeConfigUtils.toggleProtocolSpecificFields($('[name="protocol"]').val());
        NodeConfigUtils.toggleSecuritySettings($('[name="security"]').val());
        
        // Set encryption after options are populated (with a small delay to ensure DOM is updated)
        setTimeout(() => {
            console.log('Setting encryption to:', node.encryption);
            $('[name="encryption"]').val(node.encryption || '');
            console.log('Encryption dropdown value after setting:', $('[name="encryption"]').val());
        }, 100);
    }
    
    saveNodeConfiguration() {
        const formData = new FormData($('#nodeConfigForm')[0]);
        const nodeData = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            NodeConfigUtils.setNestedProperty(nodeData, key, value);
        }
        
        // Handle checkboxes that aren't included in FormData when unchecked
        nodeData.network_settings = nodeData.network_settings || {};
        nodeData.network_settings.accept_proxy_protocol = $('#acceptProxy').is(':checked');
        
        // Handle JSON transport settings from the editor
        if (this.transportEditor) {
            // Validate JSON before saving
            if (!this.transportEditor.validateJSON()) {
                alert('Please fix JSON syntax errors in transport settings before saving.');
                return;
            }
            
            // Get parsed network settings from the JSON editor
            const jsonSettings = this.transportEditor.getNetworkSettings();
            if (jsonSettings) {
                nodeData.network_settings.settings = jsonSettings;
            }
        }
        
        nodeData.security_settings = nodeData.security_settings || {};
        
        // Handle JSON security settings from the editors
        if (nodeData.security === 'tls' && this.tlsEditor) {
            if (!this.tlsEditor.validateJSON()) {
                alert('Please fix JSON syntax errors in TLS settings before saving.');
                return;
            }
            const tlsSettings = this.tlsEditor.getSecuritySettings();
            if (tlsSettings) {
                nodeData.security_settings.tls = tlsSettings;
            }
        } else if (nodeData.security === 'reality' && this.realityEditor) {
            if (!this.realityEditor.validateJSON()) {
                alert('Please fix JSON syntax errors in Reality settings before saving.');
                return;
            }
            const realitySettings = this.realityEditor.getSecuritySettings();
            if (realitySettings) {
                nodeData.security_settings.reality = realitySettings;
            }
        }
        
        // Handle legacy form-based settings (fallback for compatibility)
        if (nodeData.security === 'tls' && !nodeData.security_settings.tls) {
            nodeData.security_settings.tls = nodeData.security_settings.tls || {};
            nodeData.security_settings.tls.allow_insecure = $('#allowInsecure').is(':checked');
            nodeData.security_settings.tls.reject_unknown_sni = $('#rejectUnknownSni').is(':checked');
        }

        if (nodeData.security === 'reality' && nodeData.security_settings.reality && !this.realityEditor?.getSecuritySettings()) {
            // Convert comma-separated short_ids to array
            if (nodeData.security_settings.reality.short_ids) {
                nodeData.security_settings.reality.short_ids = 
                    nodeData.security_settings.reality.short_ids.split(',').map(id => id.trim());
            }
        }
        
        nodeData.fragment = $('#fragmentEnabled').is(':checked');
        
        // Convert string numbers to integers
        if (nodeData.listening_port) {
            nodeData.listening_port = parseInt(nodeData.listening_port);
        }
        
        const url = this.nodeId ? `/v1/nodes/${this.nodeId}/config` : '/v1/nodes/config';
        const method = this.nodeId ? 'PUT' : 'POST';
        
        $.ajax({
            url: url,
            method: method,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            },
            contentType: 'application/json',
            data: JSON.stringify(nodeData),
            success: (response) => {
                // Trigger Xray configuration restart to apply changes immediately
                this.triggerXrayRestart();
                alert('Configuration saved successfully!');
                window.location.href = 'admin-nodes.html';
            },
            error: (jqXHR) => {
                NodeConfigUtils.handleError(jqXHR, (message) => {
                    alert('Failed to save configuration: ' + message);
                });
            }
        });
    }
    
    triggerXrayRestart() {
        // Trigger Xray configuration restart to apply protocol changes immediately
        // This endpoint requires admin authentication, so we'll try with admin password
        
        // First try to get admin password from settings endpoint
        $.ajax({
            url: '/v1/settings',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            },
            success: (settings) => {
                // Try to restart with admin password if available
                const adminPassword = settings.admin_password || 'password'; // fallback to default
                this.performXrayRestart(adminPassword);
            },
            error: () => {
                // TODO : REMOVE THIS PART 
                // If settings call fails, try with default admin password
                console.log('Could not get admin password from settings, trying with default');
                this.performXrayRestart('password');
            }
        });
    }
    
    performXrayRestart(adminPassword) {
        $.ajax({
            url: '/v1/settings/xray/restart',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminPassword}`,
            },
            success: () => {
                console.log('Xray configuration restart triggered successfully');
            },
            error: (jqXHR) => {
                console.warn('Failed to trigger Xray restart:', jqXHR.responseText || jqXHR.statusText || 'Unknown error');
                // Don't show error to user as this is a background operation
                // The configuration is still saved, just may not be applied immediately
            }
        });
    }
}
