"use strict";
class LocaleServer {
    constructor() {
        this.languages = {};
        this.menu = {};
        this.global = {};
    }

    initialize() {
        this.languages = fileIO.readParsed(db.user.cache.languages);

        for (let lang in db.locales) {
			let menuFile = (fileIO.exist(db.user.cache["locale_menu_" + lang.toLowerCase()])?db.user.cache["locale_menu_" + lang.toLowerCase()]:db.locales[lang].menu);
            this.menu[lang] = fileIO.readParsed(menuFile);
			if(typeof this.menu[lang].data != "undefined"){
				this.menu[lang] = this.menu[lang].data;
			}
            this.global[lang] = fileIO.readParsed(db.user.cache["locale_" + lang.toLowerCase()]);
			if(typeof this.global[lang].data != "undefined"){
				this.global[lang] = this.global[lang].data;
			}
        }
    }

    getLanguages() {
        return this.languages;
    }
    
    getMenu(lang = "en") {
		if(typeof this.menu[lang] == "undefined")
			return this.menu["en"];
        return this.menu[lang];
    }
    
    getGlobal(lang = "en") {
		if(typeof this.global[lang] == "undefined")
			return this.global["en"];
        return this.global[lang];
    }
}

module.exports.handler = new LocaleServer();