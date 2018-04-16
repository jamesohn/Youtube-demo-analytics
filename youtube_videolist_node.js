// Getting video_ids by each channel on YouTube using Youtube Data API v3
// This gets maximum over 500 videos' video_id by nextPageToken, publishedAt
// This gets video_id by Youtube Data API v3's Search API

// basic code

var async = require('async');
var request = require('request-promise');
var fs = require('fs');
var date = require('date-utils');
var mkdirp = require('mkdirp');
var video_detail_node = require('./youtube_videodetail_node.js');
var commenter_authorId_node = require('./youtube_authorChannelId_node.js')
var Q = require('q');

var base_url = 'https://www.googleapis.com/youtube/v3/search?part=id,snippet&type=video&order=date&maxResults=50';

module.exports = {
  videoListAsync: function(api_key, channel, videoCount, callback) {
    var deferred = Q.defer();
    var init_url = base_url + '&key=' + api_key + '&channelId=' + channel;
    var url = init_url;
    var mid_url = init_url;
    // var newDate = new Date();
    // var time = newDate.toFormat('YYYY_MM_DDTHH24:MI:SS.000Z');
    var file_name = channel + '_videolist' + '.txt';
    var nextPageToken;
    var prevPageToken;
    var publishedAt;
    var pageList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    async function main(file_name, init_url, url, mid_url, nextPageToken, prevPageToken, publishedAt, pageList) {
      var loop_count = Math.floor(videoCount / 500 + 1);
      if (videoCount === 0) {
        deferred.reject(Error('Video Results Not Found'));
      }
      var dir_name = './' + channel + '_videoDetail/';
      await mkdirp(dir_name, function(err) {
        if (err) {
          deferred.reject(Error('MKDIR failed'));
        }
      });
      //var file = await fs.createWriteStream(file_name);
      async function search_for_500() {
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
                if (item.id.videoId !== undefined) {
                  let videoDetail = await video_detail_node(api_key);
                  let videoCommentCount = await videoDetail.videoCommentCount(item.id.videoId);
                  let commentAuthorId = await commenter_authorId_node.commentAuthorIdAsync(api_key, channel, item.id.videoId, videoCommentCount)

                  // ADD YOUR MODULE based on videolists

                  // await console.log(commentAuthorId);
                  // await console.log('videoId: ' + item.id.videoId + ' ' + videoDetail.videoDetail(dir_name, item.id.videoId) +' '+ 'videoCommentCount is ' + videoCommentCount);
                }
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
        var r = await search_for_500();
      }
      deferred.resolve('done');
    }
    main(file_name, init_url, url, mid_url, nextPageToken, prevPageToken, publishedAt, pageList);
    deferred.resolve('done');
  }
}
