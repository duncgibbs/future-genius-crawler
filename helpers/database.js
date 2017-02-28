var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/future-genius-crawler';

module.exports = {
    getArtistSongCount: function(artistId, callback) {
        MongoClient.connect(url, function(err, db) {
            var collection = db.collection('artists');
            collection.find({id: artistId}).toArray(function(err, artists) {
                callback(artists[0]);
            });
            db.close();
        });
    },

    insertArtistSongCount: function(artistId, songCount) {
        MongoClient.connect(url, function(err, db) {
            var collection = db.collection('artists');
            collection.insert({id: artistId, song_count: songCount});
            db.close();
        });
    }
}
