const Program = {
    init(){
        this.mainTrack = document.getElementById('main-track');
        this.timeStamps = document.getElementById('time-stamps');
        this.play = document.querySelector('.play');
        this.pause = document.querySelector('.pause');
        this.trackDuration = document.querySelector('.duration');
        this.timeUpdate = document.querySelector('.time-update');
        this.volumeSlider = document.getElementById('volume-slider');
        // TODO: remove this duplicate
        this.progressBar = document.querySelector('.progress-bar');
        this.path = document.querySelector('.progress-bar');
        this.timeLine = document.querySelector('.timeline');
        this.player = document.getElementById('player');
        this.menu();

        //this.tracks = 
        this.loadTracks(this.tracksLoaded.bind(this));

        this.setCurrentAnnotationInterval();
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
        const links = document.querySelector('.links');
        tracks.forEach(track => {
            const link = `<a class="link" href="${track.id}">${track.category}</a>`
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

    menuOpen(){
        document.querySelector('.menu-container').classList.add('active')
    },
    
    events(){
        window.onload = () => {
            const onLoadedMetaData = (event) => {
                const duration = this.mainTrack.duration;
                // console.log(duration);
                this.showDuration(this.getParsedDuration(duration));
                this.renderAnnotations();
                this.setProgressBarLength();
            };
    
            if (this.mainTrack.duration) {
                // console.log('Track already loaded!');
                onLoadedMetaData();
            } else { 
                this.mainTrack.onloadedmetadata = onLoadedMetaData
            }
        };

        window.addEventListener("resize", debounce(this.renderAnnotations, 50).bind(this));

        const click = 'click'
        this.play.addEventListener(click, (event) => {
            // press play and hide play and show pause
            this.playTrack();
        })
        
        this.pause.addEventListener(click, (event) => {
            // press play and hide play and show pause
            this.pauseTrack();
        })

        this.volumeSlider.addEventListener(click, (event) => {
            // adjust slider range to change volume
            this.changeVolume();
        })

        this.timeStamps.addEventListener(click, (event) => {
            this.annotationClick(event);
        })

        this.player.addEventListener(click, (event) => {
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

        document.addEventListener('click', (event) => {
            const { target } = event;
            if (!target.classList.contains('link')) return;

            event.preventDefault();

            console.log(target.getAttribute('href'))
            const id = target.getAttribute('href')
            this.setActiveTrack(id);
            console.log('active', this.activeTrack)
            location.hash = id;
            // TODO: improve this.
            location.reload();
        })
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
    console.log(scrollPosition);
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

    showTimeUpdate(time) {
        this.timeUpdate.innerHTML = `${time}`;
        // Get length of circle and use to calculate the 'unit interval' of remaining time.
        // 1 at the beginning, 0.5 middle, 0 at the end.
        const remainingTimeUnitInterval = (this.getDuration() - this.getCurrentTime()) / this.getDuration();
        
        // Use SVGPathElement's getTotalLength() method to get circle length.
        this.length = this.path.getTotalLength();
        const strokeDashOffset = this.length * remainingTimeUnitInterval;
        console.log('strokeDashoffset: ' + strokeDashOffset);
        this.progressBar.style.strokeDashoffset = strokeDashOffset;

    },

    clearAnnotations(){
        this.timeStamps.innerHTML = '';
        document.querySelectorAll('.dot').forEach(dot => {
            this.player.removeChild(dot)
        });
    },

    renderAnnotations(){
        console.log(this); 
        const totalTime = this.getDuration();
        this.clearAnnotations();
        this.activeTrack.annotations.forEach(({ time, note, link = '' }) => {
            const secondsTime = this.getSeconds(time);
            const li = `
                <li data-time="${secondsTime}">
                    ${time} <br> ${note}
                    ${link && `<a href="${link}" target="_blank">link</a>`}
                </li>`;
            // let li = document.createElement('li')
            this.timeStamps.innerHTML += li;
            this.showAnnotationDot(secondsTime, totalTime);
        });
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
        console.log('timeLine: ' + this.player.clientWidth);
        console.log('radius: ' + radius);
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


