module.exports = function() {
    var module = {};

    module.randomInt = function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    module.getRandomElements = function(array, numElements) {
        var randomIdx = this.randomInt(0, (array.length-1));
        var randomEnd = randomIdx + numElements;
        if(randomEnd > array.length) {
            randomIdx = randomIdx - (randomEnd - array.length);
            randomEnd = randomIdx + numElements;
        }
        return array.slice(randomIdx, randomEnd);
    };

    module.cleanupString = function(string) {
        return string.replace(/[^a-zA-Z ]/g, "")
    };

    module.getAccessToken = function() {
        const execSync = require('child_process').execSync;
        const output = execSync('node scripts/accessTokenGenerator.js');
        const accessToken = String(output);
        return accessToken.substring(0, accessToken.length - 1);
    };

    return module;
}
