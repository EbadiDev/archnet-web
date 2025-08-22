// Base JSON Editor functionality
class JSONEditor {
    constructor(editorId, statusId) {
        this.editor = document.getElementById(editorId);
        this.statusElement = document.getElementById(statusId);
        
        if (!this.editor) {
            console.warn(`Editor element not found: ${editorId}`);
            return;
        }
        
        this.initializeValidation();
    }
    
    initializeValidation() {
        if (!this.editor) return;
        
        // Real-time JSON validation
        this.editor.addEventListener('input', () => this.validateJSON());
    }
    
    validateJSON() {
        if (!this.editor || !this.statusElement) return true;
        
        try {
            const value = this.editor.value.trim();
            if (value === '') {
                this.setStatus('Empty (will use defaults)', 'text-muted');
                return true;
            }
            
            JSON.parse(value);
            this.setStatus('✓ Valid JSON', 'text-success');
            return true;
        } catch (error) {
            this.setStatus('✗ Invalid JSON: ' + error.message, 'text-danger');
            return false;
        }
    }
    
    formatJSON() {
        if (!this.editor) return;
        
        try {
            const value = this.editor.value.trim();
            if (value === '') return;
            
            const parsed = JSON.parse(value);
            const formatted = JSON.stringify(parsed, null, 2);
            this.editor.value = formatted;
            this.setStatus('✓ Formatted', 'text-success');
        } catch (error) {
            this.setStatus('✗ Cannot format invalid JSON', 'text-danger');
        }
    }
    
    setStatus(message, className) {
        if (this.statusElement) {
            this.statusElement.textContent = message;
            this.statusElement.className = className;
        }
    }
    
    getValue() {
        if (!this.editor) return null;
        
        const value = this.editor.value.trim();
        if (value === '') return null;
        
        try {
            return JSON.parse(value);
        } catch (error) {
            return null;
        }
    }
    
    setValue(data) {
        if (!this.editor) return;
        
        if (data) {
            this.editor.value = JSON.stringify(data, null, 2);
            this.validateJSON();
        }
    }
    
    populateExamples(containerId, examples, title) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (typeof examples === 'object' && !Array.isArray(examples)) {
            // Multiple examples object
            Object.keys(examples).forEach(key => {
                const example = document.createElement('div');
                example.className = 'mb-2';
                example.innerHTML = `
                    <strong>${key.toUpperCase()}:</strong>
                    <pre class="bg-white p-2 border rounded mt-1" style="font-size: 0.8em;"><code>${JSON.stringify(examples[key], null, 2)}</code></pre>
                `;
                container.appendChild(example);
            });
        } else {
            // Single example
            const example = document.createElement('div');
            example.className = 'mb-2';
            example.innerHTML = `
                <strong>${title}:</strong>
                <pre class="bg-white p-2 border rounded mt-1" style="font-size: 0.8em;"><code>${JSON.stringify(examples, null, 2)}</code></pre>
            `;
            container.appendChild(example);
        }
        
        container.classList.add('populated');
    }
    
    toggleExamples(examplesId) {
        const examples = document.getElementById(examplesId);
        if (!examples) return;
        
        const collapse = new bootstrap.Collapse(examples);
        
        if (!examples.querySelector('.populated')) {
            return true; // Signal that examples need to be populated
        }
        return false;
    }
}
