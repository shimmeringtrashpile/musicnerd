const Program = {
    init(){
        this.mainTrack = document.getElementById('main-track');
        this.timeStamps = document.getElementById('time-stamps');
        this.play = document.querySelector('.play');
        this.pause = document.querySelector('.pause');
        this.trackDuration = document.querySelector('.duration');
        this.timeUpdate = document.querySelector('.time-update');

        this.annotations = [{
            time: '00:05',
            note: 'transition.',
            link: 'http://www.google.com'
        }, 
        {
            time: '00:08',
            note: 'another transition.',
            link: 'http://www.google.com'
        },    
        {
        time: '09:13',
        note: 'It speeds up here unexpectedly.',
        link: 'http://www.google.com'
        },
        {
        time: '09:15',
        note: 'It speeds up here too.',
        link: 'http://www.google.com'
        },
        {
        time: '14:23',
        note: 'Listen for the change here. The strings fade out.',
        }];
        this.events();
        this.renderAnnotations();
        this.setCurrentAnnotationInterval();
    },
    
    events(){
        const click = 'click'
        this.play.addEventListener(click, (event) => {
            // press play and hide play and show pause
            this.playTrack();
        })
        
        this.pause.addEventListener(click, (event) => {
            // press play and hide play and show pause
            this.pauseTrack();
        })

        this.timeStamps.addEventListener(click, (event) => {
            console.log(event, event.target);
            //event.target.dataset.time;
            const dataTime = event.target.getAttribute('data-time');
            this.mainTrack.currentTime = dataTime;
            this.setCurrentAnnotation();
            this.playTrack();
        })

        this.mainTrack.addEventListener('timeupdate', (event) => {
            const currentTime = this.mainTrack.currentTime;
            this.showTimeUpdate(this.getParsedDuration(currentTime));
        });

        const onLoadedMetaData = (event) => {
            const duration = this.mainTrack.duration;
            console.log(duration);
            this.showDuration(this.getParsedDuration(duration));
        }

        if (this.mainTrack.duration) {
            console.log('Track already loaded!');
            onLoadedMetaData();
        } else { 
            this.mainTrack.onloadedmetadata = onLoadedMetaData
        }
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
    },

    renderAnnotations(){ 
        this.annotations.forEach(({ time, note, link = '' }) => {
            const secondsTime = this.getSeconds(time);
            const li = `
                <li data-time="${secondsTime}">
                    ${time} <br> ${note}
                    ${link && `<a href="${link}" target="_blank">link</a>`}
                </li>`;
            // let li = document.createElement('li')
            this.timeStamps.innerHTML += li;
        });
    },

    setCurrentAnnotation(){
        // loop over annotations and find the first where time < current time.
        const annotations = [...this.annotations].reverse()
        const currentTime = this.mainTrack.currentTime;
        
        // Remove active class
        const active = document.querySelector('#time-stamps li.active')
        if (active) {
            active.classList.remove('active')
        } 

        // Add active class
        for (let { time } of annotations) {
            const annotationTime = this.getSeconds(time)
            if (currentTime < annotationTime) continue;
            const annotation = document.querySelector(`[data-time="${annotationTime}"]`)
            annotation.classList.add('active')
            break;
        }
    },

    setCurrentAnnotationInterval(){
        setInterval(() => this.setCurrentAnnotation(), 500);
    }
}

Program.init();


