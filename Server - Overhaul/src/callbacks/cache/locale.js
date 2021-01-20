exports.cache = () => {
    if (!serverConfig.rebuildCache) {
        return;
    }
    for (let locale in db.locales) {
        let base = { "interface": {}, "enum": [], "error": {}, "mail": {}, "quest": {}, "preset": {}, "handbook": {}, "season": {}, "templates": {}, "locations": {}, "banners": {}, "trading": {}}
        let inputNode = db.locales[locale];
        let inputDir = [
            "banners",
            "handbook",
            "locations",
            "mail",
            "preset",
            "quest",
            "season",
            "templates",
            "trading"
        ];

        logger.logInfo(`Caching: locale_${locale}.json + locale_menu_${locale}.json`);

        base.interface = fileIO.readParsed(inputNode.interface);
        base.error = fileIO.readParsed(inputNode.error);

        for (let name of inputDir) {
			// loop through all inputDir's
			base[name] = fileIO.readParsed(`./db/locales/${locale}/${name}.json`);

        }
		let menu = fileIO.readParsed(inputNode.menu);
        fileIO.write(`user/cache/locale_${locale}.json`, base);
        fileIO.write(`user/cache/locale_menu_${locale}.json`, menu);
    }
}