"use strict"

var request = require('requestretry')
var colors = require('colors')

class Kaw {

    constructor (target, headers, body, proxy = null) {
        this.target = target;
        this.headers = headers;
        this.body = body;
        this.proxy = proxy;
    }

    post () {
        return new Promise((resolve, reject) => this.request(resolve, reject));
    }

    request (resolve, reject) {
        return request.post(this.getOptions(), (err, res, body) => {
            if (this.proxy) {
                console.log(this.proxy);
            }

            if (err) {
                reject(err);
                return;
            }

            if (res.statusCode > 299) {
                return setTimeout(() => {
                    reject(body);
                    return;
                }, 5000);
            }

            resolve(body);
        });
    }

    getOptions () {
        return {
            proxy: this.proxy,
            url: this.target,
            headers: this.headers,
            form: this.body,
            json: true,
            maxAttempts: 5,
            retryDelay: 20000,
        };
    }
}

class Auth extends Kaw {

  constructor (username = null, password = null) {
    super(
      'http://api.kingdomsatwar.com/game/login/ata',
      null,
      {
        username: username || 'jpedro.prado@gmail.com',
        password: password || 'petrotadi',
        version: 707,
        client_version: 406
      }
    );
  }

  login () {
    return super.post()
        .then((user) => {
            console.log('==============================================')
            console.log(colors.green('Logged in as: ') + colors.red(user.game_user.username))
            console.log(colors.yellow(user.session_id))
            console.log()

            return user
        });
  }
}

const Clan = class ClanClass extends Kaw {
    constructor (session_id, clanName) {
        super(
          'http://api.kingdomsatwar.com/game/guild/get_guild_by_name/',
          {
            'session_id': session_id,
            'content-type': 'application/x-www-form-urlencoded'
          },
          {
            name: clanName
          }
        );
    }

    get () {
        return super.post();
    }
}

const ClanRoster = class ClanRosterClass extends Kaw {
    constructor (session_id, clanId) {
        super(
          'http://api.kingdomsatwar.com/game/guild/get_members_by_strength/',
          { session_id: session_id },
          {
            guild_id: clanId
          }
        );
    }

    get () {
        return super.post();
    }
}

const Profile = class ProfileClass extends Kaw {
    constructor (session_id, user_id, proxy) {
        super(
          'http://api.kingdomsatwar.com/game/user/get_profile/',
          { session_id: session_id },
          {
            profile_user_id: user_id
          },
          proxy
        );
    }

    check (title) {
        return super.post()
            .then((profile) => {
                let supposedAlliesCount = title ? title.split('Ξ ').pop().trim() : null;
                let message = 'Allies ok.';

                if (isNaN(supposedAlliesCount) && !profile.clan_members_visible) {
                    message = profile.username + ' needs spies. Allies hidden. No title changes.';
                    return message;
                }

                if (isNaN(supposedAlliesCount) && profile.clan_members_visible) {
                    message = profile.username + ' needs spies and title update. Allies visible.';
                    return message;
                }

                if (!profile.clan_members_visible) {
                    message = profile.username + ' needs spies and title update. Allies hidden.';
                    return message;
                }

                if (supposedAlliesCount == profile.clan_member_count && supposedAlliesCount == 20) {
                    message = profile.username + ' needs spies. Over 20 allies.';
                    return message;
                }

                if (supposedAlliesCount != profile.clan_member_count) {
                    message = profile.username + ' needs spies and title update. Different ally count.';
                    return message;
                }

                return profile.username + ' ' + message;
            });
    }
}

const Player = class PlayerClass extends Kaw {
    constructor (session_id, username, proxy) {
        super(
          'http://api.kingdomsatwar.com/game/user/get_profile_by_username/',
          { session_id: session_id },
          {
            profile_username: username
          },
          proxy
        );
    }

    check () {
        return super.post()
            .then((player) => {
                // console.log(player);
                if (! player.clan_members_visible) {
                    return 'Allies hidden';
                }

                return JSON.stringify(player.clan_members);
            });
    }
}



const AllyList = class AllyListClass extends Kaw {
    constructor (session_id, limit, offset, min_cost, max_cost, proxy) {
        super(
          'http://api.kingdomsatwar.com/game/user/search_clan_members_by_cost/',
          { session_id: session_id },
          {
            limit: limit,
            offset: offset,
            min_cost: min_cost,
            max_cost: max_cost
          },
          proxy
        )
    }
}

exports.auth = new Auth();
exports.clan = Clan;
exports.clanRoster = ClanRoster;
exports.profile = Profile;
exports.player = Player;
exports.allylist = AllyList;
