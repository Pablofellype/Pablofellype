// Audio Synthesis Engine (Web Audio API)
let audioCtx = null;
let soundEnabled = localStorage.getItem('sound-enabled') === 'true';

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

const sounds = {
    tick: () => {
        if (!soundEnabled) return;
        initAudio();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    },
    click: () => {
        if (!soundEnabled) return;
        initAudio();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    },
    success: () => {
        if (!soundEnabled) return;
        initAudio();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.03, now + idx * 0.08 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
            
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.35);
        });
    },
    error: () => {
        if (!soundEnabled) return;
        initAudio();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        osc.frequency.setValueAtTime(140, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
    }
};

// Particles Background System
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.maxParticles = 80;
        this.mouse = { x: null, y: null, radius: 150 };
        this.colors = [];
        
        this.initColors();
        this.resize();
        this.setupEventListeners();
        this.generateParticles();
        this.animate();
    }

    initColors() {
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        if (theme === 'light') {
            this.colors = ['#2563eb', '#7c3aed', '#60a5fa', '#a78bfa'];
        } else {
            this.colors = ['#00f2fe', '#8a2be2', '#4facfe', '#cd00ff'];
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.generateParticles();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    generateParticles() {
        this.particles = [];
        const isMobile = window.innerWidth < 768;
        const count = isMobile ? this.maxParticles / 2 : this.maxParticles;
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                size: Math.random() * 2 + 1,
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const lineAlpha = isDark ? 0.07 : 0.05;
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;

            // Bounce on boundaries
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Mouse interactions
            if (this.mouse.x !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouse.radius) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    p.x += (dx / dist) * force * 2;
                    p.y += (dy / dist) * force * 2;
                }
            }

            // Draw Particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();

            // Draw connection lines
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = isDark ? `rgba(0, 242, 254, ${lineAlpha * (1 - dist/120)})` : `rgba(37, 99, 235, ${lineAlpha * (1 - dist/120)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
        requestAnimationFrame(() => this.animate());
    }
}

// Interactive Terminal Simulator
class TerminalEmulator {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.body = document.getElementById('terminal-body');
        
        if (!this.input) return;
        this.setupTerminal();
    }

    setupTerminal() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value.trim();
                this.executeCommand(cmd);
                this.input.value = '';
                sounds.click();
            }
        });
        
        // Auto scroll to bottom
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.body.scrollTop = this.body.scrollHeight;
    }

    appendLine(text, className = '') {
        const p = document.createElement('p');
        p.className = className;
        p.innerHTML = text;
        this.body.appendChild(p);
        this.scrollToBottom();
    }

    executeCommand(cmd) {
        // Echo input line
        this.appendLine(`<span class="t-prompt">pablo@brasal:~$</span> <span class="t-cmd">${cmd}</span>`);
        
        if (cmd === '') return;
        
        const command = cmd.toLowerCase().split(' ')[0];
        
        switch (command) {
            case 'help':
            case 'ajuda':
                this.appendLine('Comandos disponíveis:');
                this.appendLine('  <strong>neofetch</strong>  - Apresenta informações do sistema e resumo de Pablo');
                this.appendLine('  <strong>about</strong>     - Quem é Pablo, histórico profissional');
                this.appendLine('  <strong>projects</strong>  - Lista de sistemas entregues');
                this.appendLine('  <strong>skills</strong>    - Habilidades principais com gráfico');
                this.appendLine('  <strong>contato</strong>   - Links e formas de falar comigo');
                this.appendLine('  <strong>clear</strong>     - Limpa o terminal');
                break;
                
            case 'neofetch':
            case 'pablo':
                const neofetchOutput = `
<span class="t-success">       .---.       </span>  <span class="t-prompt">pablo@brasal-web-engine</span>
<span class="t-success">      /     \\      </span>  ------------------------
<span class="t-success">      \\.@-@./      </span>  <strong>Função:</strong> Web Developer @ Brasal Refrigerantes
<span class="t-success">      /  "  \\      </span>  <strong>Sistemas:</strong> 6 Soluções Completas Entregues
<span class="t-success">     //  -  \\\\     </span>  <strong>Stack:</strong> JS / Node.js / Express / MySQL / Docker
<span class="t-success">    ((   .   ))    </span>  <strong>OS:</strong> Brasal Web Services v2.0
<span class="t-success">    \\)       (/    </span>  <strong>PWA:</strong> Habilitado & Customizado
<span class="t-success">     \`--'--'\`      </span>  <strong>Banco de Dados:</strong> Modelagem & Otimização
                `;
                this.appendLine(neofetchOutput, 't-output');
                break;
                
            case 'about':
            case 'sobre':
                this.appendLine('<strong>Sobre Mim:</strong>', 't-success');
                this.appendLine('Sou desenvolvedor web na Brasal Refrigerantes. Minha missão é a digitalização completa de processos internos, eliminando a dependência de planilhas manuais e formulários em papel. Desenvolvo sistemas robustos que resolvem problemas reais de governança, logística, segurança e controle.');
                this.appendLine('Participei da modelagem até a implantação de 6 grandes sistemas internos, escaláveis e focados na melhor experiência de uso.', 't-output');
                break;
                
            case 'projects':
            case 'projetos':
                this.appendLine('<strong>Projetos Realizados:</strong>', 't-success');
                this.appendLine('1. <strong>Auditoria e Controle</strong> (Node.js/MySQL) - Eliminou 12 planilhas, 100% de aprovação auditoria.');
                this.appendLine('2. <strong>PWA Inspeção</strong> (PWA/JS/Tailwind) - Checklist offline com upload de imagens.');
                this.appendLine('3. <strong>Avaliação QR Code</strong> (Node/Vite) - Validação de matrículas em tempo real.');
                this.appendLine('4. <strong>Solicitação Materiais</strong> (HTML/CSS/JS) - Catálogo EPIs com detecção de duplicados.');
                this.appendLine('5. <strong>Landing Page Tráfego</strong> (SEO/HTML/CSS) - Otimização de conversão.');
                this.appendLine('<span class="t-muted">Dica: Use os cards visuais na página para detalhes de cada projeto!</span>');
                break;
                
            case 'skills':
            case 'habilidades':
                this.appendLine('<strong>Minhas Habilidades:</strong>', 't-success');
                this.appendLine('JavaScript/TypeScript [████████████████████] 100%');
                this.appendLine('Node.js & Express    [██████████████████░░] 90%');
                this.appendLine('MySQL & Modelagem    [████████████████░░░░] 80%');
                this.appendLine('HTML5 & CSS3/Tailwind[████████████████████] 100%');
                this.appendLine('Docker & Deploy      [████████████░░░░░░░░] 60%');
                break;
                
            case 'contato':
            case 'contact':
                this.appendLine('<strong>Canais de Contato:</strong>', 't-success');
                this.appendLine('📧 Email: <a href="mailto:contato@pablofellype.dev" style="color:var(--accent-primary);">contato@pablofellype.dev</a>');
                this.appendLine('🐙 GitHub: <a href="https://github.com/Pablofellype" target="_blank" style="color:var(--accent-primary);">github.com/Pablofellype</a>');
                this.appendLine('🔗 LinkedIn: <a href="#" style="color:var(--accent-primary);">linkedin.com/in/pablofellype</a>');
                break;
                
            case 'clear':
            case 'limpar':
                this.body.innerHTML = `
                    <p class="t-output">Terminal reiniciado. Digite <span class="t-success">help</span> para ver os comandos.</p>
                `;
                break;
                
            default:
                this.appendLine(`Comando '${cmd}' não reconhecido. Digite <span class="t-success">help</span> para obter ajuda.`, 't-muted');
                sounds.error();
                break;
        }
    }
}

