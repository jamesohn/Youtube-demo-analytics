// Getting video_detail_info by each videos on YouTube Channel using Youtube Data API v3

var async = require('async');
var request = require('request-promise');
var fs = require('fs');
var date = require('date-utils');

var base_url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics';

async function saveData(file, videoId, videoTitle, videoUrl, videoThumbnails, videoCategory, videoViewCount, videoLikeCount, videoDislikeCount, videoCommentCount, videoPublishedAt, videoCrawledAt){
  await file.write('{\nvideo_id: ' + videoId + ',\n');
  await file.write('video_name: ' + videoTitle + ',\n');
  await file.write('video_url: ' + videoUrl + ',\n'); // get url
  await file.write('video_thumbnails: ' + videoThumbnails + ',\n'); // can choose default(88), medium(240), high(800)
  await file.write('video_category: ' + videoCategory + ',\n');
  await file.write('video_viewCount: ' + videoViewCount + ',\n');
  await file.write('video_likeCount: ' + videoLikeCount + ',\n');
  await file.write('video_dislikeCount: ' + videoDislikeCount + ',\n');
  await file.write('video_commentCount: ' + videoCommentCount + ',\n');
  await file.write('video_publishedAt: ' + videoPublishedAt + ',\n');
  await file.write('video_crawledAt: ' + videoCrawledAt + '\n}');
}
// Will Modify file.write codes to JSON style maker
module.exports = function(api_key) {
  return {
    videoDetail: function(dir_name, videoId) {
      var url = base_url + '&key=' + api_key + '&id=' + videoId;
      // var newDate = new Date();
      // var time = newDate.toFormat('YYYY_MM_DDTHH24:MI:SS.000Z');
      var file_name = dir_name + videoId + '_videoDetail' + '.txt';
      var file = fs.createWriteStream(file_name);
      async function main(url, file) {
        async function search_video(url) {
          var body = await request({
              url: url,
              json: true
            })
            .then(function(response) {
              if (response)
                return response;
            })
            .catch(function(err) {
              console.log('VideoDetail Error');
              return undefined;
            });
          if (body !== undefined) {
            if (body.items !== undefined) {
              await saveData(
                file,
                videoId,
                body.items[0].snippet.title,
                'http://youtube.com/watch?v=' + videoId,
                body.items[0].snippet.thumbnails.high.url,
                body.items[0].snippet.categoryId,
                body.items[0].statistics.viewCount,
                body.items[0].statistics.likeCount,
                body.items[0].statistics.dislikeCount,
                body.items[0].statistics.commentCount,
                body.items[0].snippet.publishedAt,
                // time
              );
            }

            return body.items[0].statistics.commentCount;
          }
          else{
            return 'none';
          }
        }
        var r = await search_video(url);
      }
      main(url, file);
      return 'done';
    },

    videoCommentCount: function(videoId) {
      var url = base_url + '&key=' + api_key + '&id=' + videoId;
      async function search_video(url) {
        var body = await request({
            url: url,
            json: true
          })
          .then(function(response) {
            if (response)
              return response;
          })
          .catch(function(err) {
            console.log('VideoDetail Error');
            return undefined;
          });
        if (body !== undefined) {
          if (body.items !== undefined) {
              return body.items[0].statistics.commentCount;
          }
          // return body.items[0].statistics.commentCount;
        }
        else{
          return 'none';
        }
      }
      let commentCount = new Promise(function(resolve,reject){
        videoCommentCount = search_video(url);
        if (videoCommentCount != undefined) {
          resolve(videoCommentCount);
        } else {
          reject('undefined');
        }
      });
      return commentCount.then(function(result){
        return result;
      }).catch(function(result){
        return 'not found';
      })

    }


  }
}
