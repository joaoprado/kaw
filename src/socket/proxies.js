var request = require('request');

var get = function () {
  return new Promise((resolve, reject) => {
    console.log('Getting proxies list');
    request('http://proxy.tekbreak.com/10', (err, res, body) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(JSON.parse(body));
    });
  });
}

var setProxy = function (proxy) {
    request.defaults({'proxy': proxy.type.toLowerCase() + '://' + proxy.ip + ':' + proxy.port});
    return;
}

exports.get = get;
exports.setProxy = setProxy;
