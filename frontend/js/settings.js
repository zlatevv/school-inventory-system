document.addEventListener("DOMContentLoaded", () => {
    // -------------------------
    // 1. УПРАВЛЕНИЕ НА ТЕМАТА (THEME)
    // -------------------------
    const themeSelect = document.getElementById("theme-select");
    
    // Проверяваме дали има запазена тема (по подразбиране 'light')
    const currentTheme = localStorage.getItem("app-theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    if(themeSelect) themeSelect.value = currentTheme;

    // При промяна от падащото меню
    if(themeSelect) {
        themeSelect.addEventListener("change", (e) => {
            const newTheme = e.target.value;
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("app-theme", newTheme); // Запазваме за другите страници
        });
    }

    // -------------------------
    // 2. УПРАВЛЕНИЕ НА ЕЗИКА (LANGUAGE)
    // -------------------------
    const langSelect = document.getElementById("lang-select");
    
    // Речник с преводите
    const translations = {
        en: {
            settingsTitle: "System Settings",
            settingsDesc: "Manage your preferences, appearance, and personal account details.",
            appearanceTitle: "<i class='fa-solid fa-palette' style='color: #8B5CF6;'></i> Appearance & Language",
            themeLabel: "System Theme",
            langLabel: "Display Language"
        },
        bg: {
            settingsTitle: "Системни настройки",
            settingsDesc: "Управлявайте своите предпочитания, изглед и лични данни.",
            appearanceTitle: "<i class='fa-solid fa-palette' style='color: #8B5CF6;'></i> Изглед и Език",
            themeLabel: "Тема на системата",
            langLabel: "Език на системата"
        }
    };

    const currentLang = localStorage.getItem("app-lang") || "en";
    if(langSelect) langSelect.value = currentLang;
    applyTranslations(currentLang);

    if(langSelect) {
        langSelect.addEventListener("change", (e) => {
            const newLang = e.target.value;
            localStorage.setItem("app-lang", newLang);
            applyTranslations(newLang);
        });
    }

    // Функция, която обхожда всички елементи с data-i18n и им сменя текста
    function applyTranslations(lang) {
        const elements = document.querySelectorAll("[data-i18n]");
        elements.forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key]; // Използваме innerHTML заради иконите
            }
        });
    }
});