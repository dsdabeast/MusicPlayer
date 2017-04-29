// document ready happens every time a web page is finished loading
$(document).ready(function() {

    // an object for our app to store music data
    var music;

    // the currently playing song
    var currentTrack;

    // the volume level - full blast by default
    var volume = 1;

    // setup a bunch of dom selectors so we don't have to continuously query the page
    var ui = {
        track: {
            art: $('#art'),
            artist: $('#artist'),
            album: $('#album'),
            song: $('#song marquee')
        },
        controls: {
            volume: $('#volume'),
            progress: $('#progress'),
            previous: $('#previous'),
            stop: $('#stop'),
            pause: $('#pause'),
            play: $('#play'),
            next: $('#next')
        },
        playlist: $('#playlist'),
        elapsed: $('#elapsed'),
        remaining: $('#remaining')
    }

    // load music data with jquery
    $.getJSON("assets/music.json", function(data) {
        console.log('loading music data from music.json file');

        // store the music data in that variable above
        music = data.tracks;

        // call the update playlist function
        updatePlaylist();
    });

    // the update playlist function
    function updatePlaylist() {
        console.log('updating playlist');

        // for each song in the music variable (top of this file), add it to the web page
        $.each(music, function(index, value) {
            console.log(index + ": " + value.song);

            // note the use of `data-index` here, a custom attribute that stores the songs position in an array of music (same variable above)
            ui.playlist.append('<li data-index="' + index + '">' + value.song + '</li>');
        });
    }

    // convert music time from decimal seconds to time format
    function convertDuration(seconds) {
        var h = parseInt(seconds / 3600) % 24;
        var m = parseInt(seconds / 60) % 60;
        var s = seconds % 60;
        s = Math.floor(s);
        return m + ":" + (s < 10 ? "0" + s : s);
    }

    // should call this every second while song is playing
    function updateTimes() {
        ui.elapsed.text(convertDuration(currentTrack.currentTime));
        ui.remaining.text('-' + convertDuration(currentTrack.duration - currentTrack.currentTime));
    
        // recursively calls itself every second if the track is not paused
        if (!currentTrack.paused) {
            setTimeout(updateTimes, 1000);
        }
    }

    // update the song's progress bar
    function updateProgress() {
        ui.controls.progress.attr('value', currentTrack.currentTime);
    }

    // display info about the currently playing song
    function displayTrackInfo(index) {
        ui.track.song.text(music[index].song);
        ui.track.artist.text(music[index].artist);
        ui.track.album.text(music[index].album);
        ui.track.art.attr('src', 'assets/covers/' + music[index].art);
    }

    // play a new song
    function playSong(index) {

        // first, we have to stop previous tracks from playing
        if (currentTrack) {
            currentTrack.pause();
            currentTrack.currentTime = 0;
        }

        // build a new audio track, register some event handlers, and play it
        currentTrack = new Audio('assets/tracks/' + music[index].mp3);
        currentTrack.volume = volume;
        currentTrack.ontimeupdate = updateProgress;
        currentTrack.onended = function() { playSong(index + 1); };
        currentTrack.play();

        // store the current index on the track
        currentTrack.index = index;
        
        // display info about this track
        displayTrackInfo(index);

        // update the clocks
        updateTimes();
    }

    // playlist song is clicked
    $(document).on('click', '#playlist li', function() {
        var index = $(this).data('index');
        displayTrackInfo(index);
        playSong(index);
    });

    // volume is changed
    ui.controls.volume.on('input change', function() {
        volume = $(this).val() / 100;
        currentTrack.volume = volume;
    });

    // play is clicked
    ui.controls.play.click(function() {
        currentTrack.play();
        updateTimes();
    });

    // pause is clicked
    ui.controls.pause.click(function() {
        currentTrack.pause();
    });

    // stop is clicked
    ui.controls.stop.click(function() {
        currentTrack.pause();
        currentTrack.currentTime = 0;
        updateProgress();
        updateTimes();
    });

    // next is clicked
    ui.controls.next.click(function() {
        playSong(currentTrack.index + 1);
    });

    // previous is clicked
    ui.controls.previous.click(function() {
        playSong(currentTrack.index - 1);
    });
});