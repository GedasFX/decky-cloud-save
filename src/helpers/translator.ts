import { dictionary as english } from "./languages/en";
import { dictionary as spanish } from "./languages/es";
import { log } from "./utils";

const allDictionaries = { english, spanish }
let currDictionary = { ...allDictionaries["english"] };

export async function initialize() {
    let currLang = await SteamClient.Settings.GetCurrentLanguage();
    log("Initializing translator for " + currLang);

    const forceLang = sessionStorage.getItem("dcs-lang");
    if (forceLang != null && forceLang != undefined) {
        log("Forcing translator for " + currLang);
        currLang = forceLang;
    }

    if (currLang != "english") {
        if (currDictionary == null || currDictionary == undefined) {
            log("No translator available, fallback to English");
        } else {
            currDictionary = { ...currDictionary, ...allDictionaries[currLang] };
        }
    }
}

export function translate(text: string) {
    return currDictionary[text];
}