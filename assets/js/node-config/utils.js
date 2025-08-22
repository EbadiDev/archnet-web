// Node Configuration Form Utilities
class NodeConfigUtils {
    static getNodeIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
    
    static setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
    }
    
    static handleError(jqXHR, callback) {
        let message = 'An error occurred';
        
        try {
            const response = JSON.parse(jqXHR.responseText);
            message = response.message || response.error || message;
        } catch (e) {
            message = jqXHR.statusText || message;
        }
        
        if (callback) {
            callback(message);
        }
    }
    
    static updateEncryptionOptions(protocol, protocolOptions) {
        const encryptionSelect = $('#encryptionSelect');
        encryptionSelect.empty().append('<option value="">Select Encryption</option>');
        
        if (protocolOptions.encryption_options && protocolOptions.encryption_options[protocol]) {
            protocolOptions.encryption_options[protocol].forEach(function(option) {
                encryptionSelect.append(`<option value="${option}">${option}</option>`);
            });
        }
    }
    
    static toggleProtocolSpecificFields(protocol) {
        // Hide all protocol-specific fields first
        $('.protocol-specific').removeClass('active');
        
        // Show relevant fields based on protocol
        if (protocol === 'vless' || protocol === 'vmess') {
            // These protocols typically use TLS or Reality
            if ($('[name="security"]').val() === 'tls') {
                $('#tlsSettings').addClass('active');
            } else if ($('[name="security"]').val() === 'reality') {
                $('#realitySettings').addClass('active');
            }
        }
    }
    
    static toggleSecuritySettings(security) {
        // Hide all security settings
        $('#tlsSettings').hide();
        $('#realitySettings').hide();
        
        // Show the appropriate security settings based on selection
        if (security === 'tls') {
            $('#tlsSettings').show();
        } else if (security === 'reality') {
            $('#realitySettings').show();
        }
        // For 'none', both remain hidden
    }
}

// Legacy function for backward compatibility
function generateRealityKeys() {
    $.post('/v1/generate-reality-keys')
        .done(function(data) {
            $('[name="security_settings.reality.private_key"]').val(data.private_key);
            $('[name="security_settings.reality.public_key"]').val(data.public_key);
            alert('Reality keys generated successfully!');
        })
        .fail(function() {
            alert('Failed to generate Reality keys');
        });
}
