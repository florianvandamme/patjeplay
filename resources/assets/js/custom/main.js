var queue = [],
    foundVideos,
    count = 0,
    suggestions,
    currentSong,
    time,
    globalDrag = false,
    done = false,
    player;

/**
 * On document ready
 */
$(document).ready(function () {
    startPlay();
    addQueue('suggestions');
    addQueue('results');
    removeFromQueue();
    playNowFromQueue();
    pausePlayVideo();
    nextSong();
    replay();
    slide('volume-slider', 'volume-background', 250, 'volume');

    // Hide the error div by default
    $('.errors').hide();
});

/**
 * Function showResponse
 *
 * Filters out all the garbage info the YoutubeJSON returns
 *
 * @param response
 */
function showResponse(response) {
    // Initiate a new array
    var results = [];
    // Loop every result
    $.each(response, function (i, val) {
        // Push the value
        results.push(val);
    });

    // Only parse the part we need
    parseResults(results[4]);
}

/**
 * Function parseResults
 *
 * Get all the videoID's returned by the search function and preform another AJAX call to fetch the
 * ContentDetails and Statistics because Youtube does not allow us to do this in one call
 *
 * @param {*} array - JSON with the results from the search function
 * @returns {*}
 */
function parseResults(array) {
    // Initiate the results and videoIds variable
    var results = '',
        videoIds = '';

    // Loop the results array
    $.each(array, function (i, val) {
        // Get the ID from each results and push it to the
        // videoID's
        var videoId = val['id']['videoId'];
        videoIds += videoId + ',';
    });
    // Remove the last ',' from the videoIds variable
    videoIds = videoIds.slice(0, -1);

    // Build the URL to query
    var url1 = "https://www.googleapis.com/youtube/v3/videos?id="
        + videoIds
        + "&key=AIzaSyBSHlj45Ctdlr7kopF42BLfWvivP6XDop4&part=snippet,contentDetails,statistics";

    // Preform the AJAX call
    var xhr = $.ajax({
        async: false,
        type: 'GET',
        url: url1,
        // If the AJAX call succeeds
        success: function (data) {
            // Initiate the increment variable
            var y = 0;
            // Push the results to the foundVideos variable for safekeeping
            foundVideos = data['items'];
            // Loop the results
            $.each(data['items'], function (i, val) {
                // Set all the info needed to build the div
                var videoId = data['items'][y]['id'],
                    duration = convert_time(data['items'][y]['contentDetails']['duration']),
                    views = data['items'][y]['statistics']['viewCount'],
                    title = data['items'][y]['snippet']['title'],
                    user = data['items'][y]['snippet']['channelTitle'],
                    thumbnail = data['items'][y]['snippet']['thumbnails']['high']['url'];

                // We check if the video has a "maxres" thumbnail - we have to preform this check because not every
                // video has one. Only the "high" thumbnail is required
                if ("maxres" in data['items'][y]['snippet']['thumbnails']) {
                    // If it exists we make the thumbnail maxres
                    thumbnail = data['items'][y]['snippet']['thumbnails']['maxres']['url'];
                }

                // Build the HTML for the results div
                results += buildDiv(title, user, thumbnail, videoId, duration, views, y);

                // Increment
                y++;
            });
        }
    });

    // Append the results to the results div
    $('.results').html(results);
    return xhr;
}

/**
 * Function convert_time
 *
 * Youtube API returns the duration of the video in some weird format
 * this function stolen from the internet converts this to a readable format (eg. 3:01)
 *
 * @param duration - Duration in the weird Youtube format
 * @returns {string} duration - Returns duration in a readable format
 */
