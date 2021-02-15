exports.cache = () => {
    if (!serverConfig.rebuildCache) {
        return;
    }

    logger.logInfo("Caching: quests.json");
    let base = {"err": 0, "errmsg": null, "data": []};

    base.data = fileIO.readParsed(db.templates.quests);
	
    fileIO.write("user/cache/quests.json", base);
}