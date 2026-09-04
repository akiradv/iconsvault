let state = {
    currentIcon: null,
    currentPrefix: null,
    color: "#292524",
    size: 48,
    strokeWidth: 2,
    format: "svg"
};

// Carrega o filtro salvo ou usa "all" como padrão
let activeFilter = localStorage.getItem('activeFilter') || "all";

const iconsContainer = document.getElementById('icons-container');
const modal = document.getElementById('icon-modal');
const closeModalBtn = document.getElementById('close-modal');
const svgPreviewContainer = document.getElementById('svg-preview-container');
const previewIconName = document.getElementById('preview-icon-name');
const iconCountLabel = document.getElementById('icon-count-label');

const colorInput = document.getElementById('icon-color');
const colorHex = document.getElementById('color-hex');
const sizeInput = document.getElementById('icon-size');
const sizeValue = document.getElementById('size-value');
const strokeInput = document.getElementById('stroke-width');
const strokeValue = document.getElementById('stroke-value');

const copyCustomBtn = document.getElementById('copy-custom-btn');
const downloadSvgBtn = document.getElementById('download-svg-btn');
const formatBtns = document.querySelectorAll('.copy-format-btn');
const tabBtns = document.querySelectorAll('.tab-btn');

function updateTabCounts() {
    const counts = { 
        all: iconCatalog.length, 
        lucide: 0, tabler: 0, ph: 0, heroicons: 0, 
        ri: 0, mdi: 0, fluent: 0 
    };
    iconCatalog.forEach(icon => {
        const prefix = icon.split(':')[0];
        if (counts[prefix] !== undefined) counts[prefix]++;
    });
    
    document.getElementById('count-all').textContent = counts.all;
    document.getElementById('count-lucide').textContent = counts.lucide;
    document.getElementById('count-tabler').textContent = counts.tabler;
    document.getElementById('count-ph').textContent = counts.ph;
    document.getElementById('count-heroicons').textContent = counts.heroicons;
    document.getElementById('count-ri').textContent = counts.ri;
    document.getElementById('count-mdi').textContent = counts.mdi;
    document.getElementById('count-fluent').textContent = counts.fluent;
}

function renderIcons(filter = "") {
    iconsContainer.innerHTML = "";
    const lowerFilter = filter.toLowerCase();
    
    let filteredIcons = iconCatalog;
    if (activeFilter !== "all") {
        filteredIcons = filteredIcons.filter(icon => icon.startsWith(`${activeFilter}:`));
    }
    
    if (lowerFilter) {
        filteredIcons = filteredIcons.filter(icon => icon.toLowerCase().includes(lowerFilter));
    }

    if (iconCountLabel) {
        if (filteredIcons.length === 0) {
            iconCountLabel.textContent = 'Nenhum ícone encontrado';
        } else if (filteredIcons.length === 1) {
            iconCountLabel.textContent = '1 ícone encontrado';
        } else {
            iconCountLabel.textContent = `${filteredIcons.length} ícones encontrados`;
        }
    }

    if (filteredIcons.length === 0) {
        iconsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 3rem;">Nenhum ícone encontrado nesta categoria. Tente outro termo.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();

    filteredIcons.forEach(iconRef => {
        const [prefix, name] = iconRef.split(':');
        const card = document.createElement('div');
        card.className = 'icon-card';
        card.tabIndex = 0;
        
        card.innerHTML = `
            <img src="https://api.iconify.design/${iconRef}.svg?color=${encodeURIComponent('#6c757d')}" 
                 alt="${name}" 
                 width="40" height="40"
                 loading="lazy"
                 style="width: 40px; height: 40px; transition: transform 0.2s ease;">
            <span class="icon-name">${name}</span>
            <span class="icon-source-badge">${prefix}</span>
        `;
        
        const openModal = () => loadIconIntoModal(iconRef, name, prefix);
        card.addEventListener('click', openModal);
        card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openModal(); });
        
        fragment.appendChild(card);
    });

    iconsContainer.appendChild(fragment);
}

