/**
 * Multilingualization library class
 *
 * @class Multilingualization
 */
export default class Multilingualization {
    /**
     *  @var dictionaries Multilingual dictionary object
     */
    static dictionaries = {
        "en": {
            "dict-1": "Please enter the URL you wish to register.",
            "dict-2": "Add",
            "dict-3": "Please enter the URL from \"http(s)://\".",
            "dict-4": "Simple RSS Reader",
            "dict-5": "Cancel",
            "dict-6": "Export feeds",
            "dict-7": "Import feeds",
            "Failed to load rss.": "Failed to load rss."
        },
        "ja": {
            "dict-1": "登録するURLを入力してください。",
            "dict-2": "追加",
            "dict-3": "URLを「http(s)://」から入力してください。",
            "dict-4": "Simple RSS Reader",
            "dict-5": "キャンセル",
            "dict-6": "RSSのエクスポート",
            "dict-7": "RSSのインポート",
            "Failed to load rss.": "rssの読み込みに失敗しました。"
        }
    }

    /**
     * Get current language
     *
     * @returns {string} Current language
     */
    static language() {
        const lang = (window.navigator.languages && window.navigator.languages[0]) ||
            window.navigator.language ||
            window.navigator.userLanguage ||
            window.navigator.browserLanguage;

        // Show English for undefined languages
        return this.dictionaries[lang] ? lang : "en";
    }

    /**
     * Get translated term
     *
     * @param {string} term Term to be translated
     * @returns {string} Translated term
     */
    static translate(term) {
        return this.dictionaries[this.language()][term];
    }

    // Initialization of dictionary object
    static translateAll() {
        const dictionary = this.dictionaries[this.language()];
        let target;
        for (let term in dictionary) {
            try {
                target = document.querySelector('.' + term) ?? undefined;
            } catch (exception) {
                target = undefined;
            }
            if (target !== undefined) {
                target.innerHTML = dictionary[term];
            }
        }
    }
}
