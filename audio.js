
const audioGuidesData = {
    exhibit1: {
        title: "НАКАНУНЕ ВОЙНЫ",
        description: "Аудио гид по экспозиции 'Накануне войны'",
        audioFile: "audio/exhibit1.mp3",
    },
    exhibit2: {
        title: "БРЕСТСКАЯ КРЕПОСТЬ",
        description: "Аудио гид по экспозиции 'Брестская крепость'",
        audioFile: "audio/exhibit2.mp3",
    },
    exhibit3: {
        title: "БИТВА ПОД МОСКВОЙ",
        description: "Аудио гид по экспозиции 'Битва под Москвой'",
        audioFile: "audio/exhibit3.mp3",
    },
    exhibit4: {
        title: "ВАГОН-ГОСПИТАЛЬ",
        description: "Аудио гид по экспозиции 'Вагон-госпиталь'",
        audioFile: "audio/exhibit4.mp3",
    },
    exhibit5: {
        title: "КАЗАНЬ – ГОРОД ТРУДОВОЙ ДОБЛЕСТИ",
        description: "Аудио гид по экспозиции 'Казань - город трудовой доблести'",
        audioFile: "audio/exhibit5.mp3",
    },
    exhibit6: {
        title: "ТЫЛ ФРОНТУ!",
        description: "Аудио гид по экспозиции 'Тыл фронту!'",
        audioFile: "audio/exhibit6.mp3",
    },
    exhibit7: {
        title: "БЛОКАДНЫЙ ЛЕНИНГРАД",
        description: "Аудио гид по экспозиции 'Блокадный Ленинград'",
        audioFile: "audio/exhibit7.mp3",
    },
    exhibit8: {
        title: "СТАЛИНГРАДСКАЯ БИТВА",
        description: "Аудио гид по экспозиции 'Сталинградская битва'",
        audioFile: "audio/exhibit8.mp3",
    },
    exhibit9: {
        title: "ОСВОБОЖДЕНИЕ ЕВРОПЫ",
        description: "Аудио гид по экспозиции 'Освобождение Европы'",
        audioFile: "audio/exhibit9.mp3",
    },
    exhibit10: {
        title: "ПОБЕДА",
        description: "Аудио гид по экспозиции 'Победа'",
        audioFile: "audio/exhibit10.mp3",
    },
    exhibit11: {
        title: "ПАМЯТЬ",
        description: "Аудио гид по экспозиции 'Память'",
        audioFile: "audio/exhibit11.mp3",
    }
};


let currentAudioId = 'exhibit1';
let audioElement = null;
let isPlaying = false;
let currentPlaybackRate = 1.0;


document.addEventListener('DOMContentLoaded', function() {
    console.log('Аудио гиды загружаются...');
    initializeAudioElement();
    setupEventListeners();
    loadAudioFromURL();
});


function initializeAudioElement() {
    audioElement = document.getElementById('audio-element');
    
    audioElement.addEventListener('loadedmetadata', function() {
        updateAudioInfo();
        updateProgressBar();
    });
    
    audioElement.addEventListener('timeupdate', function() {
        updateProgressBar();
    });
    
    audioElement.addEventListener('ended', function() {
        handleAudioEnd();
    });
    
    audioElement.addEventListener('error', function(e) {
        console.error('Ошибка загрузки аудио:', e);
        showError('Не удалось загрузить аудио файл');
    });
}


function setupEventListeners() {

    const audioButtons = document.querySelectorAll('.audio-btn');
    audioButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const audioId = this.getAttribute('data-audio');
            console.log('Переключение на аудио гид:', audioId);
            switchAudio(audioId);
        });
    });


    document.getElementById('play-pause-btn').addEventListener('click', togglePlayPause);
    document.getElementById('volume-btn').addEventListener('click', toggleMute);
    document.getElementById('speed-btn').addEventListener('click', changePlaybackSpeed);
    document.getElementById('download-btn').addEventListener('click', downloadAudio);


    const progressBar = document.getElementById('progress-bar');
    progressBar.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        seekAudio(percent);
    });


    const volumeSlider = document.getElementById('volume-slider');
    volumeSlider.addEventListener('input', function() {
        setVolume(this.value / 100);
    });


    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            togglePlayPause();
        }
        if (e.code === 'ArrowLeft') {
            seekAudio((audioElement.currentTime - 10) / audioElement.duration);
        }
        if (e.code === 'ArrowRight') {
            seekAudio((audioElement.currentTime + 10) / audioElement.duration);
        }
    });
}


function loadAudioFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const audioId = urlParams.get('audio');
    
    console.log('Загрузка из URL, audioId:', audioId);
    
    if (audioId && audioGuidesData[audioId]) {
        switchAudio(audioId);
    } else {
        switchAudio('exhibit1');
    }
}


function switchAudio(audioId) {
    console.log('switchAudio called with:', audioId);
    
    if (!audioGuidesData[audioId]) {
        console.error('Аудио гид не найден:', audioId);
        return;
    }


    if (isPlaying) {
        audioElement.pause();
        isPlaying = false;
        updatePlayButton();
    }


    updateActiveButton(audioId);


    updateAudioInfo(audioId);

    history.replaceState(null, '', `?audio=${audioId}`);


    loadAudio(audioId);
}


function updateActiveButton(audioId) {
    document.querySelectorAll('.audio-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-audio') === audioId) {
            btn.classList.add('active');
        }
    });
}



function loadAudio(audioId) {
    console.log('loadAudio called with:', audioId);
    
    const audioGuide = audioGuidesData[audioId];
    if (!audioGuide) {
        console.error('Данные аудио гида не найдены:', audioId);
        return;
    }

    currentAudioId = audioId;


    audioElement.src = audioGuide.audioFile;
    

    audioElement.currentTime = 0;
    

    audioElement.addEventListener('loadeddata', function() {
        updateTotalTime();
    }, { once: true });
}


function togglePlayPause() {
    if (!audioElement.src) return;
    
    if (isPlaying) {
        audioElement.pause();
        isPlaying = false;
    } else {
        audioElement.play().then(() => {
            isPlaying = true;
        }).catch(error => {
            console.error('Ошибка воспроизведения:', error);
            showError('Не удалось воспроизвести аудио');
        });
    }
    
    updatePlayButton();
}


function updatePlayButton() {
    const playBtn = document.getElementById('play-pause-btn');
    const icon = playBtn.querySelector('i');
    
    if (isPlaying) {
        icon.className = 'fas fa-pause';
        playBtn.classList.add('playing');
    } else {
        icon.className = 'fas fa-play';
        playBtn.classList.remove('playing');
    }
}


function seekAudio(percent) {
    if (!audioElement.duration) return;
    
    audioElement.currentTime = percent * audioElement.duration;
}


function setVolume(volume) {
    audioElement.volume = volume;
    updateVolumeButton(volume);
}

function toggleMute() {
    audioElement.muted = !audioElement.muted;
    updateVolumeButton(audioElement.muted ? 0 : audioElement.volume);
}

function updateVolumeButton(volume) {
    const volumeBtn = document.getElementById('volume-btn');
    const icon = volumeBtn.querySelector('i');
    
    if (volume === 0 || audioElement.muted) {
        icon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        icon.className = 'fas fa-volume-down';
    } else {
        icon.className = 'fas fa-volume-up';
    }
}


function changePlaybackSpeed() {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(currentPlaybackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    
    currentPlaybackRate = speeds[nextIndex];
    audioElement.playbackRate = currentPlaybackRate;
    
    const speedBtn = document.getElementById('speed-btn');
    speedBtn.querySelector('span').textContent = currentPlaybackRate + 'x';
}


function updateProgressBar() {
    const progress = document.getElementById('progress');
    const currentTimeElement = document.getElementById('current-time');
    
    if (audioElement.duration) {
        const percent = (audioElement.currentTime / audioElement.duration) * 100;
        progress.style.width = percent + '%';
        currentTimeElement.textContent = formatTime(audioElement.currentTime);
    }
}

function handleAudioEnd() {
    isPlaying = false;
    updatePlayButton();
}


function downloadAudio() {
    const audioGuide = audioGuidesData[currentAudioId];
    if (!audioGuide || !audioGuide.audioFile) return;
    
    const link = document.createElement('a');
    link.href = audioGuide.audioFile;
    link.download = `${audioGuide.title}.mp3`;
    link.click();
}


function showError(message) {

    console.error('Ошибка:', message);
}