module.exports = {
    getIMDBQuote: function(searchWord) {
        var spawn = require('child_process').spawnSync;
        var child = spawn('casperjs' , ['quote_getter.js', '"'+searchWord+'"']);
        return String(child.stdout);
    }
}
