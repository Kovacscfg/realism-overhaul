exports.mod = (mod_info) => {
    logger.logInfo("[MOD] LootFix");
	
	if(server.version == "1.0.2")
		location_f = require("./Classes/location-1.0.2");
	else if(server.version == "1.0.3")
		location_f = require("./Classes/location-1.0.3");
	else{
		logger.logError("[LootFix] The LootFix mod does not support your server version and will not be loaded. Please download JET server version 1.0.3 or 1.0.2");
		return;
	}
	
	let resolvedPath = internal.path.resolve(internal.path.join(__dirname, "../Config/RarityMultipliers.json"));
	let multipliers = {"not_exist": 0, "common": 1, "rare": 0.7, "superrare": 0.4};
	if(fileIO.exist(resolvedPath))
		multipliers = fileIO.readParsed(resolvedPath);
	location_f.handler.initialize(multipliers);
	
	logger.logSuccess("[MOD] LootFix; Applied");
}