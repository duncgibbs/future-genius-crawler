module.exports = function() {
    var module = {};

    var MongoClient = require('mongodb').MongoClient;
    var url = 'mongodb://localhost:27017/future-genius-crawler';

    function databaseCall(collectionName, callback) {
        MongoClient.connect(url, function(err, db) {
            var collection = db.collection(collectionName);
            callback(collection);
            db.close();
        });
    };

    module.getArtistSongCount = function(artistId, callback) {
        databaseCall('artists', function(collection) {
            collection.find({id: artistId}).toArray(function(err, artists) {
                callback(artists[0]);
            });
        });
    };

    module.insertArtistSongCount = function(artistId, songCount) {
        databaseCall('artists', function(collection) {
            collection.insert({id: artistId, song_count: songCount});
        });
    };

    module.insertQuote = function(keyword, quote) {
        databaseCall('quotes', function(collection) {
            collection.insert({keyword: keyword, quote: quote.quote, title: quote.title, episode: quote.episode});
        });
    };

    return module;
}
