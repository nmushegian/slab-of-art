let snapshotBlock = 7547661;
let chiefAddress = "0x8E2a84D6adE1E7ffFEe039A35EF5F19F13057152";
let chiefDepositsABI = [{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"deposits","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]
let chiefLockTopic = "0xdd46706400000000000000000000000000000000000000000000000000000000"
let fullNodeEndpoint = 'https://mainnet.infura.io/v3/07064b417611465dbcb7812088491075';

let Web3 = require('web3');
let web3 = new Web3(fullNodeEndpoint);

let chief = new web3.eth.Contract(chiefDepositsABI, chiefAddress);
let votes = {};

web3.eth.getPastLogs({
    fromBlock: 'earliest',
    toBlock: 'latest',
    address: chiefAddress,
    topics: [chiefLockTopic]
}).then(function(logs) {
    for (log of logs) {
        let sender = "0x" + log.topics[1].substring(26, 100);
        votes[sender] = 0;
    }
}).then(function() {
    let requests = []; // because I couldn't figure out batching
    for(voter in votes) {
        let _voter = voter; // :sunglasses:
        requests.push(chief.methods
                           .deposits(voter)
                           .call({blockNumber: snapshotBlock})
                           .then(function(weight) {
            votes[_voter] = weight;
        }));
    }
    return Promise.all(requests);
}).then(function() {
    for(voter in votes) {
        console.log(voter, votes[voter].toString());
    }
    var size = 0;
    var nonzeroSize = 0;
    for(voter in votes) {
        if( votes[voter] != 0 ){ 
            nonzeroSize += 1;
        }
        size += 1;
    }
    console.log("Unique addresses at turnout:", nonzeroSize.toString());
    console.log("Unique addresses ever voted:", size.toString());
});
