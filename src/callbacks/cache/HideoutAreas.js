exports.cache = () => {
    if (!serverConfig.rebuildCache) {
        return;
    }

    logger.logInfo("Caching: hideout_areas.json");

    let base = {"err": 0, "errmsg": null, "data": []};
    let inputFiles = db.hideout.areas;

    for (let file in inputFiles) {
        let filePath = inputFiles[file];
        let fileData = fileIO.readParsed(filePath);

        base.data.push(fileData);
    }

    fileIO.write("user/cache/hideout_areas.json", base);
}