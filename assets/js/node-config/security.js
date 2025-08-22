// Security Configuration Editors
class SecurityConfigEditor extends JSONEditor {
    constructor(type) {
        super(`${type}SettingsEditor`, `${type}JsonValidationStatus`);
        
        this.type = type; // 'tls' or 'reality'
        
        if (!this.editor) {
            console.warn(`Security editor element not found: ${type}SettingsEditor`);
            return;
        }
        
        this.templates = this.getSecurityTemplates();
        this.initializeEditor();
    }
    
    initializeEditor() {
        if (!this.editor) return;
        
        // Format JSON button
        const formatBtn = document.getElementById(`format${this.type.charAt(0).toUpperCase() + this.type.slice(1)}JsonBtn`);
        if (formatBtn) {
            formatBtn.addEventListener('click', () => this.formatJSON());
        }
        
        // Load template button  
        const templateBtn = document.getElementById(`load${this.type.charAt(0).toUpperCase() + this.type.slice(1)}TemplateBtn`);
        if (templateBtn) {
            templateBtn.addEventListener('click', () => this.loadTemplate());
        }
        
        // Generate keys button (Reality only)
        if (this.type === 'reality') {
            const generateBtn = document.getElementById('generateRealityKeysBtn');
            if (generateBtn) {
                generateBtn.addEventListener('click', () => this.generateRealityKeys());
            }
        }
        
        // Examples toggle
        const examplesLink = document.getElementById(`show${this.type.charAt(0).toUpperCase() + this.type.slice(1)}ExamplesLink`);
        if (examplesLink) {
            examplesLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleExamplesHandler();
            });
        }
    }
    
    loadTemplate() {
        if (!this.editor) return;
        
        const template = this.templates[this.type];
        if (template) {
            this.setValue(template);
        }
    }
    
    async generateRealityKeys() {
        if (this.type !== 'reality') return;
        
        try {
            const response = await fetch('/v1/generate-reality-keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const keys = await response.json();
                const currentValue = this.editor.value.trim();
                let config = {};
                
                if (currentValue) {
                    try {
                        config = JSON.parse(currentValue);
                    } catch (e) {
                        config = this.templates.reality;
                    }
                } else {
                    config = {...this.templates.reality};
                }
                
                config.privatekey = keys.private_key;
                config.publickey = keys.public_key;
                
                this.setValue(config);
                this.setStatus('✓ Keys generated', 'text-success');
            } else {
                throw new Error('Failed to generate keys');
            }
        } catch (error) {
            this.setStatus('✗ Failed to generate keys: ' + error.message, 'text-danger');
        }
    }
    
    toggleExamplesHandler() {
        if (this.toggleExamples(`${this.type}Examples`)) {
            const template = this.templates[this.type];
            this.populateExamples(
                `${this.type}ExamplesContainer`, 
                template, 
                `${this.type.toUpperCase()} Configuration`
            );
        }
    }
    
    getSecurityTemplates() {
        return {
            tls: {
                serverName: "arch.dev",
                rejectUnknownSni: false,
                allowInsecure: false,
                fingerprint: "chrome",
                sni: "arch.dev",
                curvepreferences: "X25519",
                alpn: ["h2", "http/1.1"],
                serverNameToVerify: ""
            },
            reality: {
                show: false,
                dest: "www.cloudflare.com:443",
                privatekey: "yBaw532IIUNuQWDTncozoBaLJmcd1JZzvsHUgVPxMk8",
                minclientver: "",
                maxclientver: "",
                maxtimediff: 0,
                proxyprotocol: 0,
                shortids: ["6ba85179e30d4fc2"],
                serverNames: ["www.cloudflare.com"],
                fingerprint: "chrome",
                spiderx: "",
                publickey: "7xhH4b_VkliBxGulljcyPOH-bYUA2dl-XAdZAsfhk04"
            }
        };
    }
    
    getSecuritySettings() {
        return this.getValue();
    }
}
