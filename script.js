const iconsContainer = document.getElementById('icons-container');
const copyOptions = document.getElementById('copy-options');
const copySvgButton = document.getElementById('copy-svg');
let currentIcon = null;

// Lista de ícones do Google Material (em grande quantidade)
const iconNames = [
    "home", "search", "account_circle", "alarm", "settings", "thumb_up", "favorite", "star", "access_alarm", 
    "lock", "person", "map", "call", "email", "done", "camera", "flight_takeoff", "hotel", "group", "directions",
    "accessibility", "report", "bug_report", "chat", "computer", "keyboard", "print", "radio", "school", "sports", 
    "brightness_7", "location_on", "share", "insert_chart", "calendar_today", "dashboard", "settings_ethernet", 
    "devices_other", "event", "feedback", "g_translate", "insert_drive_file", "language", "live_tv", "lock_open", 
    "mail", "manage_accounts", "music_note", "nightlight_round", "person_add", "photo_camera", "search_off", 
    "shield", "shopping_cart", "visibility", "volume_up", "wifi", "filter_vintage", "add_circle", "camera_alt", 
    "cloud", "cloud_download", "cloud_upload", "delete", "devices", "file_copy", "fingerprint", "hd", "highlight_off",
    "history", "home_work", "hotel", "insert_chart_outlined", "keyboard_arrow_down", "keyboard_arrow_left", 
    "keyboard_arrow_right", "keyboard_arrow_up", "laptop", "location_city", "lock_outline", "lock_open", "mail_outline", 
    "manage_search", "memory", "mobile_friendly", "mobile_off", "monitor", "music_video", "notification", 
    "notifications_active", "notifications_none", "notifications_off", "notifications_paused", "offline_bolt", 
    "offline_pin", "online_prediction", "palette", "payment", "people", "people_alt", "people_outline", "pets", 
    "picture_in_picture", "power_settings_new", "radio_button_checked", "radio_button_unchecked", "replay", 
    "restore", "search_off", "settings_backup_restore", "shopping_basket", "shopping_cart", "star_border", 
    "star_half", "star_outline", "subdirectory_arrow_left", "subdirectory_arrow_right", "supervised_user_circle", 
    "task_alt", "traffic", "translate", "tune", "update", "verified", "visibility_off", "volume_down", 
    "volume_mute", "vpn_key", "wifi_off", "wifi_tethering", "zoom_in", "zoom_out", "error","new_releases"
];

// URL base para os ícones do Google Material
const baseIconUrl = "https://fonts.gstatic.com/s/i/materialicons/";

// Função para gerar a URL do ícone SVG
function getIconUrl(iconName) {
    return `${baseIconUrl}${iconName}/v7/24px.svg`; // URL padrão para os ícones SVG
}

// Função para exibir os ícones na página
function loadIcons() {
    iconNames.forEach(icon => {
        const iconElement = document.createElement('div');
        iconElement.classList.add('icon');

        const imgElement = document.createElement('img');
        imgElement.src = getIconUrl(icon);
        imgElement.alt = icon;
        iconElement.appendChild(imgElement);

        iconElement.addEventListener('click', () => {
            currentIcon = icon;
            copyOptions.style.display = 'block';
        });

        iconsContainer.appendChild(iconElement);
    });
}

// Função para copiar o ícone como SVG
function copyAsSvg() {
    const svgUrl = getIconUrl(currentIcon);
    fetch(svgUrl)
        .then(response => response.text())
        .then(svg => {
            const tempInput = document.createElement('textarea');
            document.body.appendChild(tempInput);
            tempInput.value = svg;
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            alert(`Ícone ${currentIcon} copiado como SVG!`);
        })
        .catch(error => alert('Erro ao copiar o SVG.'));
}

copySvgButton.addEventListener('click', copyAsSvg);

// Carregar os ícones ao carregar a página
window.onload = loadIcons;