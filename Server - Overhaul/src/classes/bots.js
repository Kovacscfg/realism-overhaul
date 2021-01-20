"use strict";
/*
can accept node as object{array[variable]} or object{object[array]variable} or object{variable}
*/
function getRandomValue(node) {
	let keys = Object.keys(node);
	let randomizedObject;
	if(typeof node == "string")
	{
		if(node.indexOf(".json") != -1){
			randomizedObject = fileIO.readParsed(node);
		} else {
			return node;
		}
		if(typeof randomizedObject == "object"){
			keys = Object.keys(randomizedObject);
			randomizedObject = randomizedObject[keys[utility.getRandomInt(0, keys.length - 1)]];
			
		}
	} else if(typeof node == "object") {
		randomizedObject = node[keys[utility.getRandomInt(0, keys.length - 1)]];
	}
	if(typeof randomizedObject == "string")
		if(randomizedObject.indexOf(".json") != -1){
			let pathToCheck = randomizedObject;
			randomizedObject = fileIO.readParsed(randomizedObject);
			if(typeof randomizedObject.BodyParts == "object")
				return randomizedObject;
			if(pathToCheck.indexOf("inventory") != -1)
				return randomizedObject;
			keys = Object.keys(randomizedObject);
			randomizedObject = randomizedObject[keys[utility.getRandomInt(0, keys.length - 1)]];
		}
	//it should be normal string or some other randomized shit here
	return randomizedObject;
}

function getRandomExperience() {
	let exp = 0;

	let expTable = global._database.globals.config.exp.level.exp_table;

	// Get random level based on the exp table.
	let randomLevel = utility.getRandomInt(0, expTable.length - 1) + 1;

	for (let i = 0; i < randomLevel; i++) {
		exp += expTable[i].exp;
	}

	// Sprinkle in some random exp within the level, unless we are at max level.
	if (randomLevel < expTable.length - 1) {
		exp += utility.getRandomInt(0, expTable[randomLevel].exp - 1);
	}

	return exp;
}


function addDogtag(bot, sessionID) {
	let dogtagItem = {
		_id: utility.generateNewItemId(),
		_tpl: ((bot.Info.Side === 'Usec') ? "59f32c3b86f77472a31742f0" : "59f32bb586f774757e1e8442"),
		parentId: bot.Inventory.equipment,
		slotId: "Dogtag",
		upd: {
			"Dogtag": {
				"Nickname": bot.Info.Nickname,
				"Side": bot.Info.Side,
				"Level": bot.Info.Level,
				"Time": (new Date().toISOString()),
				"Status": "Killed by ",
				"KillerName": "Unknown",
				"WeaponName": "Unknown"
			}
		}
	}

	bot.Inventory.items.push(dogtagItem);
	return bot;
}

function generateHealth(selectedHealth){
	let HealthBase = {"Hydration":{"Current":100,"Maximum":100},"Energy":{"Current":100,"Maximum":100},"BodyParts":{"Head":{"Health":{"Current":35,"Maximum":35}},"Chest":{"Health":{"Current":80,"Maximum":80}},"Stomach":{"Health":{"Current":70,"Maximum":70}},"LeftArm":{"Health":{"Current":60,"Maximum": 60}},"RightArm":{"Health":{"Current":60,"Maximum": 60}},"LeftLeg":{"Health":{"Current": 65,"Maximum": 65}},"RightLeg":{"Health":{"Current": 65,"Maximum": 65}}},"UpdateTime": 1598664622};
	let bodyparts = ["Head","Chest","Stomach","LeftArm","RightArm","LeftLeg","RightLeg"];
	/* db/bots/<>/health/default.json
	{
	   "Hydration": 100,
	   "Energy": 100,
	   "BodyParts":{
		  "Head": 35,
		  "Chest": 80,
		  "Stomach": 70,
		  "LeftArm": 60,
		  "RightArm": 60,
		  "LeftLeg": 65,
		  "RightLeg": 65
	   }
	}
	*/
	HealthBase.Hydration.Current = selectedHealth.Hydration;
	HealthBase.Hydration.Maximum = selectedHealth.Hydration;
	HealthBase.Energy.Current = selectedHealth.Energy;
	HealthBase.Energy.Maximum = selectedHealth.Energy;
	for(let index in bodyparts)
	{
		HealthBase.BodyParts[bodyparts[index]].Health.Current = selectedHealth.BodyParts[bodyparts[index]];
		HealthBase.BodyParts[bodyparts[index]].Health.Maximum = selectedHealth.BodyParts[bodyparts[index]];
	}
	return HealthBase;
}

