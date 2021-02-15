"use strict";

function GetItemParents(){
	return ["54009119af1c881c07000029","5661632d4bdc2d903d8b456b","5447e0e74bdc2d3c308b4567","566162e44bdc2d3f298b4573"/*Containers*/,"567849dd4bdc2d150f8b456e","5447e1d04bdc2dff2f8b4567","5448eb774bdc2d0a728b4567","5448ecbe4bdc2d60728b4568","543be5e94bdc2df1348b4568","543be6674bdc2df1348b4569","543be5664bdc2dd4348b4569","543be6564bdc2df4348b4568","5448f3a64bdc2d60728b456a","5448f3ac4bdc2dce718b4569","5448f39d4bdc2d0a728b4568","5448f3a14bdc2d27728b4569","5448e8d64bdc2dce718b4568","5448e8d04bdc2ddf718b4569","5c99f98d86f7745c314214b3","5c164d2286f774194c5e69fa","57864c322459775490116fbf","57864a3d24597754843f8721","57864ee62459775490116fc1","57864a66245977548f04a81f","57864bb7245977548b3b66c2","57864c8c245977548867e7f1","57864e4c24597754843f8723","57864ada245977548638de91","590c745b86f7743cc433c5f2","543be5dd4bdc2deb348b4569","543be5cb4bdc2deb348b4568","5485a8684bdc2da71d8b4567"];
}
function LoadLootContainerNode(){
	for(let itemNode in db.items){
		if(itemNode.includes("LootContainer")){
			return fileIO.readParsed(db.items[itemNode]);
		}
	}
	return null;
}
function GetLootContainerData(ItemID,LootContainerNode){
	for(let containerDb in LootContainerNode){
		if(LootContainerNode[containerDb]._id == ItemID){
			return LootContainerNode[containerDb];
		}
	}
	return null;
}
function GenerateLootList(container){
	let LootList = {};
	let SpawnFilter = container._props.SpawnFilter;
	let ItemParents = GetItemParents();
	for(let sf_item of SpawnFilter){
		for(let item in _database.items){
			// check if checked item is an item itself or its a category
			if(ItemParents.includes(sf_item)){
				// its a category so lets add all items that contains its id in _parent
				if(_database.items[item]._parent == sf_item){
					LootList[sf_item] = _database.items[item];
				}
			} else {
				//its an item so lets add it into as item 
				// we can actually break the loop after finding this item
				if(_database.items[item]._id == sf_item){
					LootList[sf_item] = _database.items[item];
					if(typeof _database.items[item]._props.Chambers != "undefined")
						LootList[sf_item]["preset"] = FindIfItemIsAPreset(sf_item);
					else 
						LootList[sf_item]["preset"] = null;
					break;
				}
			}
		}
	}
	return LootList;
}
function FindIfItemIsAPreset(ID_TO_SEARCH){
	for(let item in _database.globals.ItemPresets){
		if(typeof _database.globals.ItemPresets[item]._encyclopedia == "undefined") continue;
		if(_database.globals.ItemPresets[item]._encyclopedia == ID_TO_SEARCH)
			return _database.globals.ItemPresets[item];
	}
	return null;
}
function _MountedLootPush(typeArray, ids, output) {
	let count = 0;
	for (let i in typeArray)
	{
		let data = typeArray[i];

		if (data.Id in ids)
			continue;

		ids[data.Id] = true;
		output.Loot.push(data);
		count++;
	}
	return count;
}
function _ForcedLootPush(typeArray, ids, output) {
	let count = 0;
	for (let i in typeArray)
	{
		let data = typeArray[i].data[0];

		if (data.Id in ids)
			continue;

		ids[data.Id] = true;
		output.Loot.push(data);
		count++;
	}
	return count;
}
function _StaticsLootPush(typeArray, ids, output) {
	let count = 0;
	for (let i in typeArray)
        {
            let data = typeArray[i];

            if (data.Id in ids)
                continue;

            ids[data.Id] = true;

            if (data.Items.length > 1)
                data.Items.splice(1);

            _GenerateContainerLoot(data.Items);
            output.Loot.push(data);
            count++;
        }
	return count;
}
function _RollMaxItemsToSpawn(container){
	let minCount = 0;
	let maxItemsPossibleToSpawn = container._props.Grids[0]._props.cellsV * container._props.Grids[0]._props.cellsH;
	let rollForContainer = utility.getRandomInt(0, 100);
	if(rollForContainer > _database.gameplayConfig.locationloot.containers.ChanceForEmpty){
		for (let i = 0; i < maxItemsPossibleToSpawn; i++)
		{
			let roll = utility.getRandomInt(0, 100);

			if (roll < _database.gameplayConfig.locationloot.containers.ChanceToSpawnNextItem)
			{
				minCount++;
			}
		}
	}
	return minCount;
}
function _GenerateContainerLoot(_items) {
	// we are getting the lootcontainer node and selecting proper loot container
	let LootContainerNode = LoadLootContainerNode();
	if(LootContainerNode == null)
		throw "LootContainerNode is null something goes wrong please check db.items[???LootContainer???.json] file";
	
	let container = GetLootContainerData(_items[0]._tpl,LootContainerNode);
	if(container == null)
		throw "GetLootContainerData is null something goes wrong please check if container template: "+_items[0]._tpl+" exists";

	// {"chance":50,"minCount":0,"maxCount":2,"width":2,"height":2,"maxProbability":114711,"items":[]}
	//container._props.Grids[0]._props.cellsH // Width
	//container._props.Grids[0]._props.cellsV // Height
	//container._props.SpawnFilter // Array of items/categories to spawn
	//_database.items[_ID_]._props.SpawnChance // ItemSpawnChance
	
	let LootList = GenerateLootList(container);

	let parentId = _items[0]._id;
	let idPrefix = parentId.substring(0, parentId.length - 4);
	let idSuffix = parseInt(parentId.substring(parentId.length - 4), 16) + 1;
	let container2D = Array(container._props.Grids[0]._props.cellsV).fill().map(() => Array(container._props.Grids[0]._props.cellsH).fill(0));
	let maxProbability = container.maxProbability;
	
	let minCount = _RollMaxItemsToSpawn(container);
	let ContainerSlots = container._props.Grids[0]._props.cellsH;
	for (let i = 0; i < minCount; i++)
	{
		let item = {};
		let containerItem = {};
		let result = { success: false };
		let maxAttempts = _database.gameplayConfig.locationloot.containers.AttemptsToPlaceLoot;

		while (!result.success && maxAttempts)
		{
			let rolling_pool = [];
			for(let lootItem in LootList){
				let roll = utility.getRandomInt(0, 10000);
				let itemChance = LootList[lootItem]._props.SpawnChance * 100 / (_database.gameplayConfig.locationloot.containers.ItemSpawnChanceDivider * ContainerSlots);
				if(itemChance < roll){
					rolling_pool.push(LootList[lootItem]);
				}
			}
			let rolled = null;
			if(rolling_pool.length > 0){
				rolled = rolling_pool.find(item => utility.getRandomInt(0, 10000) < item._props.SpawnChance * 100 / (_database.gameplayConfig.locationloot.containers.ItemSpawnChanceDivider * ContainerSlots));
			}
			//let rolled = LootList.find(itm => itm._props.SpawnChance <= roll);

			if(rolled != null){
				item = helper_f.getItem(rolled._id)[1];
				
				if (rolled.preset != null)
				{
					let size = helper_f.getItemSize(item._id, rolled.preset._items[0]._id, rolled.preset._items);
					// Guns will need to load a preset of items
					item._props.presetId = rolled.preset._id;
					item._props.Width = size[0];
					item._props.Height = size[1];
				}
				result = helper_f.findSlotForItem(container2D, item._props.Width, item._props.Height);
			}
			maxAttempts--;
		}

		// if we weren't able to find an item to fit after 20 tries then container is probably full
		if (!result.success)
			break;

		container2D = helper_f.fillContainerMapWithItem(
			container2D, result.x, result.y, item._props.Width, item._props.Height, result.rotation);
		let rot = result.rotation ? 1 : 0;

		if (item._props.presetId)
		{
			// Process gun preset into container items
			let preset = helper_f.getPreset(item._id);
			if(preset == null) continue;
			preset._items[0].parentId = parentId;
			preset._items[0].slotId = "main";
			preset._items[0].location = { "x": result.x, "y": result.y, "r": rot};

			for (var p in preset._items)
			{
				_items.push(preset._items[p]);

				if (preset._items[p].slotId === "mod_magazine")
				{
					let mag = helper_f.getItem(preset._items[p]._tpl)[1];
					let cartridges = {
						"_id": idPrefix + idSuffix.toString(16),
						"_tpl": item._props.defAmmo,
						"parentId": preset._items[p]._id,
						"slotId": "cartridges",
						"upd": { "StackObjectsCount": mag._props.Cartridges[0]._max_count }
					};

					_items.push(cartridges);
					idSuffix++;
				}
			}

			continue;
		}

		containerItem = {
			"_id": idPrefix + idSuffix.toString(16),
			"_tpl": item._id,
			"parentId": parentId,
			"slotId": "main",
			"location": { "x": result.x, "y": result.y, "r": rot}
		};

		let cartridges;
		if (item._parent === "543be5dd4bdc2deb348b4569" || item._parent === "5485a8684bdc2da71d8b4567")
		{
			// Money or Ammo stack
			let stackCount = utility.getRandomInt(item._props.StackMinRandom, item._props.StackMaxRandom);
			containerItem.upd = { "StackObjectsCount": stackCount };
		}
		else if (item._parent === "543be5cb4bdc2deb348b4568")
		{
			// Ammo container
			idSuffix++;

			cartridges = {
				"_id": idPrefix + idSuffix.toString(16),
				"_tpl": item._props.StackSlots[0]._props.filters[0].Filter[0],
				"parentId": containerItem._id,
				"slotId": "cartridges",
				"upd": { "StackObjectsCount": item._props.StackMaxRandom }
			};
		}
		else if (item._parent === "5448bc234bdc2d3c308b4569")
		{
			// Magazine
			idSuffix++;
			cartridges = {
				"_id": idPrefix + idSuffix.toString(16),
				"_tpl": item._props.Cartridges[0]._props.filters[0].Filter[0],
				"parentId": parentId,
				"slotId": "cartridges",
				"upd": { "StackObjectsCount": item._props.Cartridges[0]._max_count }
			};
		}

		_items.push(containerItem);
		
		if (cartridges)
			_items.push(cartridges);
		
		idSuffix++;
	}
}
/* LocationServer class maintains list of locations in memory. */
class LocationServer {
    constructor() {
        this.Locations = {};
		this.LocationBase = {};
		//this.loot = {};
    }
    /* Load all the locations into memory. */
    initialize() {
		// load all needed data into memory
		for(let location in db.locations){
			this.Locations[location] = fileIO.readParsed(db.locations[location]);
		}
		this.LocationBase = fileIO.readParsed(db.cacheBase.locations);
		//this.loot = fileIO.readParsed(db.cacheBase.location_statics);
    }
    /* generates a random location preset to use for local session */
    generate(name) {
		//check if one file loot is existing
        //let output = this.locations[name];
		
		// dont read next time ??
		if(typeof db.locations[name] == "undefined"){
			logger.logWarning("No Such Location");
			return;
		}
		let location = this.Locations[name];
		
        const locationLootChanceModifier = location.base.GlobalLootChanceModifier;
        let output = location.base;
        let ids = {};

        // don't generate loot on hideout
        if (name === "hideout")
        {
            return output;
        }

        let forced = location.loot.forced;
        let mounted = location.loot.mounted;
        let statics = location.loot.static;
        let dynamic = location.loot.dynamic;
        output.Loot = [];
        let count = 0;
		let counters = [];
		
		count = _MountedLootPush(mounted, ids, output);
        // mounted weapons
        /*for (let i in mounted)
        {
            let data = mounted[i];

            if (data.Id in ids)
                continue;

            ids[data.Id] = true;
            output.Loot.push(data);
			count++;
        }*/
		counters.push(count);
		count = 0;
		count = _ForcedLootPush(forced, ids, output);
		// forced loot
        /*for (let i in forced)
        {
            let data = forced[i].data[0];

            if (data.Id in ids)
                continue;

            ids[data.Id] = true;
            output.Loot.push(data);
			count++;
        }*/
		counters.push(count);
        count = 0;
		count = _StaticsLootPush(statics, ids, output)
        // static loot
        /*for (let i in statics)
        {
            let data = statics[i];

            if (data.Id in ids)
                continue;

            ids[data.Id] = true;

            if (data.Items.length > 1)
                data.Items.splice(1);

            this.generateContainerLoot(data.Items);
            output.Loot.push(data);
            count++;
        }*/
		counters.push(count);

        // dyanmic loot
        let max = global._database.gameplayConfig.locationloot[name];//location_f.config.limits[name];
        count = 0;

        // Loot position list for filtering the lootItem in the same position.
        let lootPositions = [];
        let maxCount = 0;

        while (maxCount < max && dynamic.length > 0)
        {
            maxCount += 1;
            let rndLootIndex = utility.getRandomInt(0, dynamic.length - 1);
            let rndLoot = dynamic[rndLootIndex];

            if (!rndLoot.data)
            {
                maxCount -= 1;
                continue;
            }

            let rndLootTypeIndex = utility.getRandomInt(0, rndLoot.data.length - 1);
            let data = rndLoot.data[rndLootTypeIndex];

            //Check if LootItem is overlapping
            let position = data.Position.x + "," + data.Position.y + "," + data.Position.z;
            if (!global._database.gameplayConfig.locationloot.allowLootOverlap && lootPositions.includes(position))
            {
                //Clear selected loot
                dynamic[rndLootIndex].data.splice(rndLootTypeIndex, 1);

                if (dynamic[rndLootIndex].data.length === 0)
                {
                    delete dynamic.splice(rndLootIndex, 1);
                }

                continue;
            }

            //random loot Id
            //TODO: To implement a new random function, use "generateID" instead for now.
            data.Id = utility.generateNewItemId();

            //create lootItem list
            let lootItemsHash = {};
            let lootItemsByParentId = {};

            for (const i in data.Items)
            {
                let loot = data.Items[i];
                // Check for the item spawnchance
                lootItemsHash[loot._id] = loot;

                if (!("parentId" in loot))
                    continue;

                if (lootItemsByParentId[loot.parentId] === undefined)
                    lootItemsByParentId[loot.parentId] = [];
                lootItemsByParentId[loot.parentId].push(loot);
            }

            //reset itemId and childrenItemId
            for (const itemId of Object.keys(lootItemsHash))
            {
                let newId = utility.generateNewItemId();
                lootItemsHash[itemId]._id = newId;

                if (itemId === data.Root)
                    data.Root = newId;

                if (lootItemsByParentId[itemId] === undefined)
                    continue;

                for (const childrenItem of lootItemsByParentId[itemId])
                {
                    childrenItem.parentId = newId;
                }
            }

            const num = utility.getRandomInt(0, 10000);
            const spawnChance = helper_f.getItem(data.Items[0]._tpl)[1]['_props']['SpawnChance'] * 100;
            const itemChance = spawnChance * locationLootChanceModifier;
            if (itemChance < num)
            {
                count += 1;
                lootPositions.push(position);
                output.Loot.push(data);
            }
            else
            {
                continue;
            }
        }

        // done generating
        logger.logInfo(`Generated location ${name} with [mounted: ${counters[0]} | forcedLoot: ${counters[1]} | statics: ${counters[2]} | dynamic: ${count}]`);
		counters = null;
        return output;
    }
	getStaticLoot(_tpl){
		for(let obj of this.location.loot.static){
			if(obj.Items[0]._tpl == _tpl)
				return obj;
		}
	}
	// TODO: rework required - weard functions to replace later on ;)
	
/*
	================================================================================================================
*/
    /* get a location with generated loot data */
    get(Location) {
        let name = Location.toLowerCase().replace(" ", "");
        return this.generate(name);
    }

    /* get all locations without loot data */
    generateAll() {
		// lets try to read from cache
		if(!utility.isUndefined(db.user.cache.locations))
		{
			if(fileIO.exist(db.cacheBase.locations))
			{
				let base = fileIO.readParsed(db.cacheBase.locations);
				let newData = {};
				for(let location in this.Locations){
					newData[this.Locations[location].base._Id] = this.Locations[location].base;
				}
				base.data.locations = newData;
				return base.data;
			}
			logger.logError(`Missing file db/cacheBase/locations.json`);
		}
		throw "Missing file db/cacheBase/locations.json";
    }
}

module.exports.handler = new LocationServer();