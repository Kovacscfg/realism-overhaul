exports.mod = (mod_info) => {
	var itemsData = fileIO.readParsed(db.user.cache.items);
	if(!itemsData.data){
		itemsData = {"err": 0, "errmsg": null, "data": items};
	}
	var items = itemsData.data;
	
	let spawnChances = [];
	let spawnFilters = [];
	
	var resolvedChancePath = internal.path.resolve(internal.path.join(__dirname, "../Config/SpawnChances.json"));
	var resolvedFilterPath = internal.path.resolve(internal.path.join(__dirname, "../Config/ContainerSpawnFilters.json"));
	
	if(fileIO.exist(resolvedChancePath))
		spawnChances = fileIO.readParsed(resolvedChancePath);
	if(fileIO.exist(resolvedFilterPath))
		spawnFilters = fileIO.readParsed(resolvedFilterPath);
	
	for(let item in spawnChances){
		if(items[spawnChances[item].id]){
			if(spawnChances[item].Rarity !== undefined){
				items[spawnChances[item].id]._props.Rarity = spawnChances[item].Rarity;
			}
			if(spawnChances[item].SpawnChance !== undefined){
				items[spawnChances[item].id]._props.SpawnChance = spawnChances[item].SpawnChance;
			}
		}
	}
	
	for(let item in spawnFilters){
		if(items[spawnFilters[item].container]._props.SpawnFilter !== undefined && spawnFilters[item].spawnFilter !== undefined){
			items[spawnFilters[item].container]._props.SpawnFilter = spawnFilters[item].spawnFilter;
		}
	}
	
	fileIO.write(db.user.cache.items, itemsData);
	logger.logSuccess("[LootFix] Settings applied")
}