function convert_time(duration) {
    var a = duration.match(/\d+/g);

    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    var h = Math.floor(duration / 3600);
    var m = Math.floor(duration % 3600 / 60);
    var s = Math.floor(duration % 3600 % 60);
    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

/**
 * Function buildDiv
 *
 * Builds the result Div
 *
 * @param {string} title - Title of the song
 * @param {string} user - Name of the channel
 * @param {string} thumbnail - The URL with the image
 * @param {string} videoId - The videoId of the song on Youtube
 * @param {string} duration - The Duration of the song
 * @param {int} views - Amount of views
 * @param {int} y - Increments
 * @returns {string} div - HTML for results div
 */
function buildDiv(title, user, thumbnail, videoId, duration, views, y) {
    var div = '';
    div += '<div class="video-result">';
    div += '<div class="video-background">';
    div += '<img src="' + thumbnail + '">';
    div += '</div>';
    div += '<div class="video-thumbnail">';
    div += '<img src="' + thumbnail + '">';
    div += '</div>';
    div += '<div class="video-info">';
    div += '<h2>' + title + '</h2>';
    div += '<p>' + user + ' - ' + duration + '</p>';
    div += '<button class="play-button" data-object-id="' + y + '" data-video-id="' + videoId + '">Play now</button>';
    div += '<button class="queue-button" data-object-id="' + y + '" data-video-id="' + videoId + '">Add to queue</button>';
    div += '</div>';
    div += '</div>';

    return div;
}

/**
 * Function onYouTubeIframeAPIReady
 *
 * Function loads the first iFrame in the app. This is a standard function from the
 * Youtube API.
 *
 * TODO:: We have a fixed first song right now, we might want to spice things a little up by picking something random
 * TODO:: Pretty sloppy code there should be a better solution to this
 *
 * @param {string} id - The videoId of the song
 */
function onYouTubeIframeAPIReady(id) {
    // If there's no ID passed
    if (id == null) {
        // Return to default
        id = '2DnOnw18u5E';
    }

    // Build the URL to fetch the default song
    var url1 = "https://www.googleapis.com/youtube/v3/videos?id="
        + id
        + "&key=AIzaSyBSHlj45Ctdlr7kopF42BLfWvivP6XDop4&part=snippet,contentDetails,statistics";

    // Start the AJAX call
    $.ajax({
        async: false,
        type: 'GET',
        url: url1,
        // If the AJAX call was successful
        success: function (data) {
            // Build the song object
            var song = {
                'position': count,
                'videoId': id,
                'title': data['items'][0]['snippet']['title'],
                'duration': convert_time(data['items'][0]['contentDetails']['duration']),
                'thumbnail': data['items'][0]['snippet']['thumbnails']['high']['url']
            };
            // Increase to count to set the correct positions
            count++;
            // Update the current song
            currentSong = song;
            // Create the bottom player for the song
            displayCurrentSong();
        }
    });

    // Set the videoID and the width
    var video_id = id,
        width = $('#player-col').width();

    // Initiate a new YoutubePlayer with the defined ID and width
    player = new YT.Player('player', {
        height: '400',
        width: width,
        videoId: id,
        events: {
            // Refer to the onPlayerStateChange to listen to all the events needed
            'onStateChange': onPlayerStateChange
        }
    });

    // TODO:: This is layout related stuff, might want to move this if
    // TODO:: there's a more definite layout
    // Initiate all the height variables needed for layout purposes
    var height = $(window).height(),
        navHeight = $('nav').height(),
        searchHeight = $('.search-field').height(),
        vidHeight = $('#player').height();

    // Set the height of the results div and the queue div. We do this to make sure
    // we can scroll in these divs.
    $('.results').css({'height': (height - navHeight - searchHeight - 75) + 'px'});
    $('.queue').css({'height': (height - navHeight - vidHeight - 50) + 'px'});

    // Show the suggestions based on the video-id
    showSuggestions(video_id);
}

/**
 * Function onPlayerReady
 *
 * Fires when the player is ready and loaded. This is a default
 * function from the Youtube API
 *
 * @param event
 */
function onPlayerReady(event) {
    // Start playing the video when it's ready
    event.target.playVideo();

    // If the queue is empty
    if (queue.length == 0 || queue.length < 1) {
        // Get the current video URL
        var url = event.target.getVideoUrl();
        // "http://www.youtube.com/watch?v=gzDS-Kfd5XQ&feature=..."
        var match = url.match(/[?&]v=([^&]+)/);
        // ["?v=gzDS-Kfd5XQ", "gzDS-Kfd5XQ"]
        // Get the current videoId
        var videoId = match[1];

        // Show suggestions based on the videoId
        showSuggestions(videoId);
    }
}

/**
 * Function onPlayerStateChange
 *
 * This function gets fired if the state of the
 * player changes. This is a function from the Youtube API
 *
 * @param event
 */
function onPlayerStateChange(event) {
    // Find the pause button
    var pause = $('.pause');

    // If the player is playing
    if (event.data == YT.PlayerState.PLAYING) {
        // Get the currentVolume and pass the width of the volumeDiv
        getCurrentVolume(250);
        // Start sliding the duration of the song
        slide('duration-slider', 'duration-background', 500, 'player');
        // Start showing the time of the song
        showTime(currentSong['duration']);

        // Remove the play button and show the pause button
        if (pause.hasClass('fa-play')) {
            pause.removeClass('fa-play');
            pause.addClass('fa-pause');
        }
    }

    // If the player is paused
    if (event.data == YT.PlayerState.PAUSED) {
        // Remove the pause button and show the play button
        if (pause.hasClass('fa-pause')) {
            pause.removeClass('fa-pause');
            pause.addClass('fa-play');
        }
    }

    // If the song has ended
    if (event.data == YT.PlayerState.ENDED) {
        // Get the current video URL
        var url = event.target.getVideoUrl();
        // "http://www.youtube.com/watch?v=gzDS-Kfd5XQ&feature=..."
        var match = url.match(/[?&]v=([^&]+)/);
        // ["?v=gzDS-Kfd5XQ", "gzDS-Kfd5XQ"]
        var videoId = match[1];

        // Check if there's a queue
        // If not
        if (queue.length == 0 || queue.length < 1) {
            // Start auto playing from the suggestions
            autoPlay(suggestions);
            // Update the suggestions based on the new song
            showSuggestions(videoId);
        // If there is a queue
        } else {
            // Fetch the position and id of the next song from the queue
            var position = queue[0]['position'],
                video_Id = queue[0]['videoId'];

            // Build the CurrentSong object
            currentSong = queue[0];

            // Start playing the new song
            player.loadVideoById(currentSong['videoId']);

            // Display the song in the bottom
            displayCurrentSong(1);

            // Remove the element from the queue div
            $('#' + position).remove();

            // If the song is queue
            if (findElement(queue, 'videoId', video_Id) !== 'undefined') {
                // Remove it
                findAndRemove(queue, 'videoId', video_Id);
            }

            // If this was the last song from the queue
            if (queue.length == 0 || queue.length < 1) {
                // Show suggestions based on the new song
                showSuggestions(currentSong['videoId']);
            }
        }
        // Set done to true
        done = true;
    }
}

/**
 * Function findElement
 *
 * Searches for an element in the passed array. If it's found return the object,
 * else returns undefined
 *
 * @param {*} arr - The array to look in
 * @param propName - The key of the pair
 * @param propValue - The value of the pair
 * @returns {*} object - The object or undefined if not found
 */
function findElement(arr, propName, propValue) {
    // Loop passed array
    for (var i = 0; i < arr.length; i++)
        // If the object has the key and it's equal to
        // the given value
        if (arr[i][propName] == propValue) {
            // Return the object
            return arr[i];
        }
}

/**
 * Function showSuggestions
 *
 * Show 10 song suggestions based on the song that's currently playing
 *
 * @param {string} id - The Youtube videoId of the current song
 */
function showSuggestions(id) {
    // Fetch the queue div
    var queueDiv = $('.queue');
    // We need to make sure the queue is empty before we start
    // appending suggestions to the queue
    if (queue.length == 0 || queue.length < 1) {
        // Build the URL that needs to be queried to find the related songs
        var url1 = " https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId="
            + id
            + "&maxResults=10&type=video&key=AIzaSyBSHlj45Ctdlr7kopF42BLfWvivP6XDop4&part=snippet,contentDetails,statistics";

        // Start the AJAX call
        $.ajax({
            async: false,
            type: 'GET',
            url: url1,
            // If the call was successful
            success: function (data) {
                // Initiate a variable in which to store the video ID's
                var videoIds = '';

                // Loop the returned results and put the video ID's in the variable
                $.each(data['items'], function (i, val) {
                    var videoId = val['id']['videoId'];
                    videoIds += videoId + ',';
                });
                // Remove the last ','
                videoIds = videoIds.slice(0, -1);

                // Build the URL for the AJAX call
                var url1 = "https://www.googleapis.com/youtube/v3/videos?id="
                    + videoIds
                    + "&key=AIzaSyBSHlj45Ctdlr7kopF42BLfWvivP6XDop4&part=snippet,contentDetails,statistics";

                // Prepare the second call. The Youtube API won't allow us to fetch the details and statistics
                // needed for the time, the views, ... in one call. So we have to do a second to fetch this information
                $.ajax({
                    async: false,
                    type: 'GET',
                    url: url1,
                    // If the call was successful
                    success: function (data) {
                        // We shuffle the returned array
                        shuffle(data['items']);

                        // Fill the suggestions array
                        suggestions = data['items'];
                        // Empty the current queue div
                        queueDiv.empty();

                        // Build the div to be displayed in the queue
                        var div = '';
                        div += '<div class="video-queue">';
                        div += '<span class="video-queue-title">';
                        div += 'Autoplay is enabled until you add something to the queue. Below are the suggestions based on the current song.';
                        div += '</span>';
                        div += '</div>';
                        $.each(suggestions, function (i, song) {
                            div += '<div class="video-queue" id="' + i + '">';
                            div += '<img src="' + suggestions[i]['snippet']['thumbnails']['high']['url'] + '" alt="' + suggestions[i]['snippet']['title'] + '" class="video-queue-image">';
                            div += '<div class="video-queue-info">';
                            div += '<span class="video-queue-title">' + suggestions[i]['snippet']['title'] + '</span>';
                            div += '</div>';
                            div += '<div class="video-queue-controls">';
                            div += '<button class="play-now" data-position="' + i + '" data-video-id="' + suggestions[i]['id'] + '">Play now</button>';
                            div += '<button class="queue-suggestions" data-position="' + i + '" data-video-id="' + suggestions[i]['id'] + '">Add to queue</button>';
                            div += '</div>';
                            div += '</div>';
                        });

                        // Append the div to the queue
                        queueDiv.append(div);
                    }
                })
            }
        });
    }
}

/**
 * Function Shuffle
 *
 * Shuffles the passed Array
 *
 * @param {*} sourceArray - Array to shuffle
 */
function shuffle(sourceArray) {
    for (var n = 0; n < sourceArray.length - 1; n++) {
        var k = n + Math.floor(Math.random() * (sourceArray.length - n));
        var temp = sourceArray[k];
        sourceArray[k] = sourceArray[n];
        sourceArray[n] = temp;
    }
}

/**
 * Function autoPlay
 *
 * If there's no queue we automatically start a new song when the previous
 * has ended
 */
function autoPlay() {
    // Get the video id from the first song in the suggestions queue
    var id = suggestions[0]['id'];

    // Set the currentSong object
    currentSong = {
        'position': 0,
        'videoId': id,
        'title': suggestions[0]['snippet']['title'],
        'duration': convert_time(suggestions[0]['contentDetails']['duration']),
        'thumbnail': suggestions[0]['snippet']['thumbnails']['high']['url']
    };

    // Start the song
    player.loadVideoById(id);

    // Display the bottom player based on the current song
    displayCurrentSong();
}

/**
 * Function startPlay
 *
 * Start the clicked song
 */
function startPlay() {
    // Listen for the click on the play button
    $(document).on('click', '.results .play-button', function () {
        // Get the video id
        var id = $(this).data('video-id'),
            // Get the object id
            objectId = $(this).data('object-id'),
            // Fetch the video object from the foundVideos array based on
            // the found id
            obj = foundVideos[objectId];

        // Create the song object
        currentSong = {
            'position': count,
            'videoId': id,
            'title': obj['snippet']['title'],
            'duration': convert_time(obj['contentDetails']['duration']),
            'thumbnail': obj['snippet']['thumbnails']['high']['url']
        };

        // Start the song
        player.loadVideoById(id);

        // Set the bottom player equal to the current song
        displayCurrentSong();

        // If the queue is non-existent we have to display
        // suggestions based on the current song
        if (queue.length == 0 || queue.length < 1) {
            showSuggestions(id);
        }
    });
}

/**
 * Function addQueue
 *
 * Adds a clicked song to the current queue
 *
 * @param {string} type - Listen to the suggestions and the results to add them to the queue
 */
function addQueue(type) {
    // Set the listen variable depending on the type
    var listen = '.results .queue-button';
    if (type == 'suggestions') {
        listen = '.video-queue .queue-suggestions'
    }
    // Listen for click on the results
    $(document).on('click', listen, function () {
        // Initiate the idType and searchArray variables depending on the
        // passed type
        var idType = 'object-id',
            searchArray = foundVideos;
        if (type == 'suggestions') {
            idType = 'position';
            searchArray = suggestions;
        }
        // Get the passed id
        var id = $(this).data('video-id');

        // Check if the clicked object is already in queue
        // If it's not
        if (!checkIfInQueue(id)) {
            // Get the object-id, this is the index in the array
            // with the found results or the suggestions. If we don't do this we have
            // to make another AJAX call to the Youtube API
            var objectId = $(this).data(idType);
            // Find the passed index in the video array
            var obj = searchArray[objectId];
            // Set the queue div
            var queueDiv = $('.queue');

            // Build the div that will be displayed in the queue
            var div = '';
            div += '<div class="video-queue" id="' + count + '">';
            div += '<img src="' + obj['snippet']['thumbnails']['high']['url'] + '" alt="' + obj['snippet']['title'] + '" class="video-queue-image">';
            div += '<div class="video-queue-info">';
            div += '<span class="video-queue-title">' + obj['snippet']['title'] + '</span>';
            div += '</div>';
            div += '<div class="video-queue-controls">';
            div += '<button class="play-now" data-position="' + count + '" data-video-id="' + id + '">Play now</button>';
            div += '<button class="remove" data-position="' + count + '" data-video-id="' + id + '">Remove</button>';
            div += '</div>';
            div += '</div>';

            // If the queue is empty
            if (queue.length == 0 || queue.length < 1) {
                // We remove all the HTML content AKA the suggestions
                // that are currently displayed in the div
                queueDiv.empty();
            }

            // Build the song object that's pushed to the queue
            var song = {
                'position': count,
                'videoId': id,
                'title': obj['snippet']['title'],
                'duration': convert_time(obj['contentDetails']['duration']),
                'thumbnail': obj['snippet']['thumbnails']['high']['url']
            };

            // Push the object to the queue
            queue.push(song);

            // Append the HTML to the queue div
            queueDiv.append(div);

            // Increment the count (this is used to set the position of the song)
            count++;
        }
    });
}

/**
 * Function removeFromQueue
 *
 * Remove the selected song from the queue
 */
function removeFromQueue() {
    // Listen for click on the remove button
    $(document).on('click', '.video-queue .remove', function () {
        // Get the passed video-id
        var videoId = $(this).data('video-id');
        // Get the position of the clicked element
        var position = $(this).data('position');

        // Remove the element based on the position
        $('#' + position).remove();

        // If the object was in queue
        if (findElement(queue, 'videoId', videoId) !== 'undefined') {
            // Remove it
            findAndRemove(queue, 'videoId', videoId);
        }

        // Show suggestions based on the song that's currently playing
        showSuggestions(currentSong['videoId']);
    });
}

/**
 * Function findAndRemove
 *
 * Find something in an array and remove it
 *
 * @param {*} array - Array in which we remove the item
 * @param property - The key of the object we want to remove
 * @param value - The value of above key
 */
function findAndRemove(array, property, value) {
    // Loop the array
    $.each(array, function (index, result) {
        // If in the result the passed property equals the
        // passed value
        if (result[property] == value) {
            //Remove from array
            array.splice(index, 1);
        }
    });
}

/**
 * Function playNowFromQueue
 *
 * Triggered when the user clicks on the play now button in
 * the queue. Stops the current song, start the new and removes it
 * from the queue.
 */
function playNowFromQueue() {
    // Listen for a click
    $(document).on('click', '.video-queue .play-now', function () {
        // Fetch the passed video id
        var videoId = $(this).data('video-id');
        // Fetch the position of the chosen song
        var position = $(this).data('position');

        // Remove the clicked element
        $('#' + position).remove();

        // If the queue is empty
        if (queue.length == 0 || queue.length < 1) {
            // We need to build the currentSong from the suggestions list
            currentSong = {
                'position': position,
                'videoId': videoId,
                'title': suggestions[position]['snippet']['title'],
                'duration': convert_time(suggestions[position]['contentDetails']['duration']),
                'thumbnail': suggestions[position]['snippet']['thumbnails']['high']['url']
            };
            // If there is a queue
        } else {
            // Get the song from the queue list based on it's position
            currentSong = findElement(queue, 'position', position);

            // Start the video
            player.loadVideoById(currentSong['videoId']);

            // If the previous song was in queue
            if (findElement(queue, 'videoId', currentSong['videoId']) !== 'undefined') {
                // Remove it
                findAndRemove(queue, 'videoId', currentSong['videoId']);
            }

            // Show suggestions based on the new song
            showSuggestions(videoId);
        }

        // Show suggestions based on the new song
        showSuggestions(currentSong['videoId']);
        // Start the new song
        player.loadVideoById(currentSong['videoId']);
        // Display the song information in the bottom tray
        displayCurrentSong();
    });
}

/**
 * Function showErrors
 *
 * Responsible for outputting a message on the top of the page
 * depending on the requested type the color of the message changes
 *
 * @param message
 * @param type
 */
function showErrors(message, type) {
    // Initiate the color and error div variables
    var color, errDiv = $('.errors');

    // Show the error div (it's hidden by default)
    errDiv.show();

    // Set the passed message as the text of the div
    errDiv.text(message);

    // Initiate a switch based on the requested type
    switch (type) {
        case 'error':
            // Error returns a red color
            color = '#D6523C';
            break;
        case 'warning':
            // Warning returns an orange color
            color = '#D98B3A';
            break;
        default:
            color = '#D6523C';
            break;
    }

    // Set the background of the error div based on the requested type
    errDiv.css({'background-color': color});

    // After 3 seconds we make the error slide up
    setTimeout(function (ev) {
        errDiv.slideUp('slow');
    }, 3000);
}

/**
 * Function checkIfInQueue
 *
 * Check if the currentSong is either playing or already in queue and
 * put out a warning/error to the user
 *
 * @param {int} id - The videoId of the song the user is trying to add to the queue
 * @returns {boolean} result - True or false
 */
function checkIfInQueue(id) {
    // Return false by default
    var returnCheck = false;

    // If the queue is empty
    if (queue.length == 0 || queue.length < 1) {
        // We check if the song is currently playing
        if (id == currentSong['videoId']) {
            // If it's playing we return a warning
            showErrors('This song is currently playing!', 'warning');
            // And return true
            returnCheck = true;
        }
        // If the queue is not empty
    } else {
        // Loop the queue array
        $.each(queue, function (i, song) {
            // If there's a match
            if (id == song['videoId']) {
                // Output the already in queue error
                showErrors('This song is already in queue!', 'error');
                // And return true
                returnCheck = true;
            } else if (id == currentSong['videoId']) {
                // Song is currently playing
                showErrors('This song is currently playing!', 'warning');
                returnCheck = true;
            }
        });
    }

    // Return the result (true or false)
    return returnCheck;
}


/**
 * Function onClientLoad
 *
 * Fires when the client side is fully loaded and initiates the
 * Youtube API.
 */
function onClientLoad() {
    gapi.client.load('youtube', 'v3', onYoutubeApiLoad);
}

/**
 * Function onYoutubeApiLoad
 *
 * Fires when the Youtube api is loaded in the application
 * this function is required by the Youtube api
 */
function onYoutubeApiLoad() {
    // Set your key
    gapi.client.setApiKey('AIzaSyBSHlj45Ctdlr7kopF42BLfWvivP6XDop4');

    // If there's nothing passed to the search function we search for
    // an empty query. This will return the 50 'most trending' videos
    // at the time
    var xhr = search('');

    // Every time we release a key whilst typing in the search field
    $('#search').keyup(function () {
        // We abort the last search request
        if (xhr && xhr.readyState != 4) {
            xhr.abort();
        }

        // Fetch the value from the field
        var val = $('#search').val();

        // And create a new search
        xhr = search(val);
    });
}

/**
 * Function search
 *
 * Search for the passed query on Youtube and return the
 * first 50 results as JSON
 *
 * @param {string} query - Query to search for
 * @returns {*} response - Results as JSON
 */
function search(query) {
    // Set the API-key of our application
    // TODO:: We might need to change this depending on our domain
    var API = "AIzaSyBSHlj45Ctdlr7kopF42BLfWvivP6XDop4";

    // Start the AJAX call
    return $.ajax('https://www.googleapis.com/youtube/v3/search', {
        // We want to return JSON
        dataType: 'jsonp',
        data: {
            // Pass the query we're looking for
            q: query,
            // We need the snippet part from Youtube
            part: 'snippet',
            // Maximum of 50 results returned
            maxResults: 50,
            // Pass in our API key
            key: API
        }
        // If the call was completed
    }).done(function (data) {
            // We show our response with the returned data
            showResponse(data);
        }
    );
}

/**
 * Function displayCurrentSong
 *
 * This function will create the div used in the bottom player div
 * to display the current song
 *
 * @param b - Optional parameter, if nothing is passed the player will start to play
 */
function displayCurrentSong(b) {
    // If b isn't passed we set the value to 0
    b = b || 0;

    // Fetch the player bottom
    var currentSongDiv = $('#player-bottom');

    // Empty the div
    currentSongDiv.empty();

    // Construct the new player-bottom with the needed variables
    var div = '<div class="current-song-bottom">';
    div += '<img src="' + currentSong['thumbnail'] + '" alt="' + currentSong['title'] + '"/>';
    div += '<p class="current-song-bottom-title">' + currentSong['title'] + '</p>';
    div += '</div>';
    div += '<div class="current-song-controls">';
    div += '<span class="fa fa-backward replay"></span>';
    div += '<span class="fa fa-play pause"></span>';
    div += '<span class="fa fa-forward next"></span>';
    div += '</div>';
    div += '<div class="duration-player">';
    div += '<div class="duration-background">';
    div += '</div>';
    div += '<div class="duration-slider">';
    div += '</div>';
    div += '</div>';
    div += '<div class="current-song-time">';
    div += '<p>';
    div += '<span class="current-time">0:00</span>';
    div += '<span>&sol;</span>';
    div += '<span class="full-duration">' + currentSong['duration'] + '</span>';
    div += '</p>';
    div += '</div>';
    div += '</div>';
    div += '<img src="img/sound.png" class="volume-img"/>';
    div += '<div class="volume">';
    div += '<div class="volume-background">';
    div += '</div>';
    div += '<div class="volume-slider">';
    div += '</div>';
    div += '</div>';

    // If there's an integer passed
    if (b != 0) {
        // We show the time remaining of the current song
        showTime(currentSong['duration']);

        // Fetch the pause button
        var pause = $('.pause');
        // Remove it
        pause.removeClass('.fa-pause');
        // Set the play button
        pause.addClass('.fa-play');
    }

    // Append the div to the bottom player
    currentSongDiv.append(div);
}

/**
 * Function convertDuration
 *
 * Convert the length of a song from readable format (eg. 3:01) to the
 * length expressed in seconds (eg. 181)
 *
 * @param {string} duration - Length of song in readable format (eg. 3:01)
 * @returns {number} time - Returns the length of the song in seconds (eg. 181)
 */
function convertDuration(duration) {
    // Convert the passed string in a array, if the passed duration is 3:01
    // time would equal time = [3, 1]
    var time = duration.split(':');

    // Initiate the sec, min and hours variable
    var sec = 0, min = 0, hours = 0;

    // If the length of the time array is 2 (which is the minimum length, because
    // the Youtube API will always return minutes even when a song is only 10 seconds long,
    // 0:10 will be returned). If this is true the song is less than one hour long.
    if (time.length == 2) {
        // Set hours to 0 because the length is only 2
        hours = 0;
        // We remove the starting zeros (if there are any from minutes and seconds)
        min = removeStartingZero(time, 0);
        sec = removeStartingZero(time, 1);
    } else {
        // Remove all the starting zeros if the song is longer than one hour
        hours = removeStartingZero(time, 0);
        min = removeStartingZero(time, 1);
        sec = removeStartingZero(time, 2);
    }

    // An hour is 3600 seconds and a minute is 60 seconds. Thus we multiply everything and
    // add them together to fetch the result expressed in seconds
    return hours * 3600 + min * 60 + sec;
}

/**
 * function removeStartingZero
 *
 * Removes the starting 0 from an array entry
 *
 * @param {*} array - The array that needs to be edited
 * @param {int} index - The index of the array entry that needs to be changed
 * @returns {int} time -  Returns the integer without the leading 0
 */
function removeStartingZero(array, index) {
    // If the first character of the passed array entry
    // is equal to 0
    if (array[index].indexOf('0') == 0) {
        // Remove the 0 and return everything after it but
        // first convert the whole to an integer
        return parseInt(array[index].substr(1));
    } else {
        // If there's no leading 0 we just parse the whole
        // to an integer and return it
        return parseInt(array[index]);
    }
}

/**
 * Function slideProgress
 *
 * Update the slider bottom to represent a 'real' music player
 * the slider will move as the song progresses
 *
 * @param {int} duration - Duration of the current song in readable format (eg. 3:01)
 */
function slideProgress(duration) {
    // We only update the progress if we aren't dragging
    // Should we allow this the progress slider starts stuttering
    // like crazy when we drag it
    if (globalDrag == false) {
        // Get the time in seconds
        var fullDuration = convertDuration(duration);

        // Get the width of the full slider
        var width = $('.duration-background').width();

        // If we divide the width of the full slider by the duration of the song
        // we get the amount of pixels we should move every second to represent
        // a smooth progress bar
        var px_ps = width / fullDuration;

        // Calculate the offset we should apply to the left of the slider. This is
        // done by fetching the current second of the song and multiplying this by
        // the amount of pixels we should move every second
        var offset = player.getCurrentTime() * px_ps;

        // Set the left offset equal to the one we've just calculated
        $('.duration-slider').css({'left': offset + 'px'});
    }
}

/**
 * Function showTime
 *
 * Set a global window interval to update the time displayed
 * in the bottom player and to slide the progress of the song
 *
 * @param {int} duration - Duration of the current song in readable format (eg. 3:01)
 */
function showTime(duration) {
    // Clear the timer, a new timer is created every time a new
    // song starts playing so we need to delete the previous one
    // else we'll have a million timers running at the same time
    clearInterval(time);

    // Initiate a new timer
    time = window.setInterval(function () {
        // We only update the time when we aren't dragging
        // if we're dragging we update the time elsewhere
        // because if we allow the time to update whilst dragging
        // the timer starts to stutter
        if (globalDrag == false) {
            // Update time when not dragging
            appendTime(player.getCurrentTime());
        }

        // Update the progress bar
        slideProgress(duration);
        // Update every 100ms
    }, 100);
}

/**
 * Function appendTime
 *
 * This function will convert the time expressed in seconds to
 * a more readable format ready to display in the bottom player
 *
 * @param {int} time - Time expressed in seconds
 */
function appendTime(time) {
    // Fetch the current time div, this is where the current time
    // is displayed
    var div = $('.current-time');

    // Initiate the hour, min and sec variable
    var hour, min, sec;

    // If the time contains more than 3600 seconds
    // AKA the song lasts longer than 1 hour
    if (time > 3600) {
        // We divide the seconds by 3600 and round down
        // this is the amount of hours
        hour = Math.floor(time / 3600);
        // Get the modulus of the time divided by 3600
        // and divide this by 60, after rounding down these
        // are the minutes
        min = Math.floor((time % 3600) / 60);
        // Fetch the modulus of the time divided by 60 to get the remaining
        // seconds of the song
        sec = Math.floor(time % 60);

        // Append a 0 to the minutes if it's smaller than 10
        if (min < 10) {
            min = '0' + min;
        }
        // Do the same for seconds
        if (sec < 10) {
            sec = '0' + sec;
        }

        // Apend the newly calculated time to the bottom player
        div.text(hour + ':' + min + ':' + sec);
        // Do the same if the song is less than 1 hour
    } else if (time > 60) {
        min = Math.floor(time / 60);
        sec = Math.floor(time % 60);
        if (sec < 10) {
            sec = '0' + sec;
        }
        div.text(min + ':' + sec);
        // And last but not least format the time if the song is less than one minutes
    } else if (time < 60) {
        sec = Math.floor(time);
        if (sec < 10) {
            sec = '0' + sec;
        }
        div.text('0:' + sec);
    }
}

/**
 * Function pausePlayVideo
 *
 * Listen to a click on the pause (or play) button and pause/play the
 * song accordingly
 */
function pausePlayVideo() {
    // Listen for a click on the pause button in the bottom player
    $(document).on('click', '#player-bottom .pause', function () {
        // Pause the video
        player.pauseVideo();
        // If we're displaying the pause button
        if ($(this).hasClass('fa-pause')) {
            // Remove the pause button
            $(this).removeClass('fa-pause');
            // Show the play button
            $(this).addClass('fa-play');
            // Make sure the video is paused
            player.pauseVideo();
        } else {
            // If the song paused and we press again
            // Remove the play button
            $(this).removeClass('fa-play');
            // Show the pause button
            $(this).addClass('fa-pause');
            // Play the video
            player.playVideo();
        }
    });
}

/**
 * Function nextSong
 *
 * Listen to a click on the next button in the bottom player and change the
 * song to the next song in the suggestion list or the next song in the
 * queue if there is one
 */
function nextSong() {
    // Listen for click on the next button
    $(document).on('click', '#player-bottom .next', function () {
        // Check if there's a queue
        if (queue.length == 0 || queue.length < 1) {
            // Set the currentSong object to the next song from the queue
            currentSong = {
                'position': 0,
                'videoId': suggestions[0]['id'],
                'title': suggestions[0]['snippet']['title'],
                'duration': convert_time(suggestions[0]['contentDetails']['duration']),
                'thumbnail': suggestions[0]['snippet']['thumbnails']['high']['url']
            };

            // Create the bottom player for the new song
            displayCurrentSong();

            // Load and play the new song
            player.loadVideoById(suggestions[0]['id']);

            // Show suggestions based on the new song
            showSuggestions(suggestions[0]['id']);
        } else {
            // If there is a queue, we set the currentSong object to the
            // first item from the queue
            currentSong = queue[0];

            // We load the bottom player for the new song
            displayCurrentSong();

            // We load and start the new song
            player.loadVideoById(queue[0]['videoId']);

            // We show the suggestions based on this new song
            showSuggestions(queue[0]['videoId']);

            // We remove this HTML object from the queue, this will make
            // sure we no longer see this song in the queue displayed
            // under the video
            $('#' + queue[0]['position']).remove();

            // Remove the object from the queue
            findAndRemove(queue, 'videoId', queue[0]['videoId']);

            // If this was the last object in the queue
            if (queue.length == 0 || queue.length < 1) {
                // We update the suggestions displayed
                showSuggestions(currentSong['videoId']);
            }
        }
    });
}

/**
 * Function replay
 *
 * Replay the current active song when the back icon is pressed
 */
function replay() {
    // Listen for click on the back button on the bottom player
    $(document).on('click', '#player-bottom .replay', function () {
        // Reload the player with the same videoId
        player.loadVideoById(currentSong['videoId']);
    });
}

/**
 * Function getCurrentVolume
 *
 * Get the current volume of the player and change the volume
 * slider when the volume changes
 *
 * @param {int} width - The width of the volume container in px
 */
function getCurrentVolume(width) {
    // Set an interval on the window every 100ms
    window.setInterval(function () {
        // Get the current volume from the player
        var volume = player.getVolume();

        // Calculate the offset, this is done by dividing the
        // width of the parent by 100 and multiplying this by the
        // volume returned
        var offset = volume * width / 100;
        // Set the offset left of the slider equal to the offset
        // calculated
        $('.volume-slider').css({'left': offset + 'px'});
    }, 100);
}

/**
 * Function Slide
 *
 * Make something draggable within it's parent container, used for setting the volume and
 * making the time draggable
 *
 * @param {string} slider - The class of the object that's going to slide
 * @param {string} container - The class of the slider's parent object
 * @param {int} width - The width of the slider's parent object in px
 * @param {string} purpose - player, volume
 */
function slide(slider, container, width, purpose) {
    // Initiate the dragging, seconds and changed variable
    var dragging = false, seconds = 0, changed = false;

    // If we mouse down on the draggable object in the bottom player
    // we set dragging to true
    $(document).on('mousedown', '#player-bottom .' + slider, function () {
        dragging = true;
    });

    // If the mouse is released we stopped dragging
    $(document).on('mouseup', function () {
        // Set both dragging and globalDrag to false, this re-enables the
        // global timers
        dragging = false;
        globalDrag = false;
        // If we're sliding the player we have to do some extra stuff,
        // we check this by checking the value of the purpose parameter
        if (purpose == 'player') {
            // If we changed the seconds of the song
            if (changed) {
                // On mouse release we set the time of the player to
                // the seconds calculated while dragging
                player.seekTo(seconds);
                // Set changed to false after setting the new time
                changed = false;
            }
        }
    });

    // Detect mouse movement on the document
    $(document).on('mousemove', function (e) {
        // If we're dragging AKA holding mouse down on the desired object
        if (dragging == true) {
            // Set the globalDrag to true, so we can temporary stop the global timer, if
            // we don't do this the sliders will experience strange stutter-like animations
            globalDrag = true;
            // We fetch the offset of the parent container
            var offset = $('.' + container).offset();
            // Get the X coordinate of the mouse (we're dragging horizontally so we don't need
            // the Y coordinate) and subtract the left offset. We divide this by the width
            // divided by 100. This will result in a number between 0 and 100. Representing the
            // left offset of the slider in %. If the slider is in the middle this will result in 50.
            var number = (e.pageX - offset.left) / (width / 100);

            // We only move the slider if it's within the parent container. So we have to check
            // that the offset is larger than 0 but smaller than the width of the parent container.
            if (e.pageX - offset.left > 0 && e.pageX - offset.left < width) {
                // Set the new left offset of the object and make the cursor look like a hand whilst dragging
                $('.' + slider).css({'left': e.pageX - offset.left + 'px', 'cursor': 'hand !important'});

                // Create a switch depending on the purpose of the slider
                switch (purpose) {
                    // If we're sliding the player
                    case 'player':
                        // If we dragged the slider the seconds have changed, we set this to true
                        changed = true;
                        // We get the duration of the song that's currently playing and multiply this
                        // with the percentage we've just calculated. We divide this by 100 to return
                        // a value between 0 and 1.
                        seconds = convertDuration(currentSong['duration']) * number / 100;
                        // During the drag we display the seconds
                        appendTime(seconds);
                        break;
                    // If we're sliding the volume
                    case 'volume':
                        // Set the volume of the player to the percentage we've just calculated
                        player.setVolume(number);
                        break;
                }
            }
        }
    });
}