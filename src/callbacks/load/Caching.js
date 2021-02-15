exports.load = () => {
    serverConfig.rebuildCache = false;
    fileIO.write("user/configs/server.json", serverConfig);
}