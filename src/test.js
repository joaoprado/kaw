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
        min_cost: 0,
        max_cost: 148523070492768
    }

const run = () => {
    console.log('==============================================')
    console.log(colors.green('Initiating the app...'))
    console.log()

    Auth.login()
        .then((data) => user = data)
        .then(() => searchAllies())
        .then(() => tabulateAllies())
}

const searchAllies = (max_cost = null) => {
    let requests = []

    max_cost = max_cost == null ? params.max_cost : max_cost

    for(i = 0; i < params.offsets.length; i++) {
        requests.push(pullSingleList(i, max_cost))
    }

    return Promise.all(requests)
        .then(() => {
            allies = _.flatten(allies)
            allies = _.orderBy(allies, (ally) => {
                return ally.cost
            })
            return allies
        })
        .then(() => {
            let lastAllyCost = _.head(_.orderBy(allies, 'cost', 'desc')).cost
            // if(lastAllyCost > params.min_cost) {
            //     return searchAllies(lastAllyCost-1)
            // }
            return allies
        })
        .catch((error) => console.log(error))
}

const pullSingleList = (i, max_cost) => {
    return new AllyList(
        user.session_id,
        params.limit,
        params.offsets[i],
        params.min_cost,
        max_cost
    )
    .post()
    .then((data) => allies.push(data.users))
}

const tabulateAllies = () => {
    let goodAllies = [],
        table = new Table({
            head: ['Username', 'Cost', 'Ratio', 'Combined stats', 'Attack', 'Defense', 'Spy Attack', 'Spy Defense', 'Has spell'],
            style: { 'padding-left': 0, 'padding-right': 0 }
        })

    console.log('==============================================')
    console.log("Analyzing allies list...".yellow)
    console.log()

    for(i = 0; i < allies.length; i++) {
        let ally = allies[i],
            combinedStats = ally.bonus.attack + ally.bonus.defense + ally.bonus.spy_attack + ally.bonus.spy_defense,
            ratio = (combinedStats/ally.cost)*1000000

        ally['combined_stats'] = combinedStats
        ally['ratio'] = ratio

        if(ratio > 5 && ally.superpower_expire_date != null) {
            goodAllies.push(ally)
            table.push([
                ally.username,
                ally.cost,
                (Math.round(ally.ratio * 100) / 100),
                combinedStats,
                ally.bonus.attack,
                ally.bonus.defense,
                ally.bonus.spy_attack,
                ally.bonus.spy_defense,
                ally.superpower_expire_date != null ? 'Yes' : 'No'
            ])
        }
    }
    console.log("Total allies count: " + allies.length)
    console.log("Total tradeable allies count: " + goodAllies.length)
    console.log(colors.green("The best ally found was:") + colors.yellow(_.head(_.orderBy(goodAllies, 'ratio', 'desc')).username) + colors.green(" with a ratio of ") + colors.yellow(_.head(_.orderBy(goodAllies, 'ratio', 'desc')).ratio))

    console.log('==============================================')
    console.log(table.toString())
}

run()
