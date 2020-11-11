const Program = {
    init(){
        // Prevent any other binding
        this.onLoadedSong = this.onLoadedSong.bind(this);

        /*this.html = {
            track: document.getElementById('main-track'),
            play: document.querySelector('.play')
        }*/

        this.mainTrack = document.getElementById('main-track');
        this.play = document.querySelector('.play');
        this.pause = document.querySelector('.pause');
        this.trackDuration = document.querySelector('.duration');
        this.timeUpdate = document.querySelector('.time-update');
        this.volumeSlider = document.getElementById('volume-slider');
        // TODO: remove this duplicate
        this.menuContainer = document.querySelector('.menu-container');
        
        // Circle...
        this.progressBar = document.querySelector('.progress-bar');
        this.path = document.querySelector('.progress-bar');
        this.timeLine = document.querySelector('.timeline');
        this.cover = document.querySelector('.cover');
        
        // Track info
        this.player = document.getElementById('player');
        this.timeStamps = document.getElementById('time-stamps');
        this.description = document.querySelector('.description');

        //this.tracks = 
        this.loadTracks(this.tracksLoaded.bind(this));

        this.setCurrentAnnotationInterval();
        this.menu();
        this.events();
    },

    tracksLoaded (tracks) {
        console.log('Tracks from links', tracks)
        this.tracks = tracks;
        if (location.hash) {
            this.setActiveTrack(location.hash.slice(1));
        }
        else {
            this.activeTrack = tracks[0];
        }
        this.showLinks(tracks);
    },

    showLinks(tracks) {
        const links = document.querySelector('.categories');
        tracks
            .map(track => track.category) // ['rock', 'rock', 'jazz', '...']
            .filter((category, index, arr) => {
                const previousCategories = arr.slice(0, index);
                return !previousCategories.includes(category);
            })
            /*.filter((category, index, arr) => {
                let unique = true;
                const previousCategories = arr.slice(0, index);
                for (let prevCategory of previousCategories) {
                    if (prevCategory === category) {
                        unique = false;
                    }
                }
                return unique;
            })*/
            .forEach(category => {
                const link = `<a class="category" href="#">${category}</a>`
                links.innerHTML += link;
            })
        // ...
    },

    // Higher order function
    loadTracks(tracksLoaded){
        fetch('assets/tracks.json')
            .then(response => response.json())
            .then(tracksLoaded)
            // .then(tracks => this.tracksLoaded(tracks))
        // Callback hell
        /*fetch('assets/tracks.json')
            .then(response => {
                response.json().then(tracks => {
                    console.log({tracks})
                })
            })*/
    },

    menu(){
        document.querySelector('.menu-button').addEventListener('click', this.menuOpen);
    },

    menuOpen(event){
        event.stopPropagation();
        document.querySelector('.menu-container').classList.add('active')
    },

    onLoadedSong() {
        const duration = this.mainTrack.duration;
        // console.log(duration);
        this.showDuration(this.getParsedDuration(duration));
        this.renderAnnotations();
        this.showDescription();
        this.showCover();
        this.setProgressBarLength();
    },

    // Loads first/default song
    loadDefaultSong () {
        const songLoaded = Boolean(this.mainTrack.duration);
    
        // If "maintrack" is already loaded, then call onLoadedSong
        if (songLoaded) {
            this.onLoadedSong();
        }
        // Otherwise, call onLoadedSong after metadata is loaded
        else { 
            this.mainTrack.onloadedmetadata = this.onLoadedSong
        }
    },
    
    events(){
        window.onload = () => this.loadDefaultSong()
        window.addEventListener(
            "resize",
            debounce(this.renderAnnotations, 50).bind(this)
        );

        this.play.addEventListener('click', (event) => {
            // press play and hide play and show pause
            this.playTrack();
        })
        
        this.pause.addEventListener('click', (event) => {
            // press play and hide play and show pause
            this.pauseTrack();
        })

        this.volumeSlider.addEventListener('click', (event) => {
            // adjust slider range to change volume
            this.changeVolume();
        })

        this.timeStamps.addEventListener('click', (event) => {
            this.annotationClick(event);
        })

        this.player.addEventListener('click', (event) => {
            // Check if the element is a dot
            if (event.target.classList.contains("dot")){
            this.annotationClick(event);
            }
        })

        // console.log(document.querySelectorAll('.dot'))

        // document.querySelectorAll('.dot').forEach((dot) => {
        //     dot.addEventListener('click', (event) => {
        //         console.log(click)
        //         this.annotationClick(event);
        //     })
        // });

        this.mainTrack.addEventListener('timeupdate', (event) => {
            const currentTime = this.mainTrack.currentTime;
            this.showTimeUpdate(this.getParsedDuration(currentTime));
        });

        // Category/genre click
        document.addEventListener('click', this.changeCategory.bind(this))

        // When track element from track list is clicked -> select that track
        document.addEventListener('click', this.selectTrack.bind(this))
        
        // Stop the click propagation of the .menu-container
        // (so we don't close the menu when we are clicking on it)
        document.querySelector('.menu-container')
            .addEventListener('click', event => event.stopPropagation())
        
        // 
        document.addEventListener('click', this.closeMenu.bind(this))
    },
    
    closeMenu() {
        this.menuContainer.classList.remove('active');
    },
    
    changeCategory(event){
        // Category clicked?
        const { target } = event;
        if (!target.classList.contains('category')) return;

        event.preventDefault();
        const selected = document.querySelector('.selected')
        if (selected) { selected.classList.remove('selected') }
        target.classList.add('selected');
        const filteredTracks = this.tracks.filter(
            track => track.category === target.innerText
        );
        console.log(filteredTracks);
        
        const trackListContainer = document.querySelector('.track-list')
        
        // Solution 1
        /*filteredTracks.forEach(track => {
            // append track to list
            trackList.innerHTML += '...'
        });*/
        
        // Solution 2
        const trackList = filteredTracks.map(track => {
            return `
                <div class="track-element" id="${track.id}">
                    <div class="track-author">${track.author}</div>
                    <div class="track-song">${track.song}</div>
                </div>
            `;
        }).join('');
        trackListContainer.innerHTML = trackList;
        console.log(trackList);
        window.list = trackList;
    },
    
    // Loads the track and start it
    selectTrack(event){
        // Checks if its a track element first
        const target = event.target.parentNode;
        if (!target.classList.contains('track-element')) return;

        // Gets track ID and loads it
        const id = target.getAttribute('id')
        this.setActiveTrack(id);
        this.renderTrack(id);

        // Changes active class
        const selected = document.querySelector('.track-element.selected')
        selected && selected.classList.remove('selected');
        target.classList.add('selected');
    },

    renderTrack(id){
        location.hash = id;
        this.onLoadedSong();
    },

    setActiveTrack(id) {
        this.activeTrack = this.tracks.find(track => {
            return track.id === id;
        })
    },

    setProgressBarLength() {
        const progressBar = document.querySelector('.progress-bar')
        const length = progressBar.getTotalLength()
        progressBar.style.strokeDashoffset = length
        progressBar.style.strokeDasharray = length
    },

    annotationClick (event) {
        console.log(event, event.target);
        //event.target.dataset.time;
        const dataTime = event.target.getAttribute('data-time');
        this.mainTrack.currentTime = dataTime;
        this.setCurrentAnnotation();
        this.playTrack();
        
        console.error({dataTime})
        this.setActiveAnnotation(dataTime);
        this.scrollToAnnotation(dataTime);
    },

    scrollToAnnotation(dataTime) {
        const timeStamps = document.querySelector('#time-stamps');
        const dataTimeOffset = document.querySelector(`li[data-time="${dataTime}"]`).offsetTop 
        const scrollPosition = dataTimeOffset - timeStamps.offsetTop - 10
        // console.log(scrollPosition);
        timeStamps.scrollTo(0, scrollPosition);
    },

    getDuration(){
        const duration = this.mainTrack.duration;
        return duration;
    },

    getCurrentTime(){
        const currentTime = this.mainTrack.currentTime;
        return currentTime;
    },
    
    playTrack(){
        this.mainTrack.play();
        const currentTime = this.mainTrack.currentTime;
        console.log(currentTime);
        this.play.style.display = 'none';
        this.pause.style.display = 'block';
    },

    pauseTrack(){
        this.mainTrack.pause();
        this.play.style.display = 'block';
        this.pause.style.display = 'none';
    },

    changeVolume(){
        const volume = this.volumeSlider.value * .10
        this.mainTrack.volume = volume;
    },

    getParsedDuration(time){
        const hours = this.getZeroNumber(Math.floor(time / 60 / 60));
        const minutes = this.getZeroNumber(Math.floor(time / 60) - (hours * 60));
        const seconds = this.getZeroNumber((time % 60).toFixed());
        // console.log(hours, minutes, seconds);
        const hoursMinutesSeconds = [
            hours, 
            minutes, 
            seconds
        ];
        if (hoursMinutesSeconds[0] === '00') hoursMinutesSeconds.shift();
        return hoursMinutesSeconds.join(':')
    },

    getZeroNumber(number){
        number = (number < 10 ? '0' : '') + number;
        return number;
    },

    getSeconds(time) {
        const minutesSeconds = time.split(':') // ['09', '13']
        const [minutes, seconds] = minutesSeconds;
        return Number(minutes) * 60 + Number(seconds);
    },

    showDuration(time) {
        this.trackDuration.innerHTML = `${time}`;
    },

    showCover() {
        const cover = this.activeTrack.cover;
        console.log(cover);
        this.cover.setAttribute('src', cover);
    },

    showTimeUpdate(time) {
        this.timeUpdate.innerHTML = `${time}`;
        // Get length of circle and use to calculate the 'unit interval' of remaining time.
        // 1 at the beginning, 0.5 middle, 0 at the end.
        const remainingTimeUnitInterval = (this.getDuration() - this.getCurrentTime()) / this.getDuration();
        
        // Use SVGPathElement's getTotalLength() method to get circle length.
        this.length = this.path.getTotalLength();
        const strokeDashOffset = this.length * remainingTimeUnitInterval;
        // console.log('strokeDashoffset: ' + strokeDashOffset);
        this.progressBar.style.strokeDashoffset = strokeDashOffset;

    },

    clearAnnotations(){
        this.timeStamps.innerHTML = '';
        document.querySelectorAll('.dot').forEach(dot => {
            this.player.removeChild(dot)
        });
    },

    renderAnnotations(){
        // console.log(this); 
        const totalTime = this.getDuration();
        
        // Clear previous annotations
        this.clearAnnotations();
        
        // Update with new annotations
        this.activeTrack.annotations.forEach(annotation => {
            const { time } = annotation;

            const secondsTime = this.getSeconds(time);
            this.showAnnotation(secondsTime, annotation);
            this.showAnnotationDot(secondsTime, totalTime);
        });
    },

    showDescription(){
        const { description } = this.activeTrack;
        this.description.innerHTML = description;
    },
    
    showAnnotation(secondsTime, {time, note, link = ''}){
        const li = `
            <li data-time="${secondsTime}">
                ${time} <br> ${note}
                ${link && `<a href="${link}" target="_blank">link</a>`}
            </li>`;
        this.timeStamps.innerHTML += li;
    },
    
    showAnnotationDot(seconds, total){
        const degrees = (seconds / total) * 360
        // Use sine (vertical) and cosine (horizontal) to get dot angle.
        // range is -1 and 1.
        // Our circles width and height need to be multiplied by these values.
        // Ex: If circle is 300, radius is 150 - half the width of the .dot
        const dot = document.createElement('div');
        dot.classList.add('dot');
        this.player.appendChild(dot);
        const halfDotWidth = dot.clientWidth / 2;
        //const radius = (this.timeLine.getBoundingClientRect().width / 2) - halfDotWidth;
        const radius = (this.player.clientWidth / 2);
        // console.log('timeLine: ' + this.player.clientWidth);
        // console.log('radius: ' + radius);
        // 360 = 2, 180 = 1
        const angle = degrees / -180 * Math.PI
        const x = (radius * Math.cos(angle)).toFixed(2) // Math.PI * 1 if 180, Math.PI * 2 if 360
        const y = (radius * Math.sin(angle)).toFixed(2)
        // console.log(seconds, total);
        // console.log(radius, angle, x, y);
        dot.style.margin = `${x}px ${y}px`
        // dot.innerText = seconds
        dot.setAttribute('data-time', seconds);

    },

    setCurrentAnnotation(){
        // loop over annotations and find the first where time < current time.
        const annotations = [...this.activeTrack.annotations].reverse()
        const currentTime = this.mainTrack.currentTime;
        
        // Add active class
        for (let { time } of annotations) {
            const annotationTime = this.getSeconds(time)
            if (currentTime < annotationTime) continue;
            this.setActiveAnnotation(annotationTime);
            break;
        }
    },
    
    setActiveAnnotation(annotationTime){
        // Remove active class
        const activeElements = document.querySelectorAll('.active');
        activeElements.forEach(active => active.classList.remove('active'))
        const annotation = document.querySelector(`li[data-time="${annotationTime}"]`)
        const annotationDot = document.querySelector(`.dot[data-time="${annotationTime}"]`)
        annotation.classList.add('active')
        annotationDot.classList.add('active')
        this.scrollToAnnotation(annotationTime);
    },

    setCurrentAnnotationInterval(){
        setInterval(() => this.setCurrentAnnotation(), 500);
    }
}

Program.init();