async function loadIconIntoModal(iconRef, name, prefix) {
    state.currentIcon = name;
    state.currentPrefix = prefix;
    
    const currentTheme = document.documentElement.getAttribute('data-theme');
    state.color = currentTheme === 'dark' ? '#e7e5e4' : '#292524';
    
    previewIconName.textContent = `${name} (${prefix})`;
    modal.classList.add('active');
    svgPreviewContainer.innerHTML = '<p>Carregando...</p>';

    try {
        const response = await fetch(`https://api.iconify.design/${iconRef}.svg`);
        if (!response.ok) throw new Error('Falha ao buscar ícone');
        
        let svgText = await response.text();
        svgText = svgText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        svgText = svgText.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

        svgPreviewContainer.innerHTML = svgText;
        normalizeSvg(svgPreviewContainer.querySelector('svg'));
        updatePreview();
    } catch (error) {
        svgPreviewContainer.innerHTML = '<p style="color: var(--accent-color);">Erro ao carregar. Tente outro.</p>';
        console.error(error);
    }
}

function normalizeSvg(svgElement) {
    if (!svgElement) return;
    
    // Remove dimensões fixas
    svgElement.removeAttribute('width');
    svgElement.removeAttribute('height');
    
    // Configura o SVG para herdar cor
    svgElement.style.color = state.color;
    svgElement.style.strokeWidth = `${state.strokeWidth}px`;
    svgElement.setAttribute('stroke-linecap', 'round');
    svgElement.setAttribute('stroke-linejoin', 'round');

    const shapes = svgElement.querySelectorAll('path, circle, rect, polygon, polyline, line, ellipse');
    
    shapes.forEach(shape => {
        const originalFill = shape.getAttribute('fill');
        const originalStroke = shape.getAttribute('stroke');
        
        // DETECTA SE O ÍCONE É DE CONTORNO OU PREENCHIDO
        if (originalFill === 'none' || !originalFill) {
            // ÍCONE DE CONTORNO: mantém vazio
            shape.setAttribute('fill', 'none');
            shape.setAttribute('stroke', 'currentColor');
        } else if (originalFill && originalFill !== 'none') {
            // ÍCONE PREENCHIDO: usa a cor mas SEM stroke para não distorcer
            shape.setAttribute('fill', 'currentColor');
            // Só aplica stroke se o ícone original já tinha stroke
            if (originalStroke && originalStroke !== 'none') {
                shape.setAttribute('stroke', 'currentColor');
            } else {
                shape.setAttribute('stroke', 'none');
            }
        }
    });
}

// que odio desse codigo de normalizar pqp

function updatePreview() {
    const svgElement = svgPreviewContainer.querySelector('svg');
    if (!svgElement) return;

    svgElement.style.width = `${state.size}px`;
    svgElement.style.height = `${state.size}px`;
    svgElement.style.color = state.color;
    svgElement.style.strokeWidth = `${state.strokeWidth}px`;

    const shapes = svgElement.querySelectorAll('path, circle, rect, polygon, polyline, line, ellipse');
    const targets = shapes.length > 0 ? shapes : [svgElement];

    targets.forEach(shape => {
        shape.setAttribute('stroke', state.color);
        shape.style.stroke = state.color;
        shape.setAttribute('stroke-width', state.strokeWidth);
        shape.style.strokeWidth = state.strokeWidth;
    });

    colorInput.value = state.color;
    colorHex.textContent = state.color;
    sizeInput.value = state.size;
    sizeValue.textContent = state.size;
    strokeInput.value = state.strokeWidth;
    strokeValue.textContent = state.strokeWidth;
}

function generateCopyCode() {
    const svgElement = svgPreviewContainer.querySelector('svg');
    if (!svgElement) return '';

    const clone = svgElement.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', state.size);
    clone.setAttribute('height', state.size);
    
    // Fixa a cor real no SVG clonado para evitar problemas com 'currentColor' ao colar
    clone.style.color = state.color;
    
    const shapes = clone.querySelectorAll('path, circle, rect, polygon, polyline, line, ellipse');
    shapes.forEach(shape => {
        if (shape.getAttribute('fill') === 'currentColor') {
            shape.setAttribute('fill', state.color);
        }
        if (shape.getAttribute('stroke') === 'currentColor') {
            shape.setAttribute('stroke', state.color);
        }
        // Remove estilos inline de cor para deixar o código limpo, já que os atributos estão definidos
        shape.style.fill = '';
        shape.style.stroke = '';
    });
    clone.style.color = ''; // Limpa o estilo inline do pai, pois os filhos já têm a cor fixa

    if (state.format === 'svg') {
        return formatSVG(clone.outerHTML);
    } else {
        const svgString = encodeURIComponent(clone.outerHTML);
        return `<img src="data:image/svg+xml;utf8,${svgString}" alt="${state.currentIcon}" width="${state.size}" height="${state.size}">`;
    }
}

