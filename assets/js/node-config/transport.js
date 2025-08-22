// Transport Configuration Editor
class TransportConfigEditor extends JSONEditor {
    constructor() {
        super('networkSettingsEditor', 'jsonValidationStatus');
        
        if (!this.editor) return;
        
        this.templates = this.getTransportTemplates();
        this.initializeEditor();
    }
    
    initializeEditor() {
        if (!this.editor) return;
        
        // Format JSON button
        const formatBtn = document.getElementById('formatJsonBtn');
        if (formatBtn) {
            formatBtn.addEventListener('click', () => this.formatJSON());
        }
        
        // Load template button  
        const templateBtn = document.getElementById('loadTemplateBtn');
        if (templateBtn) {
            templateBtn.addEventListener('click', () => this.loadCurrentTransportTemplate());
        }
        
        // Transport change handler
        const transportSelect = document.getElementById('transportSelect');
        if (transportSelect) {
            transportSelect.addEventListener('change', (e) => {
                this.loadTemplate(e.target.value);
            });
        }
        
        // Examples toggle
        const examplesLink = document.getElementById('showExamplesLink');
        if (examplesLink) {
            examplesLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleExamplesHandler();
            });
        }
    }
    
    loadCurrentTransportTemplate() {
        const transportSelect = document.getElementById('transportSelect');
        if (transportSelect) {
            this.loadTemplate(transportSelect.value);
        }
    }
    
    loadTemplate(transport) {
        if (!this.editor) return;
        
        const template = this.templates[transport];
        if (template) {
            this.setValue(template);
        }
    }
    
    toggleExamplesHandler() {
        if (this.toggleExamples('jsonExamples')) {
            this.populateExamples('transportExamples', this.templates, 'Transport Examples');
        }
    }
    
    getTransportTemplates() {
        return {
            tcp: {
                header: {
                    type: "none"
                },
                socketSettings: {
                    useSocket: false,
                    DomainStrategy: "asis",
                    tcpKeepAliveInterval: 0,
                    tcpUserTimeout: 0,
                    tcpMaxSeg: 0,
                    tcpWindowClamp: 0,
                    tcpKeepAliveIdle: 0,
                    tcpMptcp: false
                }
            },
            http: {
                path: "/arch",
                host: ["www.baidu.com", "www.taobao.com", "www.cloudflare.com"],
                method: "GET",
                headers: {
                    "User-Agent": ["Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36"],
                    "Accept-Encoding": ["gzip, deflate"],
                    "Connection": ["keep-alive"],
                    "Pragma": "no-cache"
                }
            },
            ws: {
                path: "/arch?ed=2560",
                host: "hk1.xyz.com",
                heartbeatperiod: 30,
                custom_host: "fakedomain.com",
                socketSettings: {
                    useSocket: false,
                    DomainStrategy: "asis",
                    tcpKeepAliveInterval: 0,
                    tcpUserTimeout: 0,
                    tcpMaxSeg: 0,
                    tcpWindowClamp: 0,
                    tcpKeepAliveIdle: 0,
                    tcpMptcp: false
                }
            },
            grpc: {
                serviceName: "arch",
                authority: "hk1.xyz.com",
                multiMode: false,
                user_agent: "custom user agent",
                idle_timeout: 60,
                health_check_timeout: 20,
                permit_without_stream: false,
                initial_windows_size: 0,
                socketSettings: {
                    useSocket: false,
                    DomainStrategy: "asis",
                    tcpKeepAliveInterval: 0,
                    tcpUserTimeout: 0,
                    tcpMaxSeg: 0,
                    tcpWindowClamp: 0,
                    tcpKeepAliveIdle: 0,
                    tcpMptcp: false
                }
            },
            kcp: {
                mtu: 1350,
                tti: 20,
                uplinkCapacity: 5,
                downlinkCapacity: 20,
                congestion: false,
                readBufferSize: 1,
                writeBufferSize: 1,
                header: {
                    type: "none"
                },
                seed: "password",
                socketSettings: {
                    useSocket: false,
                    DomainStrategy: "asis",
                    tcpKeepAliveInterval: 0,
                    tcpUserTimeout: 0,
                    tcpMaxSeg: 0,
                    tcpWindowClamp: 0,
                    tcpKeepAliveIdle: 0,
                    tcpMptcp: false
                }
            },
            httpupgrade: {
                host: "hk1.xyz.com",
                path: "/arch?ed=2560",
                custom_host: "fakedomain.com",
                socketSettings: {
                    useSocket: false,
                    DomainStrategy: "asis",
                    tcpKeepAliveInterval: 0,
                    tcpUserTimeout: 0,
                    tcpMaxSeg: 0,
                    tcpWindowClamp: 0,
                    tcpKeepAliveIdle: 0,
                    tcpMptcp: false
                }
            },
            xhttp: {
                host: "hk1.xyz.com",
                custom_host: "fakedomain.com",
                path: "/",
                noSSEHeader: false,
                noGRPCHeader: true,
                mode: "auto",
                socketSettings: {
                    useSocket: false,
                    DomainStrategy: "asis",
                    tcpKeepAliveInterval: 0,
                    tcpUserTimeout: 0,
                    tcpMaxSeg: 0,
                    tcpWindowClamp: 0,
                    tcpKeepAliveIdle: 0,
                    tcpMptcp: false
                }
            }
        };
    }
    
    getNetworkSettings() {
        return this.getValue();
    }
}
