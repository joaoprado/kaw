"use strict"

var request = require('request');

class Kaw {

    constructor (target, headers, body) {
        this.target = target;
        this.headers = headers;
        this.body = body;
    }

    post () {
        return new Promise((resolve, reject) => this.request(resolve, reject));
    }

    request (resolve, reject) {
        return request.post(this.getOptions(), (err, res, body) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(body);
        });
    }

    getOptions () {
        return {
            url: this.target,
            headers: this.headers,
            form: this.body,
            json: true
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
        version: 406,
        client_version: 1
      }
    );
  }

  login () {
    return super.post();
  }
}

exports.auth = new Auth();