// Application Orchestrator
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Particles Background
    const particles = new ParticleSystem();

    // 2. Initialize Terminal Emulator
    new TerminalEmulator();

    // 3. Sound Toggle Controls
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        // Sync icon status with local storage
        updateSoundIcon(soundToggle);
        
        soundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            localStorage.setItem('sound-enabled', soundEnabled);
            updateSoundIcon(soundToggle);
            
            if (soundEnabled) {
                initAudio();
                sounds.success();
            }
        });
    }

    function updateSoundIcon(btn) {
        if (soundEnabled) {
            btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
            btn.style.color = 'var(--accent-primary)';
        } else {
            btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
            btn.style.color = 'var(--text-muted)';
        }
    }

    // Add audio feedback to main navigational links and CTA elements
    const interactiveElements = document.querySelectorAll('a, button, .filter-btn, .project-card');
    interactiveElements.forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            sounds.tick();
        });
        elem.addEventListener('click', () => {
            sounds.click();
        });
    });

    // 4. Project Card Filtering system
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active status from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                const techList = card.getAttribute('data-tech').toLowerCase();
                if (filterValue === 'all' || techList.includes(filterValue.toLowerCase())) {
                    card.classList.remove('hide');
                } else {
                    card.classList.add('hide');
                }
            });
            sounds.success();
        });
    });

    // 5. Theme Switcher Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Re-init particle colors on theme shift
            particles.initColors();
            particles.generateParticles();
            
            sounds.success();
        });
    }

    // Load initial theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'light') {
        particles.initColors();
        particles.generateParticles();
    }

    // 6. Dynamic Modal Window Details
    const modal = document.getElementById('project-modal');
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');

    // Projects full descriptions dictionary
    const projectDetails = {
        'auditoria': {
            title: '📋 Sistema de Auditoria e Controle',
            tech: ['Node.js', 'Express', 'MySQL', 'Docker'],
            features: [
                'Substituição integral de mais de 12 planilhas corporativas complexas e formulários físicos.',
                'Cálculo de compliance trimestral automatizado com base em algoritmos internos de pontuação.',
                'Alertas de pendências e notificações push automáticas para gestores.',
                'Módulo avançado de exportação e emissão de relatórios consolidados em formato PDF.',
                'Histórico completo imutável das edições (Audit Trail) para conformidade com normas regulatórias.',
                'Validação extrema: Aprovado com 100% de pontuação em duas auditorias governamentais subsequentes.'
            ],
            desc: 'Este projeto nasceu da necessidade urgente de estruturar os processos de conformidade da Brasal Refrigerantes. Ao criar uma infraestrutura baseada em Node.js e Docker com banco estruturado em MySQL, mitigamos a perda de dados e economizamos centenas de horas de conferência manual de auditoria.'
        },
        'inspecao': {
            title: '📱 Plataforma PWA de Inspeção',
            tech: ['Node.js', 'JavaScript', 'Tailwind CSS', 'MySQL'],
            features: [
                'Suporte a instalação local (Progressive Web App) para dispositivos corporativos móveis.',
                'Três perfis hierárquicos distintos: Administrador, Colaborador e Visitante externo.',
                'Formulários e checklists inteligentes com captura e upload direto de fotos por câmera.',
                'Geração e exportação instantânea de arquivos PDF estruturados de vistorias.',
                'Dashboard analítico em tempo real com estatísticas e gráficos sobre a eficiência operacional.'
            ],
            desc: 'A plataforma de inspeção foi construída com foco absoluto em usabilidade. O uso de metodologias PWA permitiu que operadores realizassem inspeções nos galpões e pátios fabris, integrando o envio de evidências fotográficas em tempo real ao banco de dados MySQL.'
        },
        'qrcode': {
            title: '📊 Plataforma de Avaliação por QR Code',
            tech: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Vite'],
            features: [
                'Captura simplificada de avaliações rápidas por meio de QR Code dinâmicos em totens.',
                'Validação e autenticação em tempo real de matrículas de colaboradores integrando endpoints do ERP.',
                'Painel de controle administrativo com consolidação gráfica (Gráficos interativos SVG).',
                'Engajamento e cobertura expandida: Integração de 11 setores distintos da empresa.'
            ],
            desc: 'Focada em coletar o feedback de satisfação de nossos serviços e processos internos, esta ferramenta utiliza Vite no Front-end para extrema agilidade no carregamento, garantindo que o usuário responda a pesquisa em menos de 10 segundos.'
        },
        'materiais': {
            title: '📦 Portal de Solicitação de Materiais',
            tech: ['HTML', 'CSS', 'JavaScript', 'Node.js'],
            features: [
                'Fluxo centralizado para controle, triagem e distribuição de EPIs, uniformes e insumos.',
                'Catálogo interativo com visualização fotográfica detalhada de itens de estoque.',
                'Mecanismo heurístico para detecção de solicitações duplicadas ou fora do período de carência.',
                'Rastreabilidade total do ciclo de vida da requisição por número de protocolo único.'
            ],
            desc: 'Essa solução reduziu drasticamente o desperdício de insumos de limpeza e fardamentos na Brasal. O sistema previne solicitações antes do período mínimo recomendado e centraliza a logística de entrega em um único painel administrativo.'
        },
        'trafego': {
            title: '🌐 Landing Page para Tráfego Pago',
            tech: ['HTML', 'CSS', 'JavaScript', 'SEO'],
            features: [
                'Estrutura visual adaptável (Totalmente Responsiva) para dispositivos móveis de última geração.',
                'Indexação e visibilidade ampliadas através de estratégias avançadas de SEO on-page.',
                'Código limpo com carregamento otimizado (Score superior a 95 no Google PageSpeed Insights).',
                'Metodologia ágil: Concepção, design e publicação concluídos em apenas 14 dias.'
            ],
            desc: 'Desenvolvimento ágil de alto desempenho direcionado a maximizar taxas de conversão de leads para serviços de anúncios. Focado em transições fluídas CSS e otimização total de scripts de rastreamento.'
        }
    };

    const detailsButtons = document.querySelectorAll('.view-details-btn');
    detailsButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering card click
            const projKey = btn.getAttribute('data-project');
            const data = projectDetails[projKey];
            
            if (data) {
                // Populate Modal content
                modalTitle.innerText = data.title;
                
                let featuresHtml = '<ul class="project-features" style="margin-top: 1rem;">';
                data.features.forEach(f => {
                    featuresHtml += `<li>${f}</li>`;
                });
                featuresHtml += '</ul>';
                
                let techBadgesHtml = '<div class="project-tech" style="margin-top: 1.5rem;">';
                data.tech.forEach(t => {
                    techBadgesHtml += `<span class="tech-badge">${t}</span>`;
                });
                techBadgesHtml += '</div>';

                modalBody.innerHTML = `
                    <div class="modal-img-container">
                        <div class="modal-img-placeholder">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            <span>Mockup Funcional no Sistema</span>
                        </div>
                    </div>
                    <p style="font-weight: 500; color: var(--text-primary);">${data.desc}</p>
                    <h4>Principais Recursos Desenvolvidos:</h4>
                    ${featuresHtml}
                    ${techBadgesHtml}
                `;
                
                modal.classList.add('active');
                sounds.success();
            }
        });
    });

    // Close Modal event listeners
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            sounds.click();
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                sounds.click();
            }
        });
    }
});
