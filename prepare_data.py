import json
from datasets import load_dataset

# Словарь для получения "человеческого" названия языка по его коду
LANG_FULL_NAMES = {
    "am": "Amharic", "ar": "العربية", "az": "Azərbaycan", "ber": "Tamazight",
    "bg": "Български", "bn": "বাংলা", "bs": "Bosanski", "cs": "Čeština",
    "de": "Deutsch", "dv": "ދިވެހިބަސް", "en": "English", "es": "Español",
    "fa": "فارسی", "fr": "Français", "ha": "Hausa", "hi": "हिन्दी",
    "id": "Bahasa Indonesia", "it": "Italiano", "ja": "日本語", "ko": "한국어",
    "ku": "Kurdî", "ml": "മലയാളം", "ms": "Bahasa Melayu", "nl": "Nederlands",
    "no": "Norsk", "pl": "Polski", "ps": "پښتو", "pt": "Português",
    "ro": "Română", "ru": "Русский", "sd": "سنڌي", "so": "Soomaali",
    "sq": "Shqip", "sv": "Svenska", "sw": "Kiswahili", "ta": "தமிழ்",
    "tg": "Тоҷикӣ", "th": "ไทย", "tr": "Türkçe", "tt": "Татар",
    "ug": "ئۇيغۇرچە", "ur": "اردو", "uz": "Oʻzbekcha", "zh": "中文"
}

# Ключ: двухбуквенный код языка.
# Значение: кортеж (полный ключ перевода из датасета, отображаемое имя автора/издания для UI)
PREFERRED_TRANSLATIONS_MAP_DETAILED = {
    "am": ("translation-am-sadiq", "Sadiq & Sani"),
    "ar": ("translation-ar-muyassar", "Tafsir al-Muyassar"),
    "az": ("translation-az-mammadaliyev", "Məmmədəliyev & Bünyadov"),
    "ber": ("translation-ber-mensur", "Ramdane At Mansour"),
    "bg": ("translation-bg-theophanov", "Theophanov"),
    "bn": ("translation-bn-bengali", "Muhiuddin Khan"),
    "bs": ("translation-bs-mlivo", "Mustafa Mlivo"),
    "cs": ("translation-cs-hrbek", "Hrbek"),
    "de": ("translation-de-bubenheim", "Bubenheim & Elyas"),
    "dv": ("translation-dv-divehi", "Divehi"),
    "en": ("translation-en-sahih", "Sahih International"),
    "es": ("translation-es-cortes", "Julio Cortes"),
    "fa": ("translation-fa-fooladvand", "Fooladvand"),
    "fr": ("translation-fr-hamidullah", "Muhammad Hamidullah"),
    "ha": ("translation-ha-gumi", "Abubakar Mahmoud Gumi"),
    "hi": ("translation-hi-farooq", "Farooq Khan & Ahmed"),
    "id": ("translation-id-indonesian", "Indonesian Ministry of Religious Affairs (Kemenag)"),
    "it": ("translation-it-piccardo", "Hamza Roberto Piccardo"),
    "ja": ("translation-ja-japanese", "Ryoichi Mita"),
    "ko": ("translation-ko-korean", "Unknown (Korean)"), # Датасет не уточняет автора
    "ku": ("translation-ku-asan", "Burhan Muhammad-Amin"),
    "ml": ("translation-ml-abdulhameed", "Abdul Hameed & Kunhi Mohammed"),
    "ms": ("translation-ms-basmeih", "Abdullah Muhammad Basmeih"),
    "nl": ("translation-nl-leemhuis", "Fred Leemhuis"),
    "no": ("translation-no-berg", "Einar Berg"),
    "pl": ("translation-pl-bielawskiego", "Józefa Bielawskiego"),
    "ps": ("translation-ps-abdulwali", "Abdulwali Khan"),
    "pt": ("translation-pt-elhayek", "Samir El-Hayek"),
    "ro": ("translation-ro-grigore", "George Grigore"),
    "ru": ("translation-ru-kuliev-alsaadi", "Кулиев & ас-Саади"),
    "sd": ("translation-sd-amroti", "Taj Mehmood Amroti"),
    "so": ("translation-so-abduh", "Mahmud Muhammad Abduh"),
    "sq": ("translation-sq-nahi", "Hasan Efendi Nahi"),
    "sv": ("translation-sv-bernstrom", "Knut Bernström"),
    "sw": ("translation-sw-barwani", "Ali Muhsin Al-Barwani"),
    "ta": ("translation-ta-tamil", "Jan Turst Foundation"),
    "tg": ("translation-tg-ayati", "AbdolMohammad Ayati"),
    "th": ("translation-th-thai", "King Fahad Quran Complex"),
    "tr": ("translation-tr-diyanet", "Diyanet İşleri Başkanlığı"),
    "tt": ("translation-tt-nugman", "Yakub Ibn Nugman"),
    "ug": ("translation-ug-saleh", "Muhammad Saleh"),
    "ur": ("translation-ur-maududi", "Maududi (Tafheem al-Qur'an)"),
    "uz": ("translation-uz-sodik", "Muhammad Sodik Muhammad Yusuf"),
    "zh": ("translation-zh-majian", "Ma Jian")
}