function formatSVG(svgString) {
    let formatted = svgString;
    // Adiciona quebra de linha antes de cada tag de fechamento ou abertura (exceto a primeira)
    formatted = formatted.replace(/></g, '>\n<');
    // Indenta as linhas
    let indent = 0;
    formatted = formatted.split('\n').map(line => {
        line = line.trim();
        if (line.match(/^<\/\w/)) indent -= 1; // Tag de fechamento
        let padding = '  '.repeat(Math.max(0, indent));
        if (line.match(/^<\w[^>]*[^\/]>.*$/)) indent += 1; // Tag de abertura sem auto-fechamento
        return padding + line;
    }).join('\n');
    return formatted.trim();
}

function downloadSVG() {
    const code = generateCopyCode();
    if (!code) return;

    const blob = new Blob([code], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.currentPrefix}-${state.currentIcon}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`Arquivo ${state.currentIcon}.svg baixado!`);
}

closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

colorInput.addEventListener('input', (e) => { state.color = e.target.value; updatePreview(); });
sizeInput.addEventListener('input', (e) => { state.size = parseInt(e.target.value, 10); updatePreview(); });
strokeInput.addEventListener('input', (e) => { state.strokeWidth = parseFloat(e.target.value); updatePreview(); });

formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        formatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.format = btn.dataset.format;
    });
});

// Listener das abas com salvamento no localStorage
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        
        // SALVA O FILTRO NO LOCALSTORAGE
        localStorage.setItem('activeFilter', activeFilter);
        
        const currentSearch = document.getElementById('search-input').value;
        renderIcons(currentSearch);
    });
});

copyCustomBtn.addEventListener('click', async () => {
    const code = generateCopyCode();
    try {
        await navigator.clipboard.writeText(code);
        showToast(`Código ${state.format.toUpperCase()} copiado!`);
    } catch (err) {
        showToast('Erro ao copiar.', true);
    }
});

downloadSvgBtn.addEventListener('click', downloadSVG);

document.getElementById('search-input').addEventListener('input', (e) => {
    renderIcons(e.target.value);
});

window.addEventListener('DOMContentLoaded', () => {
    // 1. Carregar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.setAttribute('data-lucide', savedTheme === 'light' ? 'moon' : 'sun');
    }

    // 2. Atualizar UI da aba ativa baseada no filtro salvo
    tabBtns.forEach(btn => {
        if (btn.dataset.filter === activeFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 3. Renderizar
    updateTabCounts();
    renderIcons();
    if (typeof lucide !== 'undefined') lucide.createIcons(); 
    
    // 4. Listener do botão de tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const icon = themeToggle.querySelector('.theme-icon');
            if (icon) {
                icon.setAttribute('data-lucide', newTheme === 'light' ? 'moon' : 'sun');
                lucide.createIcons();
            }
        });
    }
        // 5. Atalhos de Teclado
    document.addEventListener('keydown', (e) => {
        const searchInput = document.getElementById('search-input');
        const isModalActive = modal.classList.contains('active');
        const isTyping = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';

        // ESC para fechar o modal
        if (e.key === 'Escape' && isModalActive) {
            modal.classList.remove('active');
        }

        // '/' para focar na busca (se não estiver digitando em outro lugar)
        if (e.key === '/' && !isTyping && !isModalActive) {
            e.preventDefault();
            searchInput.focus();
        }

        // Ctrl+K (ou Cmd+K no Mac) para focar na busca
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
    });
    
});

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const icon = toast.querySelector('.toast-icon');
    
    toastMessage.textContent = message;
    if (typeof lucide !== 'undefined') {
        icon.setAttribute('data-lucide', isError ? 'x-circle' : 'check-circle');
        lucide.createIcons();
    }
    icon.style.color = isError ? '#ff4757' : '#2ecc71';
    
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}