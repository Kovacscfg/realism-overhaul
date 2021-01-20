exports.cache = () => {
    if (!serverConfig.rebuildCache) {
        return;
    }

    logger.logInfo("Caching: customization.json");

    let base = {"err": 0, "errmsg": null, "data": {}};
    let inputFiles = db.customization;

    for (let file in inputFiles) {
        let filePath = inputFiles[file];
        let fileData = fileIO.readParsed(filePath);

        base.data[file] = fileData;
    }

    fileIO.write("user/cache/customization.json", base);
}