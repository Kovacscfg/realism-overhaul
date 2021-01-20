exports.cache = () => {
    if (!serverConfig.rebuildCache) {
        return;
    }
    /* assort */
    for (let trader in db.assort) {
        logger.logInfo(`Caching: assort_${trader}.json`);

        let base = {"err": 0, "errmsg": null, "data": {"items": [], "barter_scheme": {}, "loyal_level_items": {}}};
		
        let inputNode = db.assort[trader];
		
		for(let path in inputNode){
			if(path != "questassort" && path != "customization" && path != "quests"){
				base.data[path] = fileIO.readParsed(inputNode[path]);
			}
		}
		
        fileIO.write(`./user/cache/assort_${trader}.json`, base);
    }

    /* customization */
    for (let trader in db.assort) {
        if ("customization" in db.assort[trader]) {
            logger.logInfo(`Caching: customization_${trader}.json`);

            let base = [];

            for (let file in db.assort[trader].customization) {
                base.push(fileIO.readParsed(db.assort[trader].customization[file]));
            }

            fileIO.write(`./user/cache/customization_${trader}.json`, base);
        }
    }
}