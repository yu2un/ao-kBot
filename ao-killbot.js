const config = require('./config.json');

const Discord = require('discord.js');
const request = require('request');
const client = new Discord.Client();

const mergeImages = require('merge-images');
const { Canvas, Image, registerFont, loadImage, createCanvas } = require('canvas');
const base64ToImage = require('base64-to-image');
const fs = require("fs");

registerFont( 'data/Nizzoli-Bold.ttf', { family: "Nizzoli" } );

var exportPath ='exportImage/';

var lastRecordedKill = -1;

if (typeof config !== 'undefined') {
    var playerNames = [];
    for (var i = 0; i < config.players.length; i++) {
        playerNames.push(config.players[i].toLowerCase())
    }
}

function fetchKills(limit = 51, offset = 0) {
    request({
        uri: 'https://gameinfo.albiononline.com/api/gameinfo/events?limit=' + limit + '&offset=' + offset,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            parseKills(body);
        } else {
            console.log('Error data çekemiyorum: ', error); // Log the error
        }
    });
}

function parseKills(events) {
    var count = 0;
    var breaker = lastRecordedKill;

    events.some(function (kill, index) {
        // Save the most recent kill for tracking
        if (index == 0) {
            lastRecordedKill = kill.EventId;
        }

        // Don't process data for the breaker KILL
        if (kill.EventId != breaker) {
            if (kill.Killer.AllianceName.toLowerCase() == config.allianceName.toLowerCase() || kill.Victim.AllianceName.toLowerCase() == config.allianceName.toLowerCase()) {
                // Alliance KILL
                postKill(kill);
            } else if (kill.Killer.GuildName.toLowerCase() == config.guildName.toLowerCase() || kill.Victim.GuildName.toLowerCase() == config.guildName.toLowerCase()) {
                // Guild Kill
                postKill(kill);
            } else if (playerNames.includes(kill.Killer.Name.toLowerCase()) || playerNames.includes(kill.Victim.Name.toLowerCase())) {
                // Player kill
                postKill(kill);
            }
        } else {
            count++;
        }

        return kill.EventId == breaker;
    });

    // console.log('- Skipped ' + count + ' kills');
}

function postKill(kill, channel = config.botChannel) {

    if (kill.TotalVictimKillFame == 0) {
        return;
    }

    var victory = false;
    if (kill.Killer.AllianceName.toLowerCase() == config.allianceName.toLowerCase() ||
        kill.Killer.GuildName.toLowerCase() == config.guildName.toLowerCase() ||
        config.players.includes(kill.Killer.Name.toLowerCase())) {
        victory = true;
    }

    var assistedBy = "";
    if (kill.numberOfParticipants == 1) {
        var soloKill = [
            'All on their own',
            'Without assitance from anyone',
            'All by himself',
            'SOLO KILL'
        ];
        assistedBy = soloKill[Math.floor(Math.random() * soloKill.length)];
    } else {
        var assists = [];
        kill.Participants.forEach(function (participant) {
            if (participant.Name != kill.Killer.Name) {
                assists.push(participant.Name);
            }
        })
        assistedBy = "Assisted By: " + assists.join(', ');
    }

    itemCount = 0;
    kill.Victim.Inventory.forEach(function (inventory) {
        if (inventory !== null) {
            itemCount++;
        }
    });

    var itemsDestroyedText = "";
    if (itemCount > 0) {
        itemsDestroyedText = " destroying " + itemCount + " items";
    }


    var imgUrl = "https://gameinfo.albiononline.com/api/gameinfo/items/";
    var emptyUrl = "data/emptyImg.png";

    var killerItem = kill.Killer.Equipment;
    var victimItem = kill.Victim.Equipment;

    var killerMainHand, killerOffHand, killerHead, killerArmor, killerShoes, killerBag, killerCape, killerMount, killerPotion, killerFood;
    var victimMainHand, victimOffHand, victimHead, victimArmor, victimShoes, victimBag, victimCape, victimMount, victimPotion, victimFood;


    // Katil
    if(killerItem.MainHand != null){
        killerMainHand = imgUrl+""+killerItem.MainHand.Type+".png?count="+killerItem.MainHand.Count+"&quality="+killerItem.MainHand.Quality;
    }else{
        killerMainHand = emptyUrl;
    }

    if(killerItem.OffHand != null){
        killerOffHand = imgUrl+""+killerItem.OffHand.Type+".png?count="+killerItem.OffHand.Count+"&quality="+killerItem.OffHand.Quality;
    }else{
        killerOffHand = emptyUrl;
    }

    if(killerItem.Head != null){
        killerHead = imgUrl+""+killerItem.Head.Type+".png?count="+killerItem.Head.Count+"&quality="+killerItem.Head.Quality;
    }else{
        killerHead = emptyUrl;
    }

    if(killerItem.Armor != null){
        killerArmor = imgUrl+""+killerItem.Armor.Type+".png?count="+killerItem.Armor.Count+"&quality="+killerItem.Armor.Quality;
    }else{
        killerArmor = emptyUrl;
    }

    if(killerItem.Shoes != null){
        killerShoes = imgUrl+""+killerItem.Shoes.Type+".png?count="+killerItem.Shoes.Count+"&quality="+killerItem.Shoes.Quality;
    }else{
        killerShoes = emptyUrl;
    }

    if(killerItem.Bag != null){
        killerBag = imgUrl+""+killerItem.Bag.Type+".png?count="+killerItem.Bag.Count+"&quality="+killerItem.Bag.Quality;
    }else{
        killerBag = emptyUrl;
    }

    if(killerItem.Cape != null){
        killerCape = imgUrl+""+killerItem.Cape.Type+".png?count="+killerItem.Cape.Count+"&quality="+killerItem.Cape.Quality;
    }else{
        killerCape = emptyUrl;
    }

    if(killerItem.Mount != null){
        killerMount = imgUrl+""+killerItem.Mount.Type+".png?count="+killerItem.Mount.Count+"&quality="+killerItem.Mount.Quality;
    }else{
        killerMount = emptyUrl;
    }

    if(killerItem.Potion != null){
        killerPotion = imgUrl+""+killerItem.Potion.Type+".png?count="+killerItem.Potion.Count+"&quality="+killerItem.Potion.Quality;
    }else{
        killerPotion = emptyUrl;
    }

    if(killerItem.Food != null){
        killerFood = imgUrl+""+killerItem.Food.Type+".png?count="+killerItem.Food.Count+"&quality="+killerItem.Food.Quality;
    }else{
        killerFood = emptyUrl;
    }

    // Merhum
    if(victimItem.MainHand != null){
        victimMainHand = imgUrl+""+victimItem.MainHand.Type+".png?count="+victimItem.MainHand.Count+"&quality="+victimItem.MainHand.Quality;
    }else{
        victimMainHand = emptyUrl;
    }

    if(victimItem.OffHand != null){
        victimOffHand = imgUrl+""+victimItem.OffHand.Type+".png?count="+victimItem.OffHand.Count+"&quality="+victimItem.OffHand.Quality;
    }else{
        victimOffHand = emptyUrl;
    }

    if(victimItem.Head != null){
        victimHead = imgUrl+""+victimItem.Head.Type+".png?count="+victimItem.Head.Count+"&quality="+victimItem.Head.Quality;
    }else{
        victimHead = emptyUrl;
    }

    if(victimItem.Armor != null){
        victimArmor = imgUrl+""+victimItem.Armor.Type+".png?count="+victimItem.Armor.Count+"&quality="+victimItem.Armor.Quality;
    }else{
        victimArmor = emptyUrl;
    }

    if(victimItem.Shoes != null){
        victimShoes = imgUrl+""+victimItem.Shoes.Type+".png?count="+victimItem.Shoes.Count+"&quality="+victimItem.Shoes.Quality;
    }else{
        victimShoes = emptyUrl;
    }

    if(victimItem.Bag != null){
        victimBag = imgUrl+""+victimItem.Bag.Type+".png?count="+victimItem.Bag.Count+"&quality="+victimItem.Bag.Quality;
    }else{
        victimBag = emptyUrl;
    }

    if(victimItem.Cape != null){
        victimCape = imgUrl+""+victimItem.Cape.Type+".png?count="+victimItem.Cape.Count+"&quality="+victimItem.Cape.Quality;
    }else{
        victimCape = emptyUrl;
    }

    if(victimItem.Mount != null){
        victimMount = imgUrl+""+victimItem.Mount.Type+".png?count="+victimItem.Mount.Count+"&quality="+victimItem.Mount.Quality;
    }else{
        victimMount = emptyUrl;
    }

    if(victimItem.Potion != null){
        victimPotion = imgUrl+""+victimItem.Potion.Type+".png?count="+victimItem.Potion.Count+"&quality="+victimItem.Potion.Quality;
    }else{
        victimPotion = emptyUrl;
    }

    if(victimItem.Food != null){
        victimFood = imgUrl+""+victimItem.Food.Type+".png?count="+victimItem.Food.Count+"&quality="+victimItem.Food.Quality;
    }else{
        victimFood = emptyUrl;
    }

    mergeImages([

        // Arka plan
        {src : 'data/albionback.jpg', x:0, y:0 },
      
        // Katil
        {src : killerBag, x:0, y:200 },
        {src : killerHead, x:200,  y:175 },
        {src : killerCape, x:400, y:200 },
        {src : killerMainHand, x:0, y:400 },
        {src : killerArmor, x:200, y:375 },
        {src : killerOffHand, x:400, y:400 },
        {src : killerFood, x:0, y:595 },
        {src : killerShoes, x:200, y:570 },
        {src : killerPotion, x:400, y:595 },
        {src : killerMount, x:200, y:768 },
      
        // Merhum
        {src : victimBag, x:997, y:200 },
        {src : victimHead, x:1196,  y:175 },
        {src : victimCape, x:1393, y:200 },
        {src : victimMainHand, x:997, y:400 },
        {src : victimArmor, x:1196, y:375 },
        {src : victimOffHand, x:1393, y:400 },
        {src : victimFood, x:997, y:595 },
        {src : victimShoes, x:1196, y:570 },
        {src : victimPotion, x:1393, y:595 },
        {src : victimMount, x:1196, y:768 },
      
        ],
        {
          width: 1600,
          height: 976,
          Canvas: Canvas,
          Image: Image
        }).then(b64 => {
          var optionalObj = {'fileName': kill.EventId, 'type':'jpg'};
          base64ToImage(b64,exportPath,optionalObj);



          var embed = {
            color: victory ? 0x008000 : 0x800000,
            author: {
                name: kill.Killer.Name + " killed " + kill.Victim.Name,
                icon_url: victory ? 'https://i.imgur.com/CeqX0CY.png' : 'https://albiononline.com/assets/images/killboard/kill__date.png',
                url: 'https://albiononline.com/en/killboard/kill/' + kill.EventId
            },
            title: assistedBy + itemsDestroyedText,
            description: 'Gaining ' + kill.TotalVictimKillFame + ' fame',
            thumbnail: {
                url: (kill.Killer.Equipment.MainHand.Type ? 'https://gameinfo.albiononline.com/api/gameinfo/items/' + kill.Killer.Equipment.MainHand.Type + '.png' : 'https://albiononline.com/assets/images/killboard/kill__date.png')
            },
            timestamp: kill.TimeStamp,
            fields: [{
                    name: "Killer Guild",
                    value: (kill.Killer.AllianceName ? "[" + kill.Killer.AllianceName + "] " : '') + (kill.Killer.GuildName ? kill.Killer.GuildName : '<none>'),
                    inline: true
                },
                {
                    name: "Victim Guild",
                    value: (kill.Victim.AllianceName ? "[" + kill.Victim.AllianceName + "] " : '') + (kill.Victim.GuildName ? kill.Victim.GuildName : '<none>'),
                    inline: true
                },
                {
                    name: "Killer IP",
                    value: kill.Killer.AverageItemPower.toFixed(2),
                    inline: true
                },
                {
                    name: "Victim IP",
                    value: kill.Victim.AverageItemPower.toFixed(2),
                    inline: true
                },
            ],
            footer: {
                text: "Kill #" + kill.EventId
            }
          };

            client.channels.get(channel).send({
                embed: embed
            });
            console.log("Data Bas"+kill.EventId);
        });
    
    
}

if (typeof client !== 'undefined') {
    client.on('ready', () => {
        console.log('Ready and waiting!');

        // If the config.username differs, change it
        if (client.user.username != config.username) {
            client.user.setUsername(config.username);
        }

        // Set 'Playing Game' in discord
        client.user.setActivity(config.playingGame); // broken due to discord API changes

        fetchKills();

        // Fetch kills every 30s
        var timer = setInterval(function () {
            fetchKills();
        }, 30000);
    });
}

if (typeof client !== 'undefined') {
    client.on('message', message => {
        if (message.content.indexOf(config.cmdPrefix) !== 0 || message.author.bot) return;
        else { // Execute command!
            var args = message.content.slice(config.cmdPrefix.length).trim().split(/ +/g);
            var command = args.shift().toLowerCase();

            // Test Command - !ping
            if (command === 'ping') {
                message.reply('pong');
            } else if (command === 'kbinfo') {
                request({
                    json: true,
                    uri: 'https://gameinfo.albiononline.com/api/gameinfo/events/' + args[0]
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        postKill(body, message.channel.id);
                    } else {
                        console.log('Error kbinfo: ', error); // Log the error
                    }
                });
            }

            // [ADMIN] - clear config.botChannel messages
            else if (command === 'kbclear') {
                if (config.admins.includes(message.author.id) && message.channel.id == config.botChannel) {
                    message.channel.send('Clearing Killboard').then(msg => {
                        msg.channel.fetchMessages().then(messages => {
                            message.channel.bulkDelete(messages);
                            console.log("[ADMIN] " + message.author.username + " cleared Killboard");
                        })
                    })
                }
            }
        }
    });
}

if (typeof config !== 'undefined') {
    if (config.token) {
        client.login(config.token);
    } else {
        console.log("ERROR: No bot token defined")
    }
} else {
    console.log("ERROR: No config file")
    console.log("execute: cp config.json.example config.json")
}