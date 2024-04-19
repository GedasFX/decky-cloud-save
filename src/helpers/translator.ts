import { dictionary as english } from "./languages/en"
import { dictionary as spanish } from "./languages/es";
import { dictionary as french } from "./languages/fr";
import { dictionary as portuguese } from "./languages/pt";
import { dictionary as german } from "./languages/ge";
import * as logger from "./logger";

enum Language {
    english,
    spanish,
    latam,
    french,
    portuguese,
    german
}

const allDictionaries: { [key in Language]: Record<string, string> } = {
    [Language.english]: english,
    [Language.spanish]: spanish,
    [Language.latam]: spanish,
    [Language.french]: french,
    [Language.portuguese]: portuguese,
    [Language.german]: german
};

let currDictionary = { ...allDictionaries[Language.english] };

export async function initialize() {
    let currLang = await SteamClient.Settings.GetCurrentLanguage();
    logger.debug("Initializing translator for " + currLang);
    const langKey = currLang.toLowerCase() as keyof typeof Language;
    const lang = Language[langKey] || Language.english;

    if (currLang != "english" && lang == Language.english) {
            logger.warn("No translator available, fallback to English");
    } else {
        currDictionary = { ...currDictionary, ...allDictionaries[lang] };
    }
}

export function translate(text: string) {
    const val = currDictionary[text];
    return val || text;
}