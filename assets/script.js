
const mainTrack = document.getElementById('main-track');
const timeStamps = document.getElementById('time-stamps');
const play = document.querySelector('.play');
const pause = document.querySelector('.pause');

const annotations = [{
    time: '09:13',
    note: 'It speeds up here unexpectedly.'
 },{
    time: '14:23',
    note: 'Listen for the change here. The strings fade out.'
 }];

/*const tracks = [{
    name: '',
    path: '',
    annotations: [],
    genre: 'classical'
}, ...];*/

/*annotations.forEach((annotation) => {
    const time = annotation.time; // ES5
    const note = annotation.note; // ES5
})
annotations.forEach((annotation) => {
    const { time, note } = annotation; // ES6
})*/

function getSeconds(time) {
    // (min * 60) + seconds
    // 00:00:00
    const minutesSeconds = time.split(':') // ['09', '13']
    const [minutes, seconds] = minutesSeconds;
    return Number(minutes) * 60 + Number(seconds);
}

annotations.forEach(({ time, note }) => {
    const secondsTime = getSeconds(time);
    const li = `<li data-time="${secondsTime}">${time} <br> ${note}</li>`;
    // let li = document.createElement('li')
    timeStamps.innerHTML += li;
});

const click = 'click'

play.addEventListener(click, (event) => {
    // press play and hide play and show pause
    mainTrack.play();
    play.style.display = 'none';
    pause.style.display = 'block';
})

pause.addEventListener(click, (event) => {
    // press play and hide play and show pause
    mainTrack.pause();
    play.style.display = 'block';
    pause.style.display = 'none';
})


timeStamps.addEventListener(click, (event) => {
    console.log(event, event.target);
    //event.target.dataset.time;
    const dataTime = event.target.getAttribute('data-time');
    mainTrack.currentTime = dataTime;
    mainTrack.play();
})
