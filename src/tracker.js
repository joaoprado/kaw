const _ = require('lodash')
const colors = require('colors')
const Table = require('cli-table')
const fs = require('fs')
const NodeCache = require('node-cache')
const Cache = new NodeCache()

const Auth = require('./socket/kaw').auth
const Profile = require('./socket/kaw').profile

let user, allies = [],
    user_ids = [246740967, 515119695]

const run = () => {
    console.log('==============================================')
    console.log(colors.green('Initiating the app...'))
    console.log()

    Auth.login()
        .then((data) => user = data)
        .then(() => searchUsers())
        .then((data) => saveInformation(data))
}

const searchUsers = () => {
    let requests = []

    for(i = 0; i < user_ids.length; i++) {
        requests.push(searchSingleUser(user_ids[i]))
    }

    return Promise.all(requests)
}

const searchSingleUser = (user_id) => {
    return new Profile(
        user.session_id,
        user_id
    )
    .post()
    .then((data) => {
        return {
            timestamp: new Date(),
            user_id: data.user_id,
            username: data.username,
            clan_bonus: data.clan_bonus,
            fights_won: data.fights_won,
            fights_lost: data.fights_lost,
            steals_won: data.steals_won,
            steals_lost: data.steals_lost,
            missions_completed: data.missions_completed,
        }
    })
}

const saveInformation = (users) => {
    _.each(users, (user) => {
        let dir = 'src/tracker/',
            fileName = user.user_id +'.json',
            file = dir + fileName,
            trackingData = []

        if (! fs.existsSync(dir)) {
            fs.mkdirSync(dir)
        }

        if(fs.existsSync(file)) {
            let data = fs.readFileSync(file)
            trackingData = JSON.parse(data)
        }

        trackingData.push(user)
        
        fs.writeFileSync(file, JSON.stringify(trackingData, null, 4))
        console.log("O arquivo foi criado " + colors.red(file))
    })
}


run()
