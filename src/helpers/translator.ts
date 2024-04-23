import english from "../../assets/languages/en.json"
import spanish from "../../assets/languages/es.json";
import french from "../../assets/languages/fr.json";
import portuguese from "../../assets/languages/pt.json";
import german from "../../assets/languages/ge.json";
import { Logger } from "./logger";

enum Language {
    english,
    spanish,
    latam,
    french,
    portuguese,
    german
}

export class Translator {
    private static allDictionaries: { [key in Language]: Record<string, string> } = {
        [Language.english]: english,
        [Language.spanish]: spanish,
        [Language.latam]: spanish,
        [Language.french]: french,
        [Language.portuguese]: portuguese,
        [Language.german]: german
    };
    private static currDictionary = { ...Translator.allDictionaries[Language.english] };

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

    public static translate(text: string, replacements: Record<string, any> = {}) {
        let result: string = Translator.currDictionary[text] || text

        if (result == text) {
            Logger.warn("Missing translation for " + text)
        } else {
            for (const key in replacements) {
                const placeholder = `{{${key}}}`;
                result = result.split(placeholder).join(replacements[key]);
            }
        }

        return result;
    }

}