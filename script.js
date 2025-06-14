document.addEventListener('DOMContentLoaded', () => {
    const arabicTextElement = document.getElementById('arabic-text');
    const ayahInfoElement = document.getElementById('ayah-info');
    const translationTextElement = document.getElementById('translation-text');
    const languageSelectElement = document.getElementById('language-select');
    const newAyahButton = document.getElementById('new-ayah-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    const ayahDisplayElement = document.getElementById('ayah-display');

    let quranData = [];
    let translationOptions = {};
    let currentVerse = null;
    
    // Языки с письмом справа налево для установки dir="rtl" на тексте перевода
    const rtlLanguages = ['ar', 'fa', 'ur', 'dv', 'he', 'sd', 'ps', 'ku', 'ug', 'yi']; // Дополните при необходимости

    async function loadData() {
        try {
            loadingIndicator.style.display = 'block';
            ayahDisplayElement.style.display = 'none';

            const response = await fetch('./quran_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            quranData = data.verses;
            translationOptions = data.translation_options;
            
            populateLanguageSelector();
            // Загружаем сохраненный язык или устанавливаем первый доступный
            const savedLang = localStorage.getItem('selectedLanguage');
            if (savedLang && translationOptions[savedLang]) {
                languageSelectElement.value = savedLang;
            } else if (Object.keys(translationOptions).length > 0) {
                languageSelectElement.value = Object.keys(translationOptions)[0]; // Первый по списку
            }
            
            displayRandomVerse();

            loadingIndicator.style.display = 'none';
            ayahDisplayElement.style.display = 'block';

        } catch (error) {
            console.error("Failed to load Quran data:", error);
            loadingIndicator.innerHTML = '<p>Не удалось загрузить данные. Пожалуйста, проверьте консоль или попробуйте обновить страницу.</p>';
            loadingIndicator.style.color = 'red';
        }
    }

    function populateLanguageSelector() {
        // Сортируем опции по названию для лучшего UX
        const sortedOptions = Object.entries(translationOptions)
                                    .sort(([,a],[,b]) => a.localeCompare(b));
        
        sortedOptions.forEach(([key, prettyName]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = prettyName;
            languageSelectElement.appendChild(option);
        });
    }

    function displayRandomVerse() {
        if (quranData.length === 0) return;

        const randomIndex = Math.floor(Math.random() * quranData.length);
        currentVerse = quranData[randomIndex];

        arabicTextElement.textContent = currentVerse.arabic_text;
        ayahInfoElement.textContent = `Сура ${currentVerse.surah_name_ar} (${currentVerse.surah_name_en}) | Аят ${currentVerse.surah_number}:${currentVerse.ayah_number}`;
        
        updateTranslationDisplay();
    }

    function updateTranslationDisplay() {
        if (!currentVerse) return;

        const selectedLanguageKey = languageSelectElement.value;
        const translation = currentVerse.translations[selectedLanguageKey];

        if (translation) {
            translationTextElement.textContent = translation;
            // Проверяем, является ли язык RTL
            const langCode = selectedLanguageKey.split('-')[1]; // e.g., 'ar' from 'translation-ar-jalalayn'
            if (rtlLanguages.includes(langCode)) {
                translationTextElement.setAttribute('dir', 'rtl');
            } else {
                translationTextElement.setAttribute('dir', 'ltr');
            }
        } else {
            translationTextElement.textContent = "Перевод для этого аята на выбранный язык отсутствует.";
            translationTextElement.setAttribute('dir', 'ltr'); // По умолчанию
        }
        localStorage.setItem('selectedLanguage', selectedLanguageKey); // Сохраняем выбор пользователя
    }

    newAyahButton.addEventListener('click', displayRandomVerse);
    languageSelectElement.addEventListener('change', updateTranslationDisplay);

    loadData();
});
