exports.execute = (url, info, sessionID) => {
	let splittedUrl = url.split('/');
    let type = splittedUrl[splittedUrl.length - 2].toLowerCase();
    let difficulty = splittedUrl[splittedUrl.length - 1];

    if (type === "core") {
        return fileIO.read(db.cacheBase.botCore);
    }

    if (type === "cursedassault")
    {
        type = "assault";
    }
	if(type == "bossstormtrooper" || type ==  "followerstormtrooper") // TODO: need to add this shithead
		type = "followerbully";

/*
    You can change line below to use any of the unused bot presets.
    If you want to make your USECs and BEARs have their own difficulties,
    you can simply delete one of these, then create folder in db/bots as the name you deleted here. ex)db/bots/test.
    Of course you have to edit src/classes/bot.js to change role, like role = test;
*/
    else if (type === "test" || type === "assaultgroup" || type === "followergluharsnipe" || type === "bosstest" || type === "followertest")
    {
        type = "pmcbot";
    }
	
	let getFileText = fileIO.read(db.bots[type].difficulties[difficulty]);
    return getFileText;
}