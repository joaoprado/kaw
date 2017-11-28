var _ = require('lodash');
var Auth = require('./socket/kaw').auth;
var Clan = require('./socket/kaw').clan;
var ClanRoster = require('./socket/kaw').clanRoster;
var Profile = require('./socket/kaw').profile;
const NodeCache = require('node-cache');
const Cache = new NodeCache();
var colors = require('colors');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

// http://api.kingdomsatwar.com/game/guild/get_guild_by_name/
// name: chaos reborn myth
// http://api.kingdomsatwar.com/game/guild/get_members_by_strength/
// guild_id
// http://api.kingdomsatwar.com/game/user/get_profile/
// profile_user_id

var proxies = [
    'http://165.138.124.4:8080', //Ok
    // 'http://173.26.241.133:53281', //Ok
    'http://149.56.147.33:8799', //Ok
    'http://93.165.155.180:8080', //Ok
    'http://89.36.212.141:1189',
    'http://80.253.111.241:8080',
    'http://205.196.181.11:8080',
    'http://138.219.177.236:8080',
    'http://201.162.127.178:8080',
];

Auth.login()
    .then((user) => saveUserInCache(user))
    .then(() => fetchClanInfo('Chaos Reborn', 100))
    .catch((err) => {
        console.log('There was an error while processing your request.', err);
    });

const saveUserInCache = (user) => {
    return Cache.set('user', user, (err, success) => {
        if (!err && success) {
            console.log('... The user was logged in and stored in cache.'.green);
            return;
        }
        console.log('... There was an error while storing the user.'.red);
    });
}

const fetchClanInfo = async((clanName, times) => {
  console.time('requests');
  var attempts = 1;
  var success = 0;
  var proxy = 0;
  var tryGroups = 1;

  while(attempts < times) {
    let request = await(makeRequest(clanName));
    if(request) {
      console.log(colors.green(attempts + ' success'));
      success++;
    } else {
      console.log(colors.red(attempts + ' error'));
    }

    attempts++;
  }
  console.timeEnd('requests');
  return success;
});

const makeRequest = async((clanName) => {
  let report;

  await(
    new Clan(Cache.get('user').session_id, clanName).get()
      .then((clan) => {
        report = true;
      })
      .catch((err) => {
        console.log(err);
        report = false;
      })
  )

  return report;
})
