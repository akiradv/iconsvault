const iconGrid = document.querySelector('.icon-grid');

// Função para buscar ícones (exemplo fictício)
async function fetchIcons() {
    // Substitua pela URL da API que você escolher
    const response = await fetch('https://api.exemplo.com/icons');
    const icons = await response.json();
    displayIcons(icons);
}

// Função para exibir ícones
function displayIcons(icons) {
    iconGrid.innerHTML = ''; // Limpa a grid
    icons.forEach(icon => {
        const iconDiv = document.createElement('div');
        iconDiv.className = 'icon';
        iconDiv.innerHTML = `<img src="${icon.url}" alt="${icon.name}"><p>${icon.name}</p>`;
        iconGrid.appendChild(iconDiv);
    });
}

// Chama a função para buscar ícones ao carregar a página
window.onload = fetchIcons; 