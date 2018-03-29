var AWS = require('aws-sdk');
var Buffer = require('buffer').Buffer;
var zlib = require('zlib');

AWS.config.loadFromPath('./config.json');

    exports.handler = function(event, context) {

        var eventData = JSON.stringify(event);
        var contextData = JSON.stringify(context);

        var data = JSON.parse(eventData);
        var parsedData = data["awslogs"]["data"];
        const buf = new Buffer(parsedData, 'base64');

        zlib.gunzip(buf, function(err, result) {
            if(err) return console.error(err);

            UploadToS3(result);
            console.log('*** Buffer output *** \n\n' +  result);
        });

        function UploadToS3(data) {
            var s3 = new AWS.S3();

            var currentDate = new Date();

            var date = currentDate.getDate();
            var month = currentDate.getMonth(); //Be careful! January is 0 not 1
            var year = currentDate.getFullYear();
            var seconds = currentDate.getSeconds();
            var minutes = currentDate.getMinutes();
            var hours = currentDate.getHours();

            var dateString = (month + 1) + "-" + date  + "-" + year + " " + hours + " " + minutes + ":" + seconds + "";

            var params = {
                Bucket: 'my-bucket-name',
                Key: 'logs/' + dateString + '-log.json',
                Body: data
            };

            s3.putObject(params, function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('File upload to S3 bucket');
                }
            });
        }
        };
