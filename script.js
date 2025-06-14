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
    const languageLabel = document.querySelector('label[for="language-select"]');


    let quranData = [];
    let translationOptions = {};
    let currentVerse = null;
    
    // Языки с письмом справа налево для установки dir="rtl" на тексте перевода
    const rtlLanguages = ['ar', 'fa', 'ur', 'dv', 'he', 'sd', 'ps', 'ku', 'ug', 'yi']; 

    // Строки для локализации интерфейса
    const localizedStrings = {
        // Добавьте больше языков по мере необходимости
        'am': { surah: 'ምዕራፍ', ayah: 'አንቀጽ', langLabel: 'የትርጉም ቋንቋ:', newAyah: 'አዲስ አንቀጽ', loading: 'የቁርኣን መረጃ በመጫን ላይ...', loadingSmall: '(ለመጀመሪያ ጊዜ ሲጫን የተወሰነ ጊዜ ሊወስድ ይችላል)' },
        'ar': { surah: 'سورة', ayah: 'آية', langLabel: 'لغة الترجمة:', newAyah: 'آية جديدة', loading: 'جاري تحميل بيانات القرآن...', loadingSmall: '(قد يستغرق بعض الوقت عند التحميل لأول مرة)' },
        'az': { surah: 'Surə', ayah: 'Ayə', langLabel: 'Tərcümə dili:', newAyah: 'Yeni Ayə', loading: 'Quran məlumatları yüklənir...', loadingSmall: '(İlk yükləmədə bir qədər vaxt apara bilər)' },
        'bg': { surah: 'Сура', ayah: 'Аят', langLabel: 'Език на превода:', newAyah: 'Нов Аят', loading: 'Зареждане на данни от Корана...', loadingSmall: '(Може да отнеме известно време при първо зареждане)' },
        'bn': { surah: 'সূরা', ayah: 'আয়াত', langLabel: 'অনুবাদের ভাষা:', newAyah: 'নতুন আয়াত', loading: 'কুরআনের ডেটা লোড হচ্ছে...', loadingSmall: '(প্রথমবার লোড হতে কিছু সময় লাগতে পারে)' },
        'bs': { surah: 'Sura', ayah: 'Ajet', langLabel: 'Jezik prijevoda:', newAyah: 'Novi Ajet', loading: 'Učitavanje podataka iz Kur\'ana...', loadingSmall: '(Može potrajati prilikom prvog učitavanja)' },
        'cs': { surah: 'Súra', ayah: 'Verš', langLabel: 'Jazyk překladu:', newAyah: 'Nový Verš', loading: 'Načítání dat Koránu...', loadingSmall: '(Při prvním načtení to může chvíli trvat)' },
        'de': { surah: 'Sure', ayah: 'Vers', langLabel: 'Übersetzungssprache:', newAyah: 'Neuer Vers', loading: 'Lade Korandaten...', loadingSmall: '(Kann beim ersten Mal etwas dauern)' },
        'dv': { surah: 'ސޫރަތް', ayah: 'އާޔަތް', langLabel: 'ތަރުޖަމާގެ ބަސް:', newAyah: 'އަލަށް އާޔަތެއް', loading: 'ޤުރުއާނުގެ މަޢުލޫމާތުތައް އަންނަނީ ލޯޑް ކުރެވެމުން...', loadingSmall: '(ފުރަތަމަ ފަހަރަށް ލޯޑް ކުރާއިރު، ކޮންމެވެސް ވަރެއްގެ ވަގުތެއް ނަގާފާނެއެވެ.)' },
        'en': { surah: 'Surah', ayah: 'Ayah', langLabel: 'Translation Language:', newAyah: 'New Ayah', loading: 'Loading Quran data...', loadingSmall: '(This may take some time on first load)' },
        'es': { surah: 'Sura', ayah: 'Aya', langLabel: 'Idioma de traducción:', newAyah: 'Nueva Aya', loading: 'Cargando datos del Corán...', loadingSmall: '(Puede tardar un poco la primera vez)' },
        'fa': { surah: 'سوره', ayah: 'آیه', langLabel: 'زبان ترجمه:', newAyah: 'آیه جدید', loading: 'در حال بارگذاری داده‌های قرآن...', loadingSmall: '(بار اول ممکن است کمی طول بکشد)' },
        'fr': { surah: 'Sourate', ayah: 'Verset', langLabel: 'Langue de traduction:', newAyah: 'Nouveau Verset', loading: 'Chargement des données du Coran...', loadingSmall: '(Peut prendre un certain temps au premier chargement)' },
        'ha': { surah: 'Sura', ayah: 'Aya', langLabel: 'Harshen Fassara:', newAyah: 'Sabon Aya', loading: 'Ana lodo bayanan Alqur\'ani...', loadingSmall: '(Wannan na iya ɗaukar ɗan lokaci a lodi na farko)' },
        'hi': { surah: 'सूरह', ayah: 'आयत', langLabel: 'अनुवाद की भाषा:', newAyah: 'नई आयत', loading: 'कुरान डेटा लोड हो रहा है...', loadingSmall: '(पहली बार लोड होने में कुछ समय लग सकता है)' },
        'id': { surah: 'Surah', ayah: 'Ayat', langLabel: 'Bahasa Terjemahan:', newAyah: 'Ayat Baru', loading: 'Memuat data Quran...', loadingSmall: '(Mungkin perlu waktu saat pemuatan pertama)' },
        'it': { surah: 'Sura', ayah: 'Versetto', langLabel: 'Lingua di traduzione:', newAyah: 'Nuovo Versetto', loading: 'Caricamento dati Corano...', loadingSmall: '(Potrebbe richiedere del tempo al primo caricamento)' },
        'ja': { surah: 'スーラ', ayah: '節', langLabel: '翻訳言語:', newAyah: '新しい節', loading: 'コーランデータを読み込んでいます...', loadingSmall: '(初回読み込みには時間がかかる場合があります)' },
        'ko': { surah: '수라', ayah: '절', langLabel: '번역 언어:', newAyah: '새로운 절', loading: '쿠란 데이터 로드 중...', loadingSmall: '(처음 로드 시 시간이 걸릴 수 있습니다)' },
        'ku': { surah: 'Sure', ayah: 'Ayet', langLabel: 'Zimanê Wergêrê:', newAyah: 'Ayeta Nû', loading: 'Daneyên Quranê têne barkirin...', loadingSmall: '(Dibe ku di barkirina yekem de hinekî dem bigire)' },
        'ml': { surah: 'സൂറ', ayah: 'ആയത്ത്', langLabel: 'വിവർത്തന ഭാഷ:', newAyah: 'പുതിയ ആയത്ത്', loading: 'ഖുർആൻ ഡാറ്റ ലോഡുചെയ്യുന്നു...', loadingSmall: '(ആദ്യ ലോഡിൽ കുറച്ച് സമയമെടുത്തേക്കാം)' },
        'ms': { surah: 'Surah', ayah: 'Ayat', langLabel: 'Bahasa Terjemahan:', newAyah: 'Ayat Baru', loading: 'Memuatkan data Al-Quran...', loadingSmall: '(Ini mungkin mengambil sedikit masa pada muat pertama)' },
        'nl': { surah: 'Soera', ayah: 'Vers', langLabel: 'Taal van vertaling:', newAyah: 'Nieuw Vers', loading: 'Koran data laden...', loadingSmall: '(Kan enige tijd duren bij eerste keer laden)' },
        'no': { surah: 'Sure', ayah: 'Vers', langLabel: 'Oversettelsesspråk:', newAyah: 'Nytt Vers', loading: 'Laster Korandata...', loadingSmall: '(Kan ta litt tid ved første lasting)' },
        'pl': { surah: 'Sura', ayah: 'Ajet', langLabel: 'Język tłumaczenia:', newAyah: 'Nowy Ajet', loading: 'Ładowanie danych Koranu...', loadingSmall: '(Może to chwilę potrwać przy pierwszym ładowaniu)' },
        'ps': { surah: 'سورة', ayah: 'آیت', langLabel: 'د ژباړې ژبه:', newAyah: 'نوی آیت', loading: 'د قرآن معلومات لوډیږي...', loadingSmall: '(لومړي ځل لوډېدو کې ممکن یو څه وخت ونیسي)' },
        'pt': { surah: 'Surata', ayah: 'Versículo', langLabel: 'Idioma da tradução:', newAyah: 'Novo Versículo', loading: 'Carregando dados do Alcorão...', loadingSmall: '(Pode demorar um pouco no primeiro carregamento)' },
        'ro': { surah: 'Sura', ayah: 'Verset', langLabel: 'Limba traducerii:', newAyah: 'Verset Nou', loading: 'Se încarcă datele Coranului...', loadingSmall: '(Poate dura ceva timp la prima încărcare)' },
        'ru': { surah: 'Сура', ayah: 'Аят', langLabel: 'Язык перевода:', newAyah: 'Новый Аят', loading: 'Загрузка данных Корана...', loadingSmall: '(Это может занять некоторое время при первой загрузке)' },
        'sd': { surah: 'سورة', ayah: 'آيت', langLabel: 'ترجمي جي ٻولي:', newAyah: 'نئون آيت', loading: 'قرآن جو ڊيٽا لوڊ ٿي رهيو آهي...', loadingSmall: '(پهريون دفعو لوڊ ڪرڻ ۾ ڪجهه وقت لڳي سگهي ٿو)' },
        'so': { surah: 'Suurad', ayah: 'Aayad', langLabel: 'Luuqadda Tarjumaada:', newAyah: 'Aayad Cusub', loading: 'Xogta Qur\'aanka ayaa la soo raranayaa...', loadingSmall: '(Marka hore ee la soo raro waxay qaadan kartaa xoogaa waqti ah)' },
        'sq': { surah: 'Sure', ayah: 'Ajeti', langLabel: 'Gjuha e përkthimit:', newAyah: 'Ajet i Ri', loading: 'Duke ngarkuar të dhënat e Kuranit...', loadingSmall: '(Mund të marrë pak kohë në ngarkimin e parë)' },
        'sv': { surah: 'Sura', ayah: 'Vers', langLabel: 'Översättningsspråk:', newAyah: 'Ny Vers', loading: 'Laddar Korandata...', loadingSmall: '(Kan ta lite tid vid första laddningen)' },
        'sw': { surah: 'Sura', ayah: 'Aya', langLabel: 'Lugha ya Tafsiri:', newAyah: 'Aya Mpya', loading: 'Inapakia data za Quran...', loadingSmall: '(Huenda ikachukua muda kidogo mara ya kwanza kupakia)' },
        'ta': { surah: 'சூரா', ayah: 'வசனம்', langLabel: 'மொழிபெயர்ப்பு மொழி:', newAyah: 'புதிய வசனம்', loading: 'குர்ஆன் தரவு ஏற்றப்படுகிறது...', loadingSmall: '(முதல்முறை ஏற்ற சிறிது நேரம் ஆகலாம்)' },
        'tg': { surah: 'Сура', ayah: 'Оят', langLabel: 'Забони тарҷума:', newAyah: 'Ояти Нав', loading: 'Боргирии маълумоти Қуръон...', loadingSmall: '(Ҳангоми бори аввал боргирӣ кардан вақти муайянро мегирад)' },
        'th': { surah: 'ซูเราะฮ์', ayah: 'อายะฮ์', langLabel: 'ภาษาที่แปล:', newAyah: 'อายะฮ์ใหม่', loading: 'กำลังโหลดข้อมูลอัลกุรอาน...', loadingSmall: '(อาจใช้เวลาสักครู่ในการโหลดครั้งแรก)' },
        'tr': { surah: 'Sûre', ayah: 'Âyet', langLabel: 'Çeviri Dili:', newAyah: 'Yeni Âyet', loading: 'Kur\'an verileri yükleniyor...', loadingSmall: '(İlk yüklemede biraz zaman alabilir)' },
        'tt': { surah: 'Сүрә', ayah: 'Аять', langLabel: 'Тәрҗемә теле:', newAyah: 'Яңа Аять', loading: 'Коръән мәгълүматлары йөкләнә...', loadingSmall: '(Беренче тапкыр йөкләгәндә бераз вакыт кирәк булырга мөмкин)' },
        'ug': { surah: 'سۈرە', ayah: 'ئايەت', langLabel: 'تەرجىمە تىلى:', newAyah: 'يېڭى ئايەت', loading: 'قۇرئان مەلۇماتلىرى يۈكلەۋاتىدۇ...', loadingSmall: '(تۇنجى قېتىم يۈكلىگەندە بىر ئاز ۋاقىت كېتىشى مۇمكىن)' },
        'ur': { surah: 'سورۃ', ayah: 'آیت', langLabel: 'ترجمہ کی زبان:', newAyah: 'نئی آیت', loading: 'قرآن کا ڈیٹا لوڈ ہو رہا ہے۔..', loadingSmall: '(پہلی بار لوڈ ہونے میں کچھ وقت لگ سکتا ہے)' },
        'uz': { surah: 'Sura', ayah: 'Oyat', langLabel: 'Tarjima tili:', newAyah: 'Yangi Oyat', loading: 'Qur\'on ma\'lumotlari yuklanmoqda...', loadingSmall: '(Birinchi yuklashda biroz vaqt ketishi mumkin)' },
        'zh': { surah: '章', ayah: '节', langLabel: '翻译语言:', newAyah: '新经文', loading: '古兰经数据加载中...', loadingSmall: '(首次加载可能需要一些时间)' }
    };


    async function loadData() {
        try {
            loadingIndicator.style.display = 'block';
            ayahDisplayElement.style.display = 'none';
            // ***** ВАЖНО: Укажите здесь правильное имя вашего JSON файла *****
            const response = await fetch('quran_data.json'); 
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            quranData = data.verses;
            translationOptions = data.translation_options;
            
            populateLanguageSelector();
            const savedLang = localStorage.getItem('selectedLanguage');
            if (savedLang && translationOptions[savedLang]) {
                languageSelectElement.value = savedLang;
            } else if (Object.keys(translationOptions).length > 0) {
                languageSelectElement.value = Object.keys(translationOptions)[0];
            }
            
            applyLocalization(); // Применяем локализацию при загрузке
            displayRandomVerse();

            loadingIndicator.style.display = 'none';
            ayahDisplayElement.style.display = 'block';

        } catch (error) {
            console.error("Failed to load Quran data:", error);
            const langCode = (localStorage.getItem('selectedLanguage') || 'ru-').split('-')[1] || 'ru';
            const loc = localizedStrings[langCode] || localizedStrings['ru'];
            loadingIndicator.innerHTML = `<p>${loc.loadingError || 'Не удалось загрузить данные. Пожалуйста, проверьте консоль или попробуйте обновить страницу.'}</p>`;
            loadingIndicator.style.color = 'red';
        }
    }

    function populateLanguageSelector() {
        const sortedOptions = Object.entries(translationOptions)
                                    .sort(([,a],[,b]) => a.localeCompare(b));
        
        sortedOptions.forEach(([key, prettyName]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = prettyName;
            languageSelectElement.appendChild(option);
        });
    }
    
    function applyLocalization() {
        const selectedLanguageKey = languageSelectElement.value || Object.keys(translationOptions)[0];
        const langCode = selectedLanguageKey.split('-')[1] || 'ru';
        const loc = localizedStrings[langCode] || localizedStrings['ru']; // Fallback to Russian

        if (languageLabel) languageLabel.innerHTML = `<i class="fas fa-language"></i> ${loc.langLabel}`;
        if (newAyahButton) newAyahButton.innerHTML = `<i class="fas fa-sync-alt"></i> ${loc.newAyah}`;
        
        // Локализация текста загрузки, если он еще виден
        const loadingP = loadingIndicator.querySelector('p:first-child');
        const loadingSmall = loadingIndicator.querySelector('p small');
        if (loadingP) loadingP.innerHTML = `${loc.loading} <i class="fas fa-spinner fa-spin"></i>`;
        if (loadingSmall) loadingSmall.textContent = `(${loc.loadingSmall})`;

        // Обновляем информацию об аяте, если он уже отображен
        if (currentVerse) updateAyahInfo();
    }


    function updateAyahInfo() {
        if (!currentVerse) return;

        const selectedLanguageKey = languageSelectElement.value;
        const langCode = selectedLanguageKey.split('-')[1] || 'ru'; 
        const loc = localizedStrings[langCode] || localizedStrings['ru'];

        ayahInfoElement.textContent = `${loc.surah} ${currentVerse.surah_name_ar} (${currentVerse.surah_name_en}) | ${loc.ayah} ${currentVerse.surah_number}:${currentVerse.ayah_number}`;
    }

    function displayRandomVerse() {
        if (quranData.length === 0) return;

        const randomIndex = Math.floor(Math.random() * quranData.length);
        currentVerse = quranData[randomIndex];

        arabicTextElement.textContent = currentVerse.arabic_text;
        updateAyahInfo(); 
        updateTranslationDisplay();
    }

    function updateTranslationDisplay() {
        if (!currentVerse) return;

        const selectedLanguageKey = languageSelectElement.value;
        localStorage.setItem('selectedLanguage', selectedLanguageKey); 
        
        const translation = currentVerse.translations[selectedLanguageKey];

        if (translation) {
            translationTextElement.textContent = translation;
            const langCodeForDir = selectedLanguageKey.split('-')[1];
            translationTextElement.setAttribute('dir', rtlLanguages.includes(langCodeForDir) ? 'rtl' : 'ltr');
        } else {
            translationTextElement.textContent = "Перевод для этого аята на выбранный язык отсутствует.";
            translationTextElement.setAttribute('dir', 'ltr');
        }
        applyLocalization(); // Обновляем локализацию, т.к. язык мог измениться
    }

    // Theme Toggle Functionality
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            themeToggleButton.setAttribute('aria-label', 'Переключить на светлую тему'); // Можно тоже локализовать
        } else {
            document.body.classList.remove('dark-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            themeToggleButton.setAttribute('aria-label', 'Переключить на темную тему'); // Можно тоже локализовать
        }
        localStorage.setItem('theme', theme);
    }

    themeToggleButton.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });

    const preferredColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const savedTheme = localStorage.getItem('theme') || preferredColorScheme;
    applyTheme(savedTheme);


    newAyahButton.addEventListener('click', displayRandomVerse);
    languageSelectElement.addEventListener('change', updateTranslationDisplay);

    loadData();
});
