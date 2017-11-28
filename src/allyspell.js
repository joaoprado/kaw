var _ = require('lodash');
var Auth = require('./socket/kaw').auth;
var Player = require('./socket/kaw').player;
const NodeCache = require('node-cache');
const Cache = new NodeCache();
var colors = require('colors');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

// if superpower_expire_data != null
// superpower_item_id_list has 162 || 163

const allyHidders = [
    // 'XlIlX-Maniackis-XlIlX',
    // 'o0O__Tim_The__Enchanter__--',
    // '__Roger_The_Shrubber___',
    // 'h_r_shots',
    // '-llLll0llRllDII--ViK--lIl1lIl-',
    // '-lLll0llRllDl--Sparda--lI1Il-',
    // '-lLllAllDllYI--Laura--lIl1lIl-', // no allies
    // 'ShadowBlurb',
    // 'Vamperous',
    // 'ReturnOfAmar',
    // '_________Farm____U____',
    // '_ll11_c__h__y___l1__',
    // 'Harbinger_of_wrath',
    // '1SexyLady',
    // 'Fighter1510',
    // 'lsutiger93',
    // 'mostly_harmless',
    // 'ZUL_SCORPIOUS_THE_HORNIOUS_ZUL',
    // '-Indecent_Exposure-', // no allies
    // 'Xx-Disturbed-Rabbit-xX',
    // 'ZUL_120PROOFHIllBIllYSHINE_ZUL', // Invalid
    // 'iiixxx_cryptkeeperxxx666',
    // '-Centauri_of_Carnage-',
    // 'Resilient_ZombieTrooper',
    // 'Resilient_LaDyAsHx',
    // 'Ty',
    // 'Resilient_PrincessXystal',
    // 'King-Of-Terror', // no allies
    // 'Resilient_xM3rcy',
    // 'ethan8',
    // 'Resilient_XecutioneR', // no allies
    // 'Resilient_x-NI-1l-NI-ji-4l-x', // no allies
    // 'RES_CAS_MattTheKnife',
    // 'Aella', // no allies
    // '____-____kARmA___-_____',
    // '-_KiNG_WiLS_-', // invalid
    // 'Alexandar_the_Great_Macedonian',
    // 'outlawz_futz_voodoo',
    // '-_-M-_A-_L-_A-_K-_A-_I-_-',
    // 'Indian_Outlaw',
    // 'Ryda_____DkoD',
    // 'Etrnl',
    // 'BaDaSs-_PuNs_-DeViLs__RePuBLiC',
    // '__xXx__Boricua-Guerrero__xXx__',
    // 'BaDaSs_BrilliantHaze_DeViL',
    // 'studdmufffin',
    // 'BEAST38_SLaYiNg_GriLLeDCHicKeN',
    // '-gods-',
    // 'BiggSexyy',
    // 'GLEN',
    // '___GLocK_19___',
    // '-_X_xRachelAnnx_X_-',
    // 'aelico',
    // '__Smurfette__', // no allies
    // '-Frigga-',
    // '-x-Sky-x-',
    // 'lllAlllLillYlllSillSiliAll',
    // 'xHappYx',
];

const proxies = [
    'http://165.138.124.4:8080', //Ok
    'http://173.26.241.133:53281', //Ok
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
    .then(() => verifyAllyHidders())
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

const verifyAllyHidders = async(() => {
    _.each(allyHidders, (player) => {
        console.log(colors.yellow('Verifying player: ' + player));
        let report = await(runUserVerification(player));
        console.log(report);
    });
});

const runUserVerification = async((player) => {
    let report = '';
    await(
        new Player(Cache.get('user').session_id, player, proxies[Math.floor(Math.random()*proxies.length)]).check()
            .then((message, color) => {
                report = message + '\n';
            })
            .catch((err) => {
                console.log(err);
                return runUserVerification(player);
            })
    );

    return report;
});
