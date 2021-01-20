exports.cache = () => {
    if (!serverConfig.rebuildCache) {
        return;
    }
	logger.logInfo("Caching: locations.json");
	let locations = {};
	for (let name in db.locations) {
		if (name === "base") {
			continue;
		}

		let location = fileIO.readParsed(db.locations[name]);

		locations[name] = location;
		// structure
		/*
			LocationName { base: {}, loot: {}}
		*/
	}
	fileIO.write("user/cache/locations.json", locations);
}