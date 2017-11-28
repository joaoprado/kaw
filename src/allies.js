var _ = require('lodash');
var Auth = require('./socket/kaw').auth;
var Clan = require('./socket/kaw').clan;
var ClanRoster = require('./socket/kaw').clanRoster;
var Profile = require('./socket/kaw').profile;
var colors = require('colors');


Auth.login()
    .then((user) => saveUserInCache(user))
    .then(() => fetchClanInfo('Chaos Reborn Myth'))
    .then((clan) => saveClanInCache(clan))
    .then(() => fetchClanRoster())
    .then((roster) => saveRosterInCache(roster))
    .then(() => verifyAndReport())
    .catch((err) => {
        console.log('There was an error while processing your request.', err);
    });

const saveUserInCache = (user) => {
    console.time('fetchrc');
    return Cache.set('user', user, (err, success) => {
        if (!err && success) {
            console.log('... The user was logged in and stored in cache.'.green);
            return;
        }
        console.log('... There was an error while storing the user.'.red);
    });
}

const fetchClanInfo = (clanName) => {
    return new Clan(Cache.get('user').session_id, clanName).get();
}

const saveClanInCache = (clan) => {
    return Cache.set('clan', clan, (err, success) => {
        if (!err && success) {
            console.log('... The clan was retrieved and stored in cache.'.green);
            return;
        }
        console.log('... There was an error while storing the clan.'.red);
    });
}

const fetchClanRoster = () => {
    return new ClanRoster(Cache.get('user').session_id, Cache.get('clan').guild.id).get();
}

const saveRosterInCache = (roster) => {
    return Cache.set('clanRoster', _.chunk(roster, 12), (err, success) => {
        if (!err && success) {
            console.log(colors.green('... The clan roster for '+ Cache.get('clan').guild.name +' was retrieved and stored in cache.'));
            return;
        }
        console.log('There was an error while storing the clan roster.');
    });
}

const verifyAndReport = async((list) => {
    let roster = Cache.get('clanRoster');
    _.each(roster, (group, index) => {
        let report = await(processGroup(group, index));
        return;
    });

    console.timeEnd('fetchrc');
});

const processGroup = async((group, index) => {
    _.each(group, (member) => {
        console.log(colors.yellow('Verifying member: ' + member.username));
        let report = await(runUserVerification(member, index));
        console.log(report);
    })
})

const runUserVerification = async((user, index) => {
    let report = '';
    await(
        new Profile(Cache.get('user').session_id, user.user_id, proxies[index]).check(user.title)
            .then((message, color) => {
                report = message + '\n';
            })
            .catch((err) => {
                return runUserVerification(user);
            })
    );

    return report;
});

// var proxies = [];
// var sessionId = '';
// var clanName = 'Chaos Reborn Myth';
// var numberPattern = '/( )(\d)?\d+/g';
// var hiddenPattern = '\ud83d\ude48';

// var start = () => {
//     console.log('Starting...');

//     login.auth()
//         .then((user) => {
//             console.log('User logged in');
//             return updateSessionId(user);
//         })
//         .then(() => require('./socket/proxies').get())
//         .then((list) => updateProxiesList(list))
//         .then(() => findClanByName(clanName))
//         .then((clan) => listClanRoster(clan))
//         .then((members) => verifyMembers(members))
//         .catch((err) => console.error(err));
// }

// var updateSessionId = (user) => {
//     sessionId = user.session_id;
//     return;
// }

// var updateProxiesList = (list) => {
//     proxies = list;
//     return;
// }

// var findClanByName = (clanName) => {
//     return new Promise((resolve, reject) => {
//         request.post({
//             url: 'http://api.kingdomsatwar.com/game/guild/get_guild_by_name/',
//             headers: { SESSION_ID: sessionId },
//             form: {
//                 name: clanName
//             }
//         }, (err, res, body) => {
//             if (err) {
//                 reject(err);
//                 return;
//             }

//             resolve(JSON.parse(body));
//         });
//     });
// }

// var listClanRoster = (clan) => {
//     console.log('Listing clan roster for ' + clanName);
//     return new Promise((resolve, reject) => {
//         request.post({
//             url: 'http://api.kingdomsatwar.com/game/guild/get_members_by_strength/',
//             headers: { SESSION_ID: sessionId },
//             form: {
//                 guild_id: clan.guild.id
//             }
//         }, (err, res, body) => {
//             if (err) {
//                 reject(err);
//                 return;
//             }

//             resolve(body);
//         });
//     });
// }

// var verifyMembers = async ((members) => {
//     await (
//         _.each(members, (member) => {
//             getMemberProfile(member)
//                 .then((profile) => {
//                     console.log(profile);
//                 })
//                 .catch((err) => console.log(err));
//         })
//     );
// });

// var getMemberProfile = (member) => {
//     var proxy = proxies[Math.floor(Math.random()*proxies.length)];

//     return new Promise((resolve, reject) => {
//         request.post({
//             proxy: proxy.type.toLowerCase() + '://' + proxy.ip + ':' + proxy.port,
//             url: 'http://api.kingdomsatwar.com/game/user/get_profile/',
//             headers: { SESSION_ID: sessionId },
//             form: {
//                 profile_user_id: member.user_id
//             }
//         }, (err, res, body) => {
//             if (err) {
//                 reject(err);
//                 return;
//             }

//             resolve(JSON.parse(body));
//         });
//     });
// }


// start();