def get_detailed_display_name(lang_code, author_info):
    """Формирует имя для UI: Язык (Автор)"""
    base_lang_name = LANG_FULL_NAMES.get(lang_code, lang_code.upper())
    return f"{base_lang_name} ({author_info})"


print("Loading dataset 'nazimali/quran'...")
try:
    ds = load_dataset("nazimali/quran", split="train")
except Exception as e:
    print(f"Error loading dataset: {e}")
    exit()

print(f"Dataset loaded. Number of verses: {len(ds)}")

all_verses_data = []
final_translation_options_detailed = {} # Будет хранить { "translation-xx-key": "Язык (Автор)" }
actual_keys_to_process = []

if len(ds) > 0:
    first_verse_keys = set(ds[0].keys())
    for lang_code, (preferred_key, author_info) in PREFERRED_TRANSLATIONS_MAP_DETAILED.items():
        if preferred_key in first_verse_keys:
            actual_keys_to_process.append(preferred_key)
            final_translation_options_detailed[preferred_key] = get_detailed_display_name(lang_code, author_info)
        else:
            print(f"Warning: Preferred translation '{preferred_key}' for lang '{lang_code}' ({author_info}) not found in dataset. Skipping.")
else:
    print("Error: Dataset is empty.")
    exit()

if not actual_keys_to_process:
    print("Error: No preferred translations could be matched with the dataset. Exiting.")
    exit()

print(f"Processing with {len(actual_keys_to_process)} selected translations.")
print("Selected translations for UI dropdown (detailed):", json.dumps(final_translation_options_detailed, ensure_ascii=False, indent=2))

for i, verse_data in enumerate(ds):
    if i % 500 == 0:
        print(f"Processing verse {i+1}/{len(ds)}...")

    translations_for_verse = {}
    for key in actual_keys_to_process:
        translation_text = verse_data.get(key)
        if translation_text is not None and str(translation_text).strip() != "":
            translations_for_verse[key] = str(translation_text)

    processed_verse = {
        "surah_number": verse_data["surah"],
        "ayah_number": verse_data["ayah"],
        "surah_name_ar": verse_data["surah-name"],
        "surah_name_en": verse_data["surah-name-en"],
        "arabic_text": verse_data["arabic-text-uthmani"],
        "translations": translations_for_verse
    }
    all_verses_data.append(processed_verse)

output_data = {
    "verses": all_verses_data,
    "translation_options": final_translation_options_detailed # Используем новый словарь с детальными именами
}

output_filename = "quran_data_best_single_detailed.json" # Новое имя файла
print(f"Writing data to {output_filename}...")
try:
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False) # Без отступов для экономии места
    
    file_size_bytes = len(open(output_filename, 'rb').read())
    file_size_mb = file_size_bytes / (1024*1024)
    print(f"Successfully created {output_filename}. File size: {file_size_mb:.2f} MB")
    
    if file_size_mb > 95:
         print(f"Warning: File size ({file_size_mb:.2f} MB) is still large.")

except IOError as e:
    print(f"Error writing to file: {e}")

print("\nData preparation complete.")
print(f"IMPORTANT: If you use this '{output_filename}',")
print(f"you MUST update the filename in your 'script.js' to fetch '{output_filename}'.")