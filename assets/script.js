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

        this.annotations = [{
            time: '00:03',
            note: 'transition.',
            link: 'http://www.google.com'
        }, 
        {
            time: '00:05',
            note: 'another transition.',
            link: 'http://www.google.com'
        },    
        {
            time: '00:07',
            note: 'It speeds up here <a href="http://google.com">unexpectedly</a>.',
            link: 'http://www.google.com'
        },
        {
            time: '00:08',
            note: 'It speeds up here too.',
            link: 'http://www.google.com'
        },
        {
            time: '00:09',
            note: 'Listen for the change here. The strings fade out.',
        },
        {
            time: '00:11',
            note: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        },
        {
            time: '00:14',
            note: 'Lorem ipsum  ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
        },
        {
            time: '00:16',
            note: 'Lorem ipsum Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
        },
        {
            time: '00:19',
            note: 'Lorem ipsum sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        },];
        this.setCurrentAnnotationInterval();
        this.events();
    },
    
    events(){
        window.onload = () => {
            const onLoadedMetaData = (event) => {
                const duration = this.mainTrack.duration;
                console.log(duration);
                this.showDuration(this.getParsedDuration(duration));
                this.renderAnnotations();
            };
    
            if (this.mainTrack.duration) {
                console.log('Track already loaded!');
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
    },

    annotationClick (event) {
        console.log(event, event.target);
        //event.target.dataset.time;
        const dataTime = event.target.getAttribute('data-time');
        this.mainTrack.currentTime = dataTime;
        this.setCurrentAnnotation();
        this.playTrack();
        const timeStamps = document.querySelector('#time-stamps');
        const scroll = timeStamps.offsetTop
        const dataTimeOffset = document.querySelector(`li[data-time="${dataTime}"]`).offsetTop 
        const scrollPosition = dataTimeOffset - timeStamps.offsetTop - 10
        console.log(scrollPosition);
        timeStamps.scrollTo(0, scrollPosition);

        console.error({dataTime})
        this.setActiveAnnotation(dataTime);
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
        console.log(hours, minutes, seconds);
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
        }) ;
    },

    renderAnnotations(){
        console.log(this); 
        const totalTime = this.getDuration();
        this.clearAnnotations();
        this.annotations.forEach(({ time, note, link = '' }) => {
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
        console.log(seconds, total);
        console.log(radius, angle, x, y);
        dot.style.margin = `${x}px ${y}px`
        // dot.innerText = seconds
        dot.setAttribute('data-time', seconds);

    },

    setCurrentAnnotation(){
        // loop over annotations and find the first where time < current time.
        const annotations = [...this.annotations].reverse()
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
        const active = document.querySelector('#time-stamps li.active');

        if (active) {
            active.classList.remove('active')
        } 

        const annotation = document.querySelector(`li[data-time="${annotationTime}"]`)
        annotation.classList.add('active')
    },

    setCurrentAnnotationInterval(){
        setInterval(() => this.setCurrentAnnotation(), 500);
    }
}

Program.init();


