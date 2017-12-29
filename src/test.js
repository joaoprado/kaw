const _ = require('lodash')
const colors = require('colors')
const Table = require('cli-table')
const NodeCache = require('node-cache')
const Cache = new NodeCache()

const Auth = require('./socket/kaw').auth
const AllyList = require('./socket/kaw').allylist

let user, allies = [],
    params = {
        offsets: [0, 50, 100, 150, 200, 250, 300, 350, 400, 450],
        limit: 50,
        min_cost: 100000000000000,
        max_cost: 150000000000000
    }


Auth.login()
    .then((data) => {
        user = data
        console.group('Analyzing allies data')
        return params.max_cost
    })
    .then(
        function(max_cost) {
            var allySearchPromiseBranch = pullAllies(max_cost)
            return (allySearchPromiseBranch)
        }
    )
    .then(
        function(list) {
            console.log(JSON.stringify(list))
            console.groupEnd()
        }
    )
    .catch(console.error.bind(console))

const pullAllies = (max_cost) => {
    if(max_cost < params.min_cost) {
        return allies
    }

    console.log('Pulling allies for max_cost ' + max_cost)

    var allySearchPromiseBranch = Promise.resolve().then(
            function() {
                var allyListPromiseBranch = pullSingleList(0, params.max_cost)
                return (allyListPromiseBranch)
            }
        )
        .then(
            function() {
                var cost = allies[allies.length-1].cost
                console.log(JSON.stringify(allies[allies.length-1]))
                return pullAllies(cost - 10)
            }
        )
        .catch(console.error.bind(console))

    return (allySearchPromiseBranch)
}

const pullSingleList = (offset, max_cost) => {
    if(offset > 450) {
        return allies
    }

    console.log('Pulling ally list for offset ' + offset)

    var allyListPromiseBranch = new AllyList(
            user.session_id,
            params.limit,
            offset,
            params.min_cost,
            max_cost
        )
        .post()
        .then(
            function(data) {
                allies.push(data.users)
                allies = _.flatten(allies)
                return (pullSingleList(offset+50, max_cost))
            }
        )
        .catch(
            function(error) {
                console.log("Error. Trying again...")
                setTimeout(function() {
                    return (pullSingleList(offset, max_cost))
                }, 10000)
            }
        )

    return (allyListPromiseBranch)
}
