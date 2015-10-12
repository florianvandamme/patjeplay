<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Patje Play</title>
    <link rel="stylesheet" href="{{ asset('css/main.css') }}">
    <link href='https://fonts.googleapis.com/css?family=Lato:400,300,100' rel='stylesheet' type='text/css'>
    <script src="{{ asset("js/main.js") }}"></script>
    <script src="https://apis.google.com/js/client.js?onload=onClientLoad" type="text/javascript"></script>
</head>
<body>
<div class="container">
    <nav class="navigation">
        <ul class="pull-left">
            <li class="logo">Patje Play</li>
        </ul>
        <ul class="pull-right">
            <li class="user">Welcome, Florian</li>
        </ul>
    </nav>
    <div class="row">
        <div class="column column-9">
            <div class="errors">

            </div>
            <div class="search-field">
                <label for="search" class="hidden">Search</label>
                <input type="text" id="search" placeholder="She's after my piano - 2 Fabiola feat. Loredana">
            </div>
            <div class="results">
                {{--<div class="video-result">--}}
                    {{--<div class="video-thumbnail">--}}
                        {{--<img src="http://lorempixel.com/500/400" alt="Test image" class="video-result-image">--}}
                    {{--</div>--}}
                    {{--<div class="video-info">--}}
                        {{--<span class="video-name">Laatste she's after my piano - 2 Fabiola feat. Loredana</span>--}}
                        {{--<br>--}}
                        {{--<small>By: <span class="video-owner">Pat Nightlife</span></small>--}}
                        {{--<div class="video-extras">--}}
                            {{--<p>Length: <span class="video-duration">2:59</span></p>--}}
                            {{--<p>Views: <span class="video-views">443,220</span> views</p>--}}
                            {{--<button>Play now</button>--}}
                            {{--<button>Add to queue</button>--}}
                        {{--</div>--}}
                    {{--</div>--}}
                {{--</div>--}}
            </div>
            <div id="player-bottom" class="background_animation">
                <div class="current-song-bottom">

                </div>
                <div class="current-song-start">
                    <p>
                        Start by playing a song
                    </p>
                </div>
            </div>
        </div>
        <div class="column column-3" id="player-col">
            <div class="current-song">
                {{--<iframe id="current-video" src="https://www.youtube.com/embed/7H-Pqllaapg" frameborder="0" allowfullscreen></iframe>--}}
                <div id="player">

                </div>
            </div>
            <div class="queue">
                {{--<div class="video-queue">--}}
                    {{--<img src="http://lorempixel.com/100/100" alt="Test image" class="video-queue-image">--}}
                    {{--<div class="video-queue-info">--}}
                        {{--<span class="video-queue-title">She's after my piano - 2 Fabiola feat. Loredana</span>--}}
                    {{--</div>--}}
                    {{--<div class="video-queue-controls">--}}
                        {{--<button>Play now</button>--}}
                        {{--<button>Remove</button>--}}
                        {{--<button>Boost up</button>--}}
                    {{--</div>--}}
                {{--</div>--}}
            </div>
        </div>
    </div>
</div>
</body>
</html>