function generateBot(bot, role, sessionID) {
	let type = (role === "cursedAssault") ? "assault" : role;
	let node = {};

	// chance to spawn simulated PMC AIs
	if ((type === "assault" || type === "marksman" || type === "pmcBot") && global._database.gameplayConfig.bots.pmc.enabled) {
		let spawnChance = utility.getRandomInt(0, 99);
		let sideChance = utility.getRandomInt(0, 99);

		if (spawnChance < global._database.gameplayConfig.bots.pmc.spawnChance) {
			if (sideChance < global._database.gameplayConfig.bots.pmc.usecChance) {
				bot.Info.Side = "Usec";
				type = "usec";
			} else {
				bot.Info.Side = "Bear";
				type = "bear";
			}

			bot.Info.Level = utility.getRandomInt(1, 70);
		}
	}

	// we don't want player scav to be generated as PMC
	if (role === "playerScav") {
		type = "assault";
	}
	// generate bot
	node = db.bots[type.toLowerCase()];
	let appearance = fileIO.readParsed(node.appearance);
	bot.Info.Settings.Role = role;
	bot.Info.Nickname = getRandomValue(node.names);
	bot.Info.experience = getRandomExperience();
	bot.Info.Level = profile_f.calculateLevel(bot);
	bot.Info.Settings.Experience = getRandomValue(node.experience);
	bot.Info.Voice = getRandomValue(appearance.voice);
	bot.Health = generateHealth(getRandomValue(node.health));
	bot.Customization.Head = getRandomValue(appearance.head);
	bot.Customization.Body = getRandomValue(appearance.body);
	bot.Customization.Feet = getRandomValue(appearance.feet);
	bot.Customization.Hands = getRandomValue(appearance.hands);
	bot.Inventory = getRandomValue(node.inventory);

	// add dogtag to PMC's	
	if (type === "usec" || type === "bear") {
		bot = addDogtag(bot, sessionID);
	}

	let itemsByParentHash = {};
	let inventoryItemHash = {};
	let inventoryId = "";

	//Generate inventoryItem list
	for (let i in bot.Inventory.items) {
		let item = bot.Inventory.items[i];
		inventoryItemHash[item._id] = item;

		if (item._tpl === "55d7217a4bdc2d86028b456d") {
			inventoryId = item._id;
			continue;
		}

		if(!("parentId" in item)) 
			continue;

		if (!(item.parentId in itemsByParentHash)) 
			itemsByParentHash[item.parentId] = [];
		
		itemsByParentHash[item.parentId].push(item);
	}

	//update inventoryId
	let newInventoryId = utility.generateNewItemId();
	inventoryItemHash[inventoryId]._id = newInventoryId;
	bot.Inventory.equipment = newInventoryId;

	//update inventoryItem id
	if (inventoryId in itemsByParentHash) {
		for (let item of itemsByParentHash[inventoryId]) {
			item.parentId = newInventoryId;
		}
	}

	return bot;
}

function generate(info, sessionID) {
	let generatedBots = [];
	if(typeof info.conditions == "undefined")
		info['conditions'] = [{Limit: 1, Difficulty: "normal", Role: "assault"}];
	for (let condition of info.conditions) {
		for (let i = 0; i < condition.Limit; i++) {
			let bot = fileIO.readParsed(db.cacheBase.botBase);

			bot._id = "bot" + utility.getRandomIntEx(99999999);
			bot.Info.Settings.BotDifficulty = condition.Difficulty;
			bot = generateBot(bot, condition.Role, sessionID);
			generatedBots.unshift(bot);
		}
	}

	return generatedBots;
}

function generatePlayerScav() {
	let scavData = generate({ "conditions": [{ "Role": "playerScav", "Limit": 1, "Difficulty": "normal" }] });
	let scavItems = scavData[0].Inventory.items;

	// Remove secured container
	for (let item of scavItems) {
		if (item.slotId === "SecuredContainer") {
			let toRemove = helper_f.findAndReturnChildrenByItems(scavItems, item._id);
			let n = scavItems.length;

			while (n-- > 0) {
				if (toRemove.includes(scavItems[n]._id)) {
					scavItems.splice(n, 1);
				}
			}

			break;
		}
	}

	scavData[0].Info.Settings = {};
	return scavData[0];
}

module.exports.generate = generate;
module.exports.generatePlayerScav = generatePlayerScav;
