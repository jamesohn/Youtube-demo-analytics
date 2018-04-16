// Getting commenter author channel id from comments using YouTube Data API for Developer (v3)

var async = require('async');
var request = require('request-promise');
var fs = require('fs');
var date = require('date-utils');
var mkdirp = require('mkdirp');
var video_detail_node = require('./youtube_videodetail_node.js');
var crawler_node = require('./crawler0.js')
var authorChannelId_list = []
var Q = require('q');

var base_url = 'https://www.googleapis.com/youtube/v3/commentThreads?textFormat=plainText&part=snippet&maxResults=100';

module.exports = {
 commentAuthorIdAsync: function(api_key, channel, video, videoCommentCount, callback) {
    var deferred = Q.defer();
    var init_url = base_url + '&key=' + api_key + '&videoId=' + video;
    var url = init_url;
    var mid_url = init_url;
    // var newDate = new Date();
    // var time = newDate.toFormat('YYYY_MM_DDTHH24:MI:SS.000Z');
    var file_name = channel + '_commentAuthorChannelId2' + '.txt';
    var nextPageToken;
    var prevPageToken;
    var publishedAt;
    var pageList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    async function main(file_name, init_url, url, mid_url, nextPageToken, prevPageToken, publishedAt, pageList) {
      var loop_count = Math.floor(videoCommentCount / 1000 + 1);
      if (videoCommentCount === 0) {
        deferred.reject(Error('Video Comments Not Found'));
      }

      // var file = await fs.createWriteStream(file_name);
      async function search_for_1000() {
        for (const page of pageList) {
          var body = await request({
              url: url,
              json: true
            })
            .then(function(response) {
              if (response)
                return response;
            })
            .catch(function(err) {
              return undefined;
            });
          if (body !== undefined && body.items !== undefined) {
            for (var j = 0; j < body.items.length; j++) {
              var item = body.items[j];
              if (item !== undefined) {
                let commentAuthorId = await item.snippet.topLevelComment.snippet.authorChannelId.value;
                // await file.write(commentAuthorId + '\n');

                // var filen = channel + 'authorChannelId.txt'
                // await file.write()
                authorChannelId_list.push(commentAuthorId)
                // console.log(authorChannelId_list.length);
                console.log(authorChannelId_list.length);

                // console.log(item.snippet.topLevelComment);
              }
              nextPageToken = await body.nextPageToken;
              publishedAt = await item.snippet.publishedAt;
            }
            if (nextPageToken != 'endPage')
              url = await mid_url + '&pageToken=' + nextPageToken;
            if (nextPageToken == prevPageToken)
              return 'done';
            prevPageToken = nextPageToken;
          }
          else {
            if (page < 9)
              break;
            else
              deferred.reject(Error('Video Result Page Error'));
          }
        }
        mid_url = await init_url + '&publishedBefore=' + publishedAt;
        url = mid_url;
        nextPageToken = 'endPage';
      }

      for(var i = 0; i < loop_count; i ++){
        var r = await search_for_1000();
      }
      deferred.resolve('done');
    }
    main(file_name, init_url, url, mid_url, nextPageToken, prevPageToken, publishedAt, pageList)
    deferred.resolve('done');
  }

}
