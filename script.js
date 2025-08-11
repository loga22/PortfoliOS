document.addEventListener('DOMContentLoaded', () => {
    // --- Particles.js Config ---
    const particlesConfig = { "particles": { "number": { "value": 300, "density": { "enable": true, "value_area": 800 } }, "color": { "value": "#EEEEEE" }, "shape": {"type": "polygon", "stroke": { "width": 0, "color": "#000000" }, "polygon": { "nb_sides": 4 } }, "opacity": { "value": 0.5, "random": true }, "size": { "value": 3, "random": true }, "line_linked": { "enable": false }, "move": { "enable": true, "speed": 1, "direction": "bottom", "random": true, "straight": false, "out_mode": "out" } }, "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": false } }, "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.5 } } } } };
    
    particlesJS('particles-js', particlesConfig);
    
    // --- Clock ---
    const clockElement = document.getElementById('clock');
    function updateClock() { clockElement.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    setInterval(updateClock, 1000);
    updateClock();

    // --- App and Window Management ---
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    let highestZIndex = 10;

    function openWindow(windowId) {
        const windowElement = document.getElementById(windowId);
        if (!windowElement) return;

        // Make window visible to calculate its dimensions
        windowElement.classList.remove('hidden');
        
        const windowWidth = windowElement.offsetWidth;
        const windowHeight = windowElement.offsetHeight;

        // Calculate center position
        const top = Math.max(0, (window.innerHeight - windowHeight) / 2);
        const left = Math.max(0, (window.innerWidth - windowWidth) / 2);

        // Apply position
        windowElement.style.top = `${top}px`;
        windowElement.style.left = `${left}px`;
        
        highestZIndex++;
        windowElement.style.zIndex = highestZIndex;
    }

    desktopIcons.forEach(icon => {
        const openAction = () => {
            const windowId = icon.dataset.window;
            openWindow(windowId);
            if (windowId === 'projects-window') {
                currentProjectIndex = 0;
                showProject(0);
            }
        };
        icon.addEventListener('click', openAction);
        icon.addEventListener('touchstart', openAction);
    });

    document.querySelectorAll('.close-btn').forEach(btn => {
        const closeAction = (e) => {
            e.stopPropagation();
            const window = btn.closest('.window');
            window.classList.add('hidden');
            // If closing the vinyl player, pause the music
            if (window.id === 'vinyl-window') {
                pauseSong();
            }
        };
        btn.addEventListener('click', closeAction);
        btn.addEventListener('touchstart', closeAction);
    });

    // --- Terminal Logic ---
    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    const terminalWindowContent = terminalOutput.parentElement; // Correctly target the scrollable container
    const welcomeMessage = `<span>Welcome to PortfoliOS v2.0\n</span><span>Type 'help' to see available commands.\n\n</span>`;
    terminalOutput.innerHTML = welcomeMessage;

    terminalInput.addEventListener('keydown', function(event) {
        if (event.key === "Enter") {
            const command = terminalInput.value.trim().toLowerCase();
            const outputLine = document.createElement('div');
            outputLine.innerHTML = `<span>> ${command}\n</span>`;
            outputLine.classList.add('text-white');
            terminalOutput.appendChild(outputLine);

            handleCommand(command);

            terminalInput.value = "";
            terminalWindowContent.scrollTop = terminalWindowContent.scrollHeight;
        }
    });

    function copyToClipboard(text, element) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            element.textContent = '(copied!)';
            setTimeout(() => {
                element.textContent = '(copy)';
            }, 1500);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            element.textContent = '(failed)';
        }
        document.body.removeChild(textarea);
    }

    function handleCommand(command) {
        const response = document.createElement('span');
        switch(command) {
            case 'help':
                response.innerHTML = `Available commands:\n  'about'    - Shows my bio\n  'projects' - Lists my projects\n  'contact'  - Shows my contact info\n  'clear'    - Clears the terminal\n\n`;
                break;
            case 'about':
                openWindow('about-window');
                response.innerHTML = `Opening About Me...\n\n`;
                break;
            case 'projects':
                openWindow('projects-window');
                response.innerHTML = `Opening My Work...\n\n`;
                break;
            // --- Customize Contact Info ---
            case 'contact':
                response.innerHTML = `Contact:
Email: logaranjan406@gmail.com <span class="copy-btn" data-copy="logaranjan406@gmail.com">(copy)</span>
LinkedIn: linkedin.com/in/logaranjan <span class="copy-btn" data-copy="https://linkedin.com/in/logaranjan">(copy)</span>
GitHub: github.com/loga22 <span class="copy-btn" data-copy="https://github.com/loga22">(copy)</span>\n\n`;
                break;
            case 'clear':
                terminalOutput.innerHTML = welcomeMessage;
                terminalWindowContent.scrollTop = terminalWindowContent.scrollHeight;
                return;
            default:
                response.innerHTML = `Command not found: ${command}. Type 'help' for a list of commands.\n\n`;
        }
        terminalOutput.appendChild(response);

        // Add event listeners for any new copy buttons
        response.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const textToCopy = e.target.dataset.copy;
                copyToClipboard(textToCopy, e.target);
            });
        });

        terminalWindowContent.scrollTop = terminalWindowContent.scrollHeight;
    }

    // --- Vinyl Player Logic ---
    const songs = [
        { title: 'Sweden', artist: 'C418', url: 'https://raw.githubusercontent.com/logaserv/vinylplayer/main/sweden.mp3', vinylColor: '#FFC300', vinylHighlight: '#111111' },
        { title: 'Lobby', artist: 'C418', url: 'https://raw.githubusercontent.com/logaserv/vinylplayer/main/main.mp3', vinylColor: '#16A34A', vinylHighlight: '#111111' },
        { title: 'Pigstep', artist: 'Lena Raine', url: 'https://raw.githubusercontent.com/logaserv/vinylplayer/main/pigstep.mp3', vinylColor: '#DC2626', vinylHighlight: '#111111' },
                  ];

    let currentSongIndex = 0;
    let isPlaying = false;

    const audioPlayer = document.getElementById('audio-player');
    const vinylLabel = document.getElementById('vinyl-label');
    const vinylLabelHighlight = document.getElementById('vinyl-label-highlight');
    const vinylTitle = document.getElementById('vinyl-title');
    const vinylArtist = document.getElementById('vinyl-artist');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const volumeSlider = document.getElementById('volume-slider');

    function loadSong(index) {
        const song = songs[index];
        vinylTitle.textContent = song.title;
        vinylArtist.textContent = song.artist;
        audioPlayer.src = song.url;
        vinylLabel.setAttribute('fill', song.vinylColor);
        vinylLabelHighlight.setAttribute('fill', song.vinylHighlight);
    }

    function playSong() {
        isPlaying = true;
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        audioPlayer.play();
    }

    function pauseSong() {
        isPlaying = false;
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        audioPlayer.pause();
    }

    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex);
        if (isPlaying) playSong();
    }

    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        loadSong(currentSongIndex);
        if (isPlaying) playSong();
    }
    
    function setVolume() {
        audioPlayer.volume = volumeSlider.value / 100;
    }
    
    playPauseBtn.addEventListener('click', () => (isPlaying ? pauseSong() : playSong()));
    nextBtn.addEventListener('click', nextSong);
    prevBtn.addEventListener('click', prevSong);
    audioPlayer.addEventListener('ended', nextSong);
    volumeSlider.addEventListener('input', setVolume);

    // Initial Load
    loadSong(currentSongIndex);
    setVolume();


    // --- Projects Logic ---
    const prevProjectBtn = document.getElementById('prev-project-btn');
    const nextProjectBtn = document.getElementById('next-project-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const projectPageNumber = document.getElementById('project-page-number');
    let currentProjectIndex = 0;

    function showProject(index) {
        projectCards.forEach((card, i) => {
            if (i === index) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
        projectPageNumber.textContent = `${index + 1} / ${projectCards.length}`;
    }

    function nextProject() {
        currentProjectIndex = (currentProjectIndex + 1) % projectCards.length;
        showProject(currentProjectIndex);
    }

    function prevProject() {
        currentProjectIndex = (currentProjectIndex - 1 + projectCards.length) % projectCards.length;
        showProject(currentProjectIndex);
    }

    prevProjectBtn.addEventListener('click', prevProject);
    nextProjectBtn.addEventListener('click', nextProject);
    prevProjectBtn.addEventListener('touchstart', prevProject);
    nextProjectBtn.addEventListener('touchstart', nextProject);

    // Show the first project initially
    if (projectCards.length > 0) {
        showProject(0);
    }


    // --- Draggable Windows ---
    let activeWindow = null, offsetX, offsetY;

    function startDrag(e) {
        activeWindow = this.closest('.window');
        const touch = e.touches ? e.touches[0] : null;
        offsetX = (touch ? touch.clientX : e.clientX) - activeWindow.offsetLeft;
        offsetY = (touch ? touch.clientY : e.clientY) - activeWindow.offsetTop;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onMouseMove, { passive: false });
        document.addEventListener('touchend', onMouseUp);
        e.preventDefault();
    }

    function onMouseMove(e) {
        if (!activeWindow) return;
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : null;
        let clientX = touch ? touch.clientX : e.clientX;
        let clientY = touch ? touch.clientY : e.clientY;
        let newX = Math.max(0, Math.min(clientX - offsetX, window.innerWidth - activeWindow.offsetWidth));
        let newY = Math.max(0, Math.min(clientY - offsetY, window.innerHeight - activeWindow.offsetHeight - 48)); // 48px is new taskbar height
        activeWindow.style.left = `${newX}px`;
        activeWindow.style.top = `${newY}px`;
    }

    function onMouseUp() {
        activeWindow = null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('touchmove', onMouseMove);
        document.removeEventListener('touchend', onMouseUp);
    }

    // Bring window to front when clicked
    document.querySelectorAll('.window').forEach(win => {
        win.addEventListener('mousedown', () => {
            highestZIndex++;
            win.style.zIndex = highestZIndex;
        });
    });

    // Attach drag handlers ONLY to the window headers
    document.querySelectorAll('.window-header').forEach(header => {
        header.addEventListener('mousedown', startDrag);
        header.addEventListener('touchstart', startDrag);
    });
    
    // Open Terminal by default
    openWindow('terminal-window');

    // Prevent right-click menu on the background
    const background = document.getElementById('particles-js');
    background.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    });

    // Prevent right-click menu on icons
    desktopIcons.forEach(icon => {
    icon.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    });
});
});

window.onload = function() {
    document.body.classList.remove('loading');
};
