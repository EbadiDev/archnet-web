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
        console.log('updateEncryptionOptions called with protocol:', protocol);
        const encryptionSelect = $('#encryptionSelect');
        encryptionSelect.empty().append('<option value="">Select Encryption</option>');
        
        // Map protocol names to API keys
        const protocolKeyMap = {
            'shadowsocks': 'ss',
            'vmess': 'vmess',
            'vless': 'vless',
            'trojan': 'trojan'
        };
        
        const apiKey = protocolKeyMap[protocol] || protocol;
        console.log('Using API key:', apiKey);
        
        if (protocolOptions.encryption_options && protocolOptions.encryption_options[apiKey]) {
            console.log('Found encryption options:', protocolOptions.encryption_options[apiKey]);
            protocolOptions.encryption_options[apiKey].forEach(function(option) {
                encryptionSelect.append(`<option value="${option}">${option}</option>`);
            });
            console.log('Encryption options populated. Total options:', encryptionSelect.find('option').length);
        } else {
            console.log('No encryption options found for protocol:', protocol, 'apiKey:', apiKey);
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
    $.ajax({
        url: '/v1/generate-reality-keys',
        type: 'POST',
        headers: {
            'Authorization': 'Bearer password',
            'Content-Type': 'application/json'
        }
    })
        .done(function(data) {
            $('[name="security_settings.reality.private_key"]').val(data.private_key);
            $('[name="security_settings.reality.public_key"]').val(data.public_key);
            if (data.short_ids && data.short_ids.length > 0) {
                $('[name="security_settings.reality.short_ids"]').val(JSON.stringify(data.short_ids));
            }
            alert('Reality keys and shortids generated successfully!');
        })
        .fail(function() {
            alert('Failed to generate Reality keys');
        });
}
