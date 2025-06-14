document.addEventListener('DOMContentLoaded', () => {
    const arabicTextElement = document.getElementById('arabic-text');
    const ayahInfoElement = document.getElementById('ayah-info');
    const translationTextElement = document.getElementById('translation-text');
    const languageSelectElement = document.getElementById('language-select');
    const newAyahButton = document.getElementById('new-ayah-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    const ayahDisplayElement = document.getElementById('ayah-display');
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const themeIcon = themeToggleButton.querySelector('i');
    const showSurahContextButton = document.getElementById('show-surah-context-button');
    const hideSurahContextButton = document.getElementById('hide-surah-context-button');
    const surahContextDisplay = document.getElementById('surah-context-display');
    const surahContextInfo = document.getElementById('surah-context-info');
    const surahContentElement = document.getElementById('surah-content-dynamic-area');
    const favoriteAyahButton = document.getElementById('favorite-ayah-button');
    const favoritesButton = document.getElementById('favorites-button');
    const favoritesModal = document.getElementById('favorites-modal');
    const closeFavoritesModalButton = document.getElementById('close-favorites-modal');
    const favoritesListDiv = document.getElementById('favorites-list');

    let quranData = []; 
    let quranDataBySurah = {}; 
    let translationOptions = {}; 
    let currentVerse = null;
    let currentDisplayedSurahNumber = null;
    let favorites = JSON.parse(localStorage.getItem('favoriteAyahs')) || [];

    const rtlLanguages = ['ar', 'fa', 'ur', 'dv', 'he', 'sd', 'ps', 'ku', 'ug', 'yi'];
    
    const baseEnStrings = {
        siteTitle: "Random Ayah", headerTitle: "آية اليوم - Ayah of the Day", langLabel: "Translation Language:",
        newAyahButton: "New Ayah", loadingText: "Loading Quran data...",
        loadingSmallText: "(This may take some time)",
        showSurahContextButton: "Show Surah Context (current ayah will be highlighted)", surahContextTitle: "Surah Context",
        hideSurahContextButton: "Hide Context", translationMissing: "Translation not available.",
        surahTooLargePrefix: "This Surah contains", ayah: "Ayah", 
        surahTooLargeSuffix: "verses. Displaying 5 verses before and 25 after the current one.",
        toggleThemeAriaLight: "Switch to dark theme", toggleThemeAriaDark: "Switch to light theme",
        createdBy: "Created with", dataSource: "Data from dataset", loadingError: "Failed to load data.",
        addToFavoritesAria: "Add to favorites", removeFromFavoritesAria: "Remove from favorites",
        showFavoritesAria: "Show favorites", closeAria: "Close", favoritesTitle: "Favorite Ayahs",
        noFavoritesYet: "You have no favorite ayahs yet.", removeFavorite: "Remove"
    };

    const localizedStrings = {
        'ru': { 
            ...baseEnStrings, 
            siteTitle: "Случайный Аят", langLabel: "Язык перевода:", newAyahButton: "Новый Аят",
            loadingText: "Загрузка данных Корана...", loadingSmallText: "(Это может занять некоторое время)",
            showSurahContextButton: "Показать контекст суры (текущий аят будет выделен)", surahContextTitle: "Контекст Суры",
            hideSurahContextButton: "Скрыть контекст", translationMissing: "Перевод отсутствует.",
            surahTooLargePrefix: "Эта сура содержит", ayah: "Аят", 
            surahTooLargeSuffix: "аятов. Показаны 5 аятов до и 25 после текущего.",
            toggleThemeAriaLight: "Переключить на темную тему", toggleThemeAriaDark: "Переключить на светлую тему",
            createdBy: "Создано с", dataSource: "Данные из датасета", loadingError: "Не удалось загрузить данные.",
            addToFavoritesAria: "Добавить в избранное", removeFromFavoritesAria: "Удалить из избранного",
            showFavoritesAria: "Показать избранное", closeAria: "Закрыть", favoritesTitle: "Избранные Аяты",
            noFavoritesYet: "У вас пока нет избранных аятов.", removeFavorite: "Удалить"
        },
        'en': { ...baseEnStrings },
    };

    function generatePartialLocalizations(options) {
        const langToSurahAyah = { 
            'ar': { surah: 'سورة', ayah: 'آية' }, 'tr': { surah: 'Sûre', ayah: 'Âyet' },
            'fr': { surah: 'Sourate', ayah: 'Verset' }, 'de': { surah: 'Sure', ayah: 'Vers' },
            'es': { surah: 'Sura', ayah: 'Aya' }, 'id': { surah: 'Surah', ayah: 'Ayat' },
            'fa': { surah: 'سوره', ayah: 'آیه' }, 'ur': { surah: 'سورۃ', ayah: 'آیت' },
            'bn': { surah: 'সূরা', ayah: 'আয়াত' }, 'hi': { surah: 'सूरह', ayah: 'आयत' },
            'zh': { surah: '章', ayah: '节' },
        };
        for (const key in options) {
            const langCode = key.split('-')[1];
            if (langCode && !localizedStrings[langCode]) { 
                localizedStrings[langCode] = { ...baseEnStrings, ...(langToSurahAyah[langCode] || { surah: baseEnStrings.surah, ayah: baseEnStrings.ayah }) };
            } else if (langCode && localizedStrings[langCode]) {
                 localizedStrings[langCode].surah = (langToSurahAyah[langCode]?.surah) || localizedStrings[langCode].surah || baseEnStrings.surah;
                 localizedStrings[langCode].ayah = (langToSurahAyah[langCode]?.ayah) || localizedStrings[langCode].ayah || baseEnStrings.ayah;
                 localizedStrings[langCode].showSurahContextButton = localizedStrings[langCode].showSurahContextButton || baseEnStrings.showSurahContextButton;
            }
        }
    }

    function getCurrentLangCode() {
        if (languageSelectElement.options.length > 0 && languageSelectElement.value) {
            return languageSelectElement.value.split('-')[1] || 'ru';
        }
        return 'ru'; 
    }

    function getLocaleStrings() {
        const langCode = getCurrentLangCode();
        return localizedStrings[langCode] || localizedStrings['en'] || {};
    }
    
    function showLoading(isLoading, isError = false, errorMessage = '') {
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
        ayahDisplayElement.style.display = isLoading ? 'none' : (isError ? 'none' : 'block');
        if(surahContextDisplay) surahContextDisplay.style.display = 'none';
        if(showSurahContextButton) showSurahContextButton.style.display = isLoading ? 'none' : (isError ? 'none' : 'inline-block');

        if(isError) {
            const loc = getLocaleStrings();
            let msg = loc.loadingError || 'Failed to load data.';
            if (errorMessage) msg += ` Details: ${errorMessage.substring(0,150)}`;
            loadingIndicator.innerHTML = `<p>${msg}</p>`;
            loadingIndicator.style.color = 'red';
            loadingIndicator.style.display = 'block';
        } else if (isLoading) {
            const loc = getLocaleStrings();
            loadingIndicator.innerHTML = `<p><span data-localize="loadingText">${loc.loadingText || baseEnStrings.loadingText}</span> <i class="fas fa-spinner fa-spin"></i></p>
                                          <p><small data-localize="loadingSmallText">${loc.loadingSmallText || baseEnStrings.loadingSmallText}</small></p>`;
            loadingIndicator.style.color = 'inherit';
        }
    }
    
    function applyLocalization() {
        const loc = getLocaleStrings();
        const langCode = getCurrentLangCode(); 
        document.documentElement.lang = langCode; 
        document.querySelectorAll('[data-localize]').forEach(el => {
            const key = el.dataset.localize;
            el.textContent = loc[key] || baseEnStrings[key] || `[${key}]`;
        });
        document.querySelectorAll('[data-localize-aria]').forEach(el => {
            const key = el.dataset.localizeAria;
            el.setAttribute('aria-label', loc[key] || baseEnStrings[key] || `[${key}]`);
        });
        const isDark = document.body.classList.contains('dark-theme');
        const toggleThemeAriaKey = isDark ? 'toggleThemeAriaDark' : 'toggleThemeAriaLight';
        themeToggleButton.setAttribute('aria-label', loc[toggleThemeAriaKey] || baseEnStrings[toggleThemeAriaKey]);
        updateFavoriteButtonState();
        if (currentVerse) updateAyahInfo();
    }

    function populateLanguageSelector() {
        languageSelectElement.innerHTML = ''; 
        const sortedOptions = Object.entries(translationOptions)
                                    .sort(([,a],[,b]) => typeof a === 'string' && typeof b === 'string' ? a.localeCompare(b) : 0);
        sortedOptions.forEach(([key, prettyName]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = prettyName;
            languageSelectElement.appendChild(option);
        });
        const savedLang = localStorage.getItem('selectedLanguage');
        if (savedLang && translationOptions[savedLang]) {
            languageSelectElement.value = savedLang;
        } else if (sortedOptions.length > 0) {
            languageSelectElement.value = sortedOptions[0][0]; 
        }
    }
    
    function updateAyahInfo() {
        if (!currentVerse) return;
        const loc = getLocaleStrings();
        const surahString = loc.surah || baseEnStrings.surah; 
        const ayahString = loc.ayah || baseEnStrings.ayah;   
        ayahInfoElement.textContent = `${surahString} ${currentVerse.surah_name_ar} (${currentVerse.surah_name_en}) | ${ayahString} ${currentVerse.surah_number}:${currentVerse.ayah_number}`;
    }

    function displayRandomVerse() {
        if (!quranData || quranData.length === 0) return;
        const randomIndex = Math.floor(Math.random() * quranData.length);
        currentVerse = quranData[randomIndex];
        arabicTextElement.textContent = currentVerse.arabic_text;
        updateAyahInfo();
        updateTranslationDisplay();
        updateFavoriteButtonState();
        ayahDisplayElement.style.display = 'block';
        if (showSurahContextButton) {
            const loc = getLocaleStrings();
            showSurahContextButton.textContent = loc.showSurahContextButton || baseEnStrings.showSurahContextButton;
            showSurahContextButton.style.display = 'inline-block'; 
        }
        if (surahContextDisplay) surahContextDisplay.style.display = 'none'; 
        currentDisplayedSurahNumber = null; 
    }

    function updateTranslationDisplay() {
        if (!currentVerse) return;
        const selectedLanguageKey = languageSelectElement.value; 
        localStorage.setItem('selectedLanguage', selectedLanguageKey); 
        const translation = currentVerse.translations[selectedLanguageKey];
        const loc = getLocaleStrings();
        if (translation) {
            translationTextElement.textContent = translation;
            const langCodeForDir = selectedLanguageKey.split('-')[1];
            translationTextElement.setAttribute('dir', rtlLanguages.includes(langCodeForDir) ? 'rtl' : 'ltr');
        } else {
            translationTextElement.textContent = loc.translationMissing || baseEnStrings.translationMissing;
            translationTextElement.setAttribute('dir', 'ltr');
        }
        updateAyahInfo(); 
    }
    
    function displaySurahContext() {
        if (!currentVerse || !quranDataBySurah[currentVerse.surah_number] || !surahContentElement) return;
        const surahAyahs = quranDataBySurah[currentVerse.surah_number];
        const totalAyahsInSurah = surahAyahs.length;
        let ayahsToShow = surahAyahs;
        let contextMessage = "";
        const loc = getLocaleStrings();
        const defaultTranslationMissing = loc.translationMissing || baseEnStrings.translationMissing;
        if (totalAyahsInSurah > 50) {
            const prefix = loc.surahTooLargePrefix || baseEnStrings.surahTooLargePrefix;
            const ayahLocString = (loc.ayah || baseEnStrings.ayah).toLowerCase();
            const suffix = loc.surahTooLargeSuffix || baseEnStrings.surahTooLargeSuffix;
            contextMessage = `${prefix} ${totalAyahsInSurah} ${ayahLocString}. ${suffix}`;
            const currentIndex = surahAyahs.findIndex(v => v.ayah_number === currentVerse.ayah_number);
            const start = Math.max(0, currentIndex - 5);
            const end = Math.min(totalAyahsInSurah, currentIndex + 25 + 1);
            ayahsToShow = surahAyahs.slice(start, end);
        }
        surahContextInfo.textContent = contextMessage;
        surahContextInfo.style.display = contextMessage ? 'block' : 'none';
        surahContentElement.innerHTML = ''; 
        const selectedTranslationKey = languageSelectElement.value;
        ayahsToShow.forEach(ayah => {
            const ayahRowDiv = document.createElement('div');
            ayahRowDiv.classList.add('surah-ayah-row');
            const arabicColDiv = document.createElement('div');
            arabicColDiv.classList.add('surah-ayah-arabic');
            arabicColDiv.dir = 'rtl';
            const pArabic = document.createElement('p');
            pArabic.textContent = `${ayah.arabic_text} (${ayah.ayah_number})`;
            arabicColDiv.appendChild(pArabic);
            const translationColDiv = document.createElement('div');
            translationColDiv.classList.add('surah-ayah-translation');
            const pTranslation = document.createElement('p');
            const translationText = ayah.translations[selectedTranslationKey] || defaultTranslationMissing;
            pTranslation.textContent = `${translationText} (${ayah.ayah_number})`;
            translationColDiv.appendChild(pTranslation);
            if (ayah.ayah_number === currentVerse.ayah_number && ayah.surah_number === currentVerse.surah_number) {
                ayahRowDiv.classList.add('highlighted-ayah-row');
            }
            ayahRowDiv.appendChild(arabicColDiv);
            ayahRowDiv.appendChild(translationColDiv);
            surahContentElement.appendChild(ayahRowDiv);
        });
        surahContextDisplay.style.display = 'block';
        currentDisplayedSurahNumber = currentVerse.surah_number;
        showSurahContextButton.textContent = loc.hideSurahContextButton || baseEnStrings.hideSurahContextButton;
    }

    function hideSurahContext() {
        surahContextDisplay.style.display = 'none';
        currentDisplayedSurahNumber = null;
        const loc = getLocaleStrings();
        showSurahContextButton.textContent = loc.showSurahContextButton || baseEnStrings.showSurahContextButton;
    }
    
    function applyTheme(theme) {
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-theme', isDark);
        themeIcon.classList.toggle('fa-sun', isDark);
        themeIcon.classList.toggle('fa-moon', !isDark);
        const loc = getLocaleStrings();
        const ariaLabelKey = isDark ? 'toggleThemeAriaDark' : 'toggleThemeAriaLight';
        themeToggleButton.setAttribute('aria-label', loc[ariaLabelKey] || baseEnStrings[ariaLabelKey]);
        localStorage.setItem('theme', theme);
    }

    function toggleFavorite() {
        if (!currentVerse) return;
        const verseId = `${currentVerse.surah_number}:${currentVerse.ayah_number}`;
        const favoriteIndex = favorites.findIndex(fav => fav.id === verseId);
        if (favoriteIndex > -1) {
            favorites.splice(favoriteIndex, 1);
        } else {
            favorites.push({ id: verseId, verse: JSON.parse(JSON.stringify(currentVerse)) });
        }
        localStorage.setItem('favoriteAyahs', JSON.stringify(favorites));
        updateFavoriteButtonState();
    }

    function updateFavoriteButtonState() {
        if (!currentVerse || !favoriteAyahButton) return;
        const verseId = `${currentVerse.surah_number}:${currentVerse.ayah_number}`;
        const isFavorited = favorites.some(fav => fav.id === verseId);
        favoriteAyahButton.classList.toggle('favorited', isFavorited);
        const icon = favoriteAyahButton.querySelector('i');
        if (icon) {
            icon.classList.toggle('far', !isFavorited); // empty heart
            icon.classList.toggle('fas', isFavorited);  // solid heart
        }
        const loc = getLocaleStrings();
        const ariaLabelKey = isFavorited ? 'removeFromFavoritesAria' : 'addToFavoritesAria';
        favoriteAyahButton.setAttribute('aria-label', loc[ariaLabelKey] || baseEnStrings[ariaLabelKey]);
    }

    function displayFavorites() {
        favoritesListDiv.innerHTML = '';
        const loc = getLocaleStrings();
        const selectedLanguageKey = languageSelectElement.value;
        if (favorites.length === 0) {
            favoritesListDiv.innerHTML = `<p>${loc.noFavoritesYet || baseEnStrings.noFavoritesYet}</p>`;
        } else {
            favorites.forEach(fav => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'favorite-item';
                const verse = fav.verse;
                const info = document.createElement('p');
                info.className = 'favorite-item-info';
                info.textContent = `${loc.surah || baseEnStrings.surah} ${verse.surah_name_ar} (${verse.surah_name_en}) | ${loc.ayah || baseEnStrings.ayah} ${verse.surah_number}:${verse.ayah_number}`;
                const arabic = document.createElement('p');
                arabic.className = 'favorite-item-arabic';
                arabic.textContent = verse.arabic_text;
                const translation = document.createElement('p');
                translation.className = 'favorite-item-translation';
                translation.textContent = verse.translations[selectedLanguageKey] || loc.translationMissing || baseEnStrings.translationMissing;
                const removeButton = document.createElement('button');
                removeButton.className = 'favorite-item-remove-button';
                removeButton.textContent = loc.removeFavorite || baseEnStrings.removeFavorite;
                removeButton.onclick = () => { removeFavorite(fav.id); };
                itemDiv.append(info, arabic, translation, removeButton);
                favoritesListDiv.appendChild(itemDiv);
            });
        }
        favoritesModal.style.display = 'flex';
    }

    function removeFavorite(verseId) {
        favorites = favorites.filter(fav => fav.id !== verseId);
        localStorage.setItem('favoriteAyahs', JSON.stringify(favorites));
        displayFavorites(); 
        updateFavoriteButtonState(); 
    }

    async function loadData() {
        showLoading(true);
        try {
            const response = await fetch('quran_data.json'); 
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            quranData = data.verses || [];
            translationOptions = data.translation_options || {};
            generatePartialLocalizations(translationOptions); 
            quranDataBySurah = quranData.reduce((acc, verse) => {
                if (!acc[verse.surah_number]) acc[verse.surah_number] = [];
                acc[verse.surah_number].push(verse);
                return acc;
            }, {});
            for (const surahNum in quranDataBySurah) {
                quranDataBySurah[surahNum].sort((a, b) => a.ayah_number - b.ayah_number);
            }
            populateLanguageSelector(); 
            const savedLang = localStorage.getItem('selectedLanguage');
            if (savedLang && translationOptions[savedLang]) {
                languageSelectElement.value = savedLang;
            } else if (Object.keys(translationOptions).length > 0) {
                languageSelectElement.value = Object.keys(translationOptions)[0];
            }
            applyLocalization(); 
            displayRandomVerse(); 
            showLoading(false);
        } catch (error) {
            console.error("Failed to load Quran data:", error);
            showLoading(false, true, error.message); 
        }
    }

    loadData(); 
    newAyahButton.addEventListener('click', displayRandomVerse);
    languageSelectElement.addEventListener('change', () => {
        applyLocalization(); 
        updateTranslationDisplay(); 
        if (surahContextDisplay.style.display === 'block' && currentDisplayedSurahNumber) {
            if(currentVerse && currentVerse.surah_number === currentDisplayedSurahNumber) {
                displaySurahContext();
            } else {
                hideSurahContext(); 
            }
        }
    });
    themeToggleButton.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });

    if(showSurahContextButton) {
        showSurahContextButton.addEventListener('click', () => {
            if (surahContextDisplay.style.display === 'block') {
                hideSurahContext();
            } else {
                displaySurahContext();
            }
        });
    }
    if(hideSurahContextButton) {
        hideSurahContextButton.addEventListener('click', hideSurahContext);
    }
    if (favoriteAyahButton) {
        favoriteAyahButton.addEventListener('click', toggleFavorite);
    }
    if (favoritesButton) {
        favoritesButton.addEventListener('click', displayFavorites);
    }
    if (closeFavoritesModalButton) {
        closeFavoritesModalButton.addEventListener('click', () => {
            if(favoritesModal) favoritesModal.style.display = 'none';
        });
    }
    window.addEventListener('click', (event) => {
        if (event.target === favoritesModal) {
            if(favoritesModal) favoritesModal.style.display = 'none';
        }
    });
    const preferredColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const savedTheme = localStorage.getItem('theme') || preferredColorScheme;
    applyTheme(savedTheme);
});