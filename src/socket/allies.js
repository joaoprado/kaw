var request = require('request');
var _ = require('lodash');
var fs = require('fs');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var proxies = require('./proxies');

var startingPrice = 2000000000000;
var endingPrice = 1990000000000;

var alliesList = [];
var offsets = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500];

var get = async ((session_id, proxiesList) => {

  await (
    _.each(offsets, (offset) => {
      fetch(session_id, proxiesList, {
        max_cost: startingPrice,
        offset: offset,
        limit: 50,
        min_cost: endingPrice
      })
        .then((list) => filterAlliesByStats(list))
        .then((list) => saveToJsonFile(list))
        .catch((err) => console.log(err));
    })
  );

  if(startingPrice > endingPrice) {
    await (updateSearchRange());
    return get(session_id, proxiesList);
  }

  return alliesList;
});

var fetch = async (function (session_id, proxiesList, params) {
  console.log('Fetching allies from '+ params.max_cost +' to '+ params.min_cost +'...');
  var proxy = proxiesList[Math.floor(Math.random()*proxiesList.length)];

  var allies = await (new Promise((resolve, reject) => {
    request.post({
      proxy: proxy.type.toLowerCase() + '://' + proxy.ip + ':' + proxy.port,
      url: 'http://api.kingdomsatwar.com/game/user/search_clan_members_by_cost/',
      headers: { SESSION_ID: session_id },
      form: params,
      json: true
    }, (err, res, body) => {
      if (err) {
        reject(err);
        return;
      }
      // console.log(res);
      resolve(body);
    })
  }));

  return allies;
});

var filterAlliesByStats = (list) => {
  console.log(list);
  var allies = _.filter(list.users, (ally) => {
    alliesList.push(ally);

    if(allyIsUnderpriced(ally.bonus, ally.cost)) {
      return ally;
    }

    return false;
  });

  return allies;
}

var allyIsUnderpriced = (stats, cost) => {
  var totalCS = getTotalCS(stats);
  var ratio = getRatio(totalCS, cost);

  return (ratio > 0) ? true: false;
}

var getTotalCS = function (stats) {
  return stats.attack + stats.defense + stats.spy_attack + stats.spy_defense;
}

var getRatio = function (totalCS, cost) {
  return (totalCS / cost) * 1000000;
}

var saveToJsonFile = (list) => {
  if (list.length <= 0) {
    return;
  }

  var fileName = 'src/allies/'+ Date.now() +'.json';
  var data = {
    allies: list
  };

  fs.writeFile(fileName, JSON.stringify(data), (err) => {
    if(err) return console.error(err);
    console.log('File created: ' + fileName);
  });
}


var updateSearchRange = function () {
  if (alliesList.length == 0) {
    return;
  }

  var ally = _.last(alliesList);
  startingPrice = ally.cost;
}

// var validateAllies = async(function (users) {
//   _.map(users, (ally) => {
//     allies.all.push(ally);

//     var underpriced = await (checkForUnderpriced(ally.bonus, ally.cost));

//     if(! underpriced) {
//       return;
//     }

//     var profile = await (getProfile(ally.username));

//     classifyAlly(profile);
//   });
// });

// var checkForUnderpriced = function (stats, cost) {
//   var totalCS = getTotalCS(stats);
//   var ratio = getRatio(totalCS, cost);

//   return (ratio > 10) ? { total_cs: totalCS, ratio: ratio } : false;
// }

// var getTotalCS = function (stats) {
//   return stats.attack + stats.defense + stats.spy_attack + stats.spy_defense;
// }

// var getRatio = function (totalCS, cost) {
//   return (totalCS / cost) * 1000000;
// }

// var getProfile = function (username) {
//   var user_params = {
//     profile_username: username
//   }

//   var proxy = setProxy(proxyList[Math.floor(Math.random()*proxyList.length)]);

//   var user_options = {
//     proxy: proxy.type.toLowerCase() + '://' + proxy.ip + ':' + proxy.port,
//     url: 'http://api.kingdomsatwar.com/game/user/get_profile_by_username/',
//     method: 'POST',
//     form: user_params,
//     json: true
//   };

//   return rp(options)
//     .then((body) => {
//       return body;
//     })
//     .catch((err) => {
//       console.log(err);
//       return false;
//     });
// }

// var classifyAlly = function (player) {
//   var ally = {
//     username: player.username,
//     user_id: player.user_id,
//     cost: player.value,
//     banner: player.status_message,
//     stats: {
//       attack: player.clan_bonus.attack,
//       defense: player.clan_bonus.defense,
//       spy_attack: player.clan_bonus.spy_attack,
//       spy_defense: player.clan_bonus.spy_defense
//     },
//     info: {
//       allies: evaluatePlayerAllies(player),
//       achievements: evaluatePlayerAchievements(player.achievements),
//       owner: evaluatePlayerOwner(player),
//       clan: evaluatePlayerClan(player),
//       spells: evaluatePlayerSpells(player)
//     },
//     stats: {
//       quests: player.missions_completed,
//       fights_won: player.fights_won,
//       fights_lost: player.fights_lost,
//       steals_won: player.steals_won,
//       steals_lost: player.steals_lost
//     }
//   };
// }

// var evaluatePlayerAllies = function (player) {
//   if (! player.clan_members_visible) {
//     return 'Hidden';
//   }

//   return {
//     count: player.clan_member_count,
//     list: player.clan_members
//   };
// }

// var evaluatePlayerAchievements = function (player) {

// }

// var evaluatePlayerOwner = function (player) {

// }

// var evaluatePlayerClan = function (player) {

// }

// var evaluatePlayerSpells = function (player) {

// }


exports.get = get;
