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

    module.insertQuote = function(quote, callback) {
        databaseCall('quotes', function(collection) {
            var quoteObject = {
                keyword: quote.keyword,
                quote: quote.quote,
                title: quote.title,
                episode: quote.episode
            };

            collection.insert(quoteObject, function(error, result) {
                callback(result);
            });

        });
    };

    module.insertAnnotation = function(annotation, quoteId) {
        databaseCall('annotations', function(collection) {
            var annotationObject = {
                annotation_id: annotation.annotation.id,
                annotation_url: annotation.annotation.share_url,
                quote: quoteId
            };

            collection.insert(annotationObject);
        });
    };

    module.getQuotes = function() {
        databaseCall('quotes', function(collection) {
            collection.find({}).toArray(function(err, quotes) {
                console.log(quotes);
            });
        });
    };

    return module;
}
