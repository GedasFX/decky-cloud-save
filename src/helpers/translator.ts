import english from "../../assets/languages/en.json";
import spanish from "../../assets/languages/es.json";
import french from "../../assets/languages/fr.json";
import portuguese from "../../assets/languages/pt.json";
import german from "../../assets/languages/de.json";
import chinese from "../../assets/languages/zh.json";
import { Logger } from "./logger";

/**
 * Represents supported languages.
 */
enum Language {
    english,
    spanish,
    latam,
    french,
    portuguese,
    german,
    chinese
}

/**
 * The Translator class is used to translate text into different languages.
 */
export class Translator {

    /**
     * Private constructor to prevent instantiation
     */
    private constructor(){
    }

    /**
     * An object that maps languages to their respective dictionaries.
     */
    private static allDictionaries: { [key in Language]: Record<string, string> } = {
        [Language.english]: english,
        [Language.spanish]: spanish,
        [Language.latam]: spanish,
        [Language.french]: french,
        [Language.portuguese]: portuguese,
        [Language.german]: german,
        [Language.chinese]: chinese
    };

    /**
     * The dictionary of the current language.
     */
    private static currDictionary = { ...Translator.allDictionaries[Language.english] };

    /**
     * Method to set up the translator. It retrieves the current language from the SteamClient.Settings,
     * logs the language, and sets the currDictionary to the dictionary of the current language.
     * If the current language is not English and no translation is available, it falls back to English.
     */
    public static async initialize() {
        let currLang = await SteamClient.Settings.GetCurrentLanguage();
        Logger.debug("Initializing translator for " + currLang);
        const langKey = currLang.toLowerCase() as keyof typeof Language;
        const lang = Language[langKey] || Language.english;

        if (currLang != "english" && lang == Language.english) {
            Logger.warn("No translator available, fallback to English");
        } else {
            Translator.currDictionary = { ...Translator.currDictionary, ...Translator.allDictionaries[lang] };
        }
    }

    /**
     * Method to translate a given text into the current language.
     * @param text - The text to translate
     * @param replacements - An object that contains key-value pairs to replace in the text
     * @returns The translated text. If a translation for a text is not found in the current dictionary, the original text is returned.
     */
    public static translate(text: string, replacements: Record<string, any> = {}) {
        let result: string = Translator.currDictionary[text] || text;

        if (result == text) {
            Logger.warn("Missing translation for " + text);
        } else {
            for (const key in replacements) {
                const placeholder = `{{${key}}}`;
                result = result.split(placeholder).join(replacements[key])
            }
        }

        return result;
    }
}