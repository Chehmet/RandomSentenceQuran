document.addEventListener('DOMContentLoaded', () => {
    const arabicTextElement = document.getElementById('arabic-text');
    const ayahInfoElement = document.getElementById('ayah-info');
    const translationTextElement = document.getElementById('translation-text');
    const languageSelectElement = document.getElementById('language-select');
    const newAyahButton = document.getElementById('new-ayah-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    const ayahDisplayElement = document.getElementById('ayah-display');
    const themeToggleButton = document.getElementById('theme-toggle-button'); // Эта кнопка теперь в хедере
    const themeIcon = themeToggleButton.querySelector('i');
    const languageLabel = document.querySelector('label[for="language-select"]');

    let quranData = [];
    let translationOptions = {};
    let currentVerse = null;
    let mainDataLoaded = false;
    let placeholderAyahIndex = -1;

    const rtlLanguages = ['ar', 'fa', 'ur', 'dv', 'he', 'sd', 'ps', 'ku', 'ug', 'yi'];
    
    // ВАЖНО: ЗАПОЛНИТЕ ЭТОТ ОБЪЕКТ СТРОКАМИ ДЛЯ РАЗНЫХ ЯЗЫКОВ
    const localizedStrings = { 
        'ru': { surah: 'Сура', ayah: 'Аят', langLabel: 'Язык перевода:', newAyah: 'Новый Аят', loading: 'Загрузка данных Корана...', loadingSmall: '(Это может занять некоторое время)', loadingError: 'Не удалось загрузить данные.', loadingFullList: 'Загрузка полного списка аятов...' },
        'en': { surah: 'Surah', ayah: 'Ayah', langLabel: 'Translation Language:', newAyah: 'New Ayah', loading: 'Loading Quran data...', loadingSmall: '(This may take some time)', loadingError: 'Failed to load data.', loadingFullList: 'Loading full list of ayahs...' },
        // ... добавьте другие языки
    };

    // ВАЖНО: ЗАПОЛНИТЕ ЭТОТ МАССИВ ВАШИМИ 10 АЯТАМИ И ПЕРЕВОДАМИ
    const placeholderAyahs = [
        {
            surah_number: 2, ayah_number: 255, surah_name_ar: "البقرة", surah_name_en: "Al-Baqara",
            arabic_text: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ",
            translations: {
                "translation-ru-kuliev-alsaadi": "Аллах — нет божества, кроме Него, Живого, Поддерживающего жизнь. Им не овладевают ни дремота, ни сон. Ему принадлежит то, что на небесах, и то, что на земле. Кто станет заступаться перед Ним без Его дозволения? Он знает их будущее и прошлое. Они постигают из Его знания только то, что Он пожелает. Его Престол объемлет небеса и землю, и не тяготит Его оберегание их. Он — Возвышенный, Великий.",
                "translation-en-sahih": "Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence...",
            }
        },
        
    ];

    function displayPlaceholderAyah() {
        if (placeholderAyahs.length === 0) {
            ayahDisplayElement.style.display = 'none';
            loadingIndicator.style.display = 'block';
            return;
        }
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * placeholderAyahs.length);
        } while (placeholderAyahs.length > 1 && randomIndex === placeholderAyahIndex);
        placeholderAyahIndex = randomIndex;
        
        currentVerse = placeholderAyahs[randomIndex];

        arabicTextElement.textContent = currentVerse.arabic_text;
        updateAyahInfo(); 
        updateTranslationDisplay(); 

        ayahDisplayElement.style.display = 'block';
        loadingIndicator.style.display = 'none'; 
    }

    async function loadData() {
        const langCodeForLoading = (localStorage.getItem('selectedLanguage') || 'ru-').split('-')[1] || 'ru';
        const locForLoading = localizedStrings[langCodeForLoading] || localizedStrings['ru'];

        if (!mainDataLoaded) {
            const loadingP = loadingIndicator.querySelector('p:first-child');
            if(loadingP) loadingP.innerHTML = `${locForLoading.loadingFullList || 'Загрузка полного списка аятов...'} <i class="fas fa-spinner fa-spin"></i>`;
            loadingIndicator.style.display = 'block';
        }

        try {
            // ВАЖНО: Укажите здесь правильный путь к вашему основному JSON файлу
            // Например, если он в корне репозитория и называется 'quran_main_data.json'
            const response = await fetch('quran_data.json'); // ИЛИ ваш URL с Google Drive, если вы его используете

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText.substring(0,100)}...`);
            }
            
            const data = await response.json();
            
            quranData = data.verses || [];
            translationOptions = data.translation_options || {};
            mainDataLoaded = true; 
            
            populateLanguageSelector(); 
            const savedLang = localStorage.getItem('selectedLanguage');
            if (savedLang && translationOptions[savedLang]) {
                languageSelectElement.value = savedLang;
            } else if (Object.keys(translationOptions).length > 0) {
                languageSelectElement.value = Object.keys(translationOptions)[0];
            }
            
            displayRandomVerseFromMainData(); 
            loadingIndicator.style.display = 'none'; 
            ayahDisplayElement.style.display = 'block';

        } catch (error) {
            console.error("Failed to load Quran data:", error);
            mainDataLoaded = false; 
            const langCode = (localStorage.getItem('selectedLanguage') || 'ru-').split('-')[1] || 'ru';
            const loc = localizedStrings[langCode] || localizedStrings['ru'];
            let errorMessage = loc.loadingError || 'Не удалось загрузить данные.';
            if (error.message) {
                errorMessage += ` Детали: ${error.message.substring(0, 150)}`;
            }
            loadingIndicator.innerHTML = `<p>${errorMessage}</p>`;
            loadingIndicator.style.color = 'red';
            loadingIndicator.style.display = 'block'; 
            if (!currentVerse || !placeholderAyahs.includes(currentVerse)) {
                 ayahDisplayElement.style.display = 'none';
            }
        }
    }

    function displayRandomVerseFromMainData() {
        if (!quranData || quranData.length === 0) {
            displayPlaceholderAyah(); 
            return;
        }
        mainDataLoaded = true; 
        const randomIndex = Math.floor(Math.random() * quranData.length);
        currentVerse = quranData[randomIndex];

        arabicTextElement.textContent = currentVerse.arabic_text;
        updateAyahInfo();
        updateTranslationDisplay();
        ayahDisplayElement.style.display = 'block';
    }

    function displayRandomVerse() {
        if (mainDataLoaded && quranData && quranData.length > 0) {
            displayRandomVerseFromMainData();
        } else {
            displayPlaceholderAyah();
        }
    }

    function populateLanguageSelector() {
        languageSelectElement.innerHTML = ''; 
        
        const currentOptions = mainDataLoaded ? translationOptions : getPlaceholderTranslationOptions();
        const sortedOptions = Object.entries(currentOptions)
                                    .sort(([,a],[,b]) => typeof a === 'string' && typeof b === 'string' ? a.localeCompare(b) : 0);
        
        sortedOptions.forEach(([key, prettyName]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = prettyName;
            languageSelectElement.appendChild(option);
        });
        
        const savedLang = localStorage.getItem('selectedLanguage');
        if (savedLang && currentOptions[savedLang]) {
            languageSelectElement.value = savedLang;
        } else if (sortedOptions.length > 0) {
            languageSelectElement.value = sortedOptions[0][0]; 
        }
        if(currentVerse) updateTranslationDisplay(); 
    }

    function getPlaceholderTranslationOptions() {
        const opts = {};
        if (placeholderAyahs.length > 0 && placeholderAyahs[0].translations) {
            for (const key in placeholderAyahs[0].translations) {
                if (translationOptions && translationOptions[key]) {
                    opts[key] = translationOptions[key];
                } else { 
                    const parts = key.split('-');
                    const langPart = parts[1] ? parts[1].toUpperCase() : 'LANG';
                    const authorPart = parts.slice(2).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' & ');
                    opts[key] = `${langPart} (${authorPart || 'Default'})`;
                }
            }
        }
        if (!opts["translation-ru-kuliev-alsaadi"]) opts["translation-ru-kuliev-alsaadi"] = "Русский (Кулиев & ас-Саади)";
        if (!opts["translation-en-sahih"]) opts["translation-en-sahih"] = "English (Sahih Int.)";
        return opts;
    }
    
    function applyLocalization() {
        const selectedLanguageKey = languageSelectElement.value || 
                                  (mainDataLoaded && Object.keys(translationOptions).length > 0 ? Object.keys(translationOptions)[0] : 
                                  'translation-ru-kuliev-alsaadi'); 
        const langCode = selectedLanguageKey.split('-')[1] || 'ru';
        const loc = localizedStrings[langCode] || localizedStrings['ru'];

        if (languageLabel) languageLabel.innerHTML = `<i class="fas fa-language"></i> ${loc.langLabel || 'Язык перевода:'}`;
        if (newAyahButton) newAyahButton.innerHTML = `<i class="fas fa-sync-alt"></i> ${loc.newAyah || 'Новый Аят'}`;
        
        const loadingP = loadingIndicator.querySelector('p:first-child');
        if (!mainDataLoaded && loadingP && loc.loadingFullList) {
             loadingP.innerHTML = `${loc.loadingFullList} <i class="fas fa-spinner fa-spin"></i>`;
        } else if (!mainDataLoaded && loadingP && loc.loading) {
            loadingP.innerHTML = `${loc.loading} <i class="fas fa-spinner fa-spin"></i>`;
        }

        const loadingSmall = loadingIndicator.querySelector('p small');
        if (loadingSmall && loc.loadingSmall) loadingSmall.textContent = `(${loc.loadingSmall})`;

        if (currentVerse) updateAyahInfo();
    }

    function updateAyahInfo() {
        if (!currentVerse) return;
        const selectedLanguageKey = languageSelectElement.value || 
                                  (mainDataLoaded && Object.keys(translationOptions).length > 0 ? Object.keys(translationOptions)[0] : 
                                  'translation-ru-kuliev-alsaadi');
        const langCode = selectedLanguageKey.split('-')[1] || 'ru'; 
        const loc = localizedStrings[langCode] || localizedStrings['ru'];
        ayahInfoElement.textContent = `${loc.surah || 'Сура'} ${currentVerse.surah_name_ar} (${currentVerse.surah_name_en}) | ${loc.ayah || 'Аят'} ${currentVerse.surah_number}:${currentVerse.ayah_number}`;
    }

    function updateTranslationDisplay() {
        if (!currentVerse) return;
        const selectedLanguageKey = languageSelectElement.value || 
                                  (mainDataLoaded && Object.keys(translationOptions).length > 0 ? Object.keys(translationOptions)[0] : 
                                  (!mainDataLoaded && placeholderAyahs.length > 0 && placeholderAyahs[placeholderAyahIndex].translations ? Object.keys(placeholderAyahs[placeholderAyahIndex].translations)[0] : 'translation-ru-kuliev-alsaadi'));
        
        localStorage.setItem('selectedLanguage', selectedLanguageKey); 
        
        const translation = currentVerse.translations[selectedLanguageKey];

        if (translation) {
            translationTextElement.textContent = translation;
            const langCodeForDir = selectedLanguageKey.split('-')[1];
            translationTextElement.setAttribute('dir', rtlLanguages.includes(langCodeForDir) ? 'rtl' : 'ltr');
        } else {
            translationTextElement.textContent = mainDataLoaded ? (localizedStrings[selectedLanguageKey.split('-')[1]]?.loadingError || "Перевод отсутствует.") : "";
            translationTextElement.setAttribute('dir', 'ltr');
        }
         if (currentVerse) updateAyahInfo();
    }
    
    function applyTheme(theme) {
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-theme', isDark);
        themeIcon.classList.toggle('fa-sun', isDark);
        themeIcon.classList.toggle('fa-moon', !isDark);
        themeToggleButton.setAttribute('aria-label', isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему');
        localStorage.setItem('theme', theme);
    }

    // Инициализация
    populateLanguageSelector(); 
    displayPlaceholderAyah(); 
    applyLocalization(); 
    
    loadData(); 

    newAyahButton.addEventListener('click', displayRandomVerse);
    languageSelectElement.addEventListener('change', () => {
        updateTranslationDisplay(); 
        applyLocalization(); 
    });
    themeToggleButton.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });
    const preferredColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const savedTheme = localStorage.getItem('theme') || preferredColorScheme;
    applyTheme(savedTheme);
});