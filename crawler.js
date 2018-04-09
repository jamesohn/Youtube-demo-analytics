var request = require('request-promise')
var cheerio = require('cheerio')
var Crawler = require('crawler')
var fs = require('fs')
var Math = require('math')
authorChannelId_list = fs.readFileSync('./UCV0qA-eDDICsRR9rPcnG7tw_authorChannelId.txt', 'UTF8').split(/\r?\n/);
const len_list = authorChannelId_list.length
var dict = {}
var dict_Ratio = {}


var c = new Crawler({
maxConnections : 100,
retryTimeout: 1000,
// This will be called for each crawled page
callback : function (error, res, done) {
    if(error){
        console.log(error);
    } else {
        var body = res.$.xml();
        // $ is Cheerio by default
        var $ = cheerio.load(body);
        // Parse html
        var location = $('.country-inline');
        // Delete white space
        var locationText = location.text().trim();
        if (locationText.length > 0){
          // Make dictionary ex. dict = {'미국' : 1, '영국' : 2}
          if (dict[locationText]){
            dict[locationText]= dict[locationText]+1
          } else {
            dict[locationText] = 1
          }
        }
        // Create array of values in dict
        var values = Object.keys(dict).map(function(key){
          return dict[key];
          });
        // Sum values in dict with anonymous function
        var total = values.reduce(function(a,b){return a+b},0);
        // Fill in dict_Ratio and return
        var ratio = Object.keys(dict).map(function(key){
          return dict_Ratio[key] = Math.floor(((dict[key]/total)*10000))/100
          });
        // Create instant array to sort dict_Ratio by value
        var sortable = []
        for (country in dict_Ratio) {
          sortable.push([country, dict_Ratio[country]])
          }
        // Sort the array
        sortable.sort(function(a,b){return b[1]-a[1]})
        // Convert array to obj
        var sorted_obj = sortable.reduce(function(acc, cur, i) {
          acc[cur[0]] = cur[1];
          return acc;
          }, {});

        console.log(total, sorted_obj);

    }
    done();
}
});

// iterate authorChannelId_list for url creation
for (j=0; j<len_list; j++) {
  var authorChannelId = authorChannelId_list.shift();
  console.log(authorChannelId_list.length);
  if (authorChannelId.length>0){
    var url = 'https://www.youtube.com/channel/' + authorChannelId + '/about'
    c.queue(url);
  }
}
