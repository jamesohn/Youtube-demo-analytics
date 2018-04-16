// Getting channel_detail_info by each channel on YouTube using Youtube Data API v3

var async = require('async');
var request = require('request-promise');
var fs = require('fs');
var date = require('date-utils');
var Q = require('q');

var base_url = 'https://www.googleapis.com/youtube/v3/channels?part=id,snippet,statistics';

async function saveData(file, channelId, channelTitle, channelUrl, channelThumbnails, channelViewCount, channelSubscriberCount, channelVideoCount, channelPublishedAt, channelCrawledAt){
  await file.write('{\nchannel_id: ' + channelId + ',\n');
  await file.write('channel_name: ' + channelTitle + ',\n');
  await file.write('channel_url: ' + channelUrl + ',\n'); // get url
  await file.write('channel_thumbnails: ' + channelThumbnails + ',\n'); // can choose default(88), medium(240), high(800)
  await file.write('channel_viewCount: ' + channelViewCount + ',\n');
  await file.write('channel_subscriberCount: ' + channelSubscriberCount + ',\n');
  await file.write('channel_videoCount: ' + channelVideoCount + ',\n');
  await file.write('channel_publishedAt: ' + channelPublishedAt + ',\n');
  await file.write('channel_crawledAt: ' + channelCrawledAt + '\n}');
}

module.exports = {
  channelDetailAsync: function(api_key, channel, callback){
    var deferred = Q.defer();
    var url = base_url + '&key=' + api_key + '&id=' + channel;
    // var newDate = new Date();
    // var time = newDate.toFormat('YYYY_MM_DDTHH24:MI:SS.000Z');
    var file_name = channel + '_channeldetail' + '.txt';

    async function main(url, file_name){
      var body = await request({
        url: url,
        json: true
      })
      .then(function(response){
        if(response)
          return response;
      })
      .catch(function(error){
        console.log('ChannelDetail Error');
        console.log(error);
      });

      if(body !== undefined){
        if (body.items[0].statistics.videoCount !== "0" && body.items[0].statistics.videoCount !== 0) {
          var file = await fs.createWriteStream(file_name);
          await saveData(
            file,
            channel,
            body.items[0].snippet.title,
            'http://www.youtube.com/channel/' + channel,
            body.items[0].snippet.thumbnails.high.url,
            body.items[0].statistics.viewCount,
            body.items[0].statistics.subscriberCount,
            body.items[0].statistics.videoCount,
            body.items[0].snippet.publishedAt,
            // time
          );
          deferred.resolve(body.items[0].statistics.videoCount);
        }
        else{
          deferred.reject(Error('Empty Channel'));
        }
      }
      else{
        deferred.reject(Error('Invalid Channel'));
      }

      deferred.promise.nodeify(callback);
      return deferred.promise;
    }
    main(url, file_name);
  }
}
