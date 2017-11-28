const _ = require('lodash')
const request = require('request')
const colors = require('colors')
const Table = require('cli-table')
const NodeCache = require('node-cache')
const Cache = new NodeCache()

const Auth = require('./socket/kaw').auth
const AllyList = require('./socket/kaw').allylist

let user, allies = []

const run = () => {
    console.log('==============================================')
    console.log(colors.green('Initiating the app...'))
    console.log()

    Auth.login()
        .then((data) => user = data)
        .then(() => {
            let offsets = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450],
                requests = []

            for(i = 0; i < offsets.length; i++) {
                requests.push(new AllyList(user.session_id, 50, offsets[i], 0, 300523070492768)
                    .post()
                    .then((data) => allies.push(data.users)))
            }

            return Promise.all(requests)
                .then(() => {
                    allies = _.flatten(allies)
                    allies = _.orderBy(allies, (ally) => {
                        return ally.bonus.spy_attack
                    })
                    return allies
                })
        })
        .then(() => {
            let goodAllies = [],
                table = new Table({
                    head: ['Username', 'Cost', 'Ratio', 'Combined stats', 'Attack', 'Defense', 'Spy Attack', 'Spy Defense'],
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

                if(ratio > 5) {
                    goodAllies.push(ally)
                    table.push([
                        ally.username,
                        ally.cost,
                        (Math.round(ally.ratio * 100) / 100),
                        combinedStats,
                        ally.bonus.attack,
                        ally.bonus.defense,
                        ally.bonus.spy_attack,
                        ally.bonus.spy_defense
                    ])
                }
            }
            console.log("Total allies count: " + allies.length)
            console.log("Total tradeable allies count: " + goodAllies.length)
            console.log("The price of the last ally found is: " + allies.pop().cost)
            console.log(colors.green("The best ally found was:") + colors.yellow(_.head(_.orderBy(goodAllies, 'ratio', 'desc')).username) + colors.green(" with a ratio of ") + colors.yellow(_.head(_.orderBy(goodAllies, 'ratio', 'desc')).ratio))

            console.log('==============================================')
            console.log(table.toString())
        })
}

run()
