document.addEventListener('DOMContentLoaded', () => {
    // Set initial page title
    document.title = 'Pomodoro App - 25:00';

    const pomodoroApp = document.getElementById('pomodoro-app');

    let breakCounter = 0;
    let isPaused = false;
    let isBreak = false;
    let isBreakRunning = false;
    let interval;
    let totalSessions = 0;
    let breakSessions = 0;
    let isShortBreak = false;
    let breakTimeLeft;
    let mainTimerInterval;
    let addedTime = 0; // Store additional minutes added to the timer
    let timeLeft = 25 * 60;  // Initial time period set to 25 minutes

    // Create the timer and controls in the DOM
    function createPomodoroTimer() {
        pomodoroApp.innerHTML = `
            <div class="pomodoro__timer-container">
                <span class="pomodoro__break-counter">Break counter: ${breakCounter}</span>
                <div class="pomodoro__timer">
                    <span id="time-display" class="pomodoro__time">25:00</span>
                </div>
                <div class="pomodoro__controls">
                    <button id="start" class="pomodoro__button">Start</button>
                    <button id="restart" class="pomodoro__button">Restart</button>
                    <button id="add-1min" class="pomodoro__button">+ 1min</button>
                    <button id="add-10min" class="pomodoro__button">+ 10min</button>
                </div>
            </div>
            <div id="popup" class="popup hidden">
                <div class="popup-content">
                    <h2>Time is up!</h2>
                    <p>Take a break and start again after: <span id="break-time">5 mins</span></p>
                </div>
            </div>
        `;
    }

    createPomodoroTimer(); // Initialize timer

    // Update the displayed timer in the DOM and update the page title
    function updateTimerDisplay(minutes, seconds) {
        const timeDisplay = document.getElementById('time-display');
        timeDisplay.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        document.title = `${minutes}:${seconds < 10 ? '0' : ''}${seconds} - Pomodoro Timer`;
    }

    // Countdown function executed every second
    function countdown() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        updateTimerDisplay(minutes, seconds); // Update time display

        if (timeLeft > 0) {
            timeLeft--; // Decrease the remaining time
        } else {
            clearInterval(interval); // Stop timer when finished
            timerEnd();
        }
    }

    // Show popup when timer ends
    function showPopup() {
        const popup = document.getElementById('popup');
        popup.classList.remove('hidden');
    }

    // Hide popup after 5 seconds
    function hidePopup() {
        const popup = document.getElementById('popup');
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 5000);
    }

    // Start the main work timer
    function startTimer() {
        if (!isPaused && !isBreak) {
            // Reset the timer to 25 minutes + any additional time when starting
            timeLeft = (25 * 60) + addedTime;  
        }
        interval = setInterval(countdown, 1000); // Start countdown every second
        document.getElementById('start').textContent = 'Pause'; // Change button to 'Pause'
        document.getElementById('start').setAttribute('id', 'pause');
        isPaused = false; // Reset paused status
    }

    // Pause the timer
    function pauseTimer() {
        clearInterval(interval); // Stop countdown
        document.getElementById('pause').textContent = 'Resume'; // Change button to 'Resume'
        document.getElementById('pause').setAttribute('id', 'resume');
        isPaused = true;
    }

    // Resume the timer after pausing
    function resumeTimer() {
        interval = setInterval(countdown, 1000); // Restart countdown
        document.getElementById('resume').textContent = 'Pause'; // Change button to 'Pause'
        document.getElementById('resume').setAttribute('id', 'pause');
    }

    // Reset the timer to its default state
    function resetTimer() {
        clearInterval(interval); // Stop the timer
        timeLeft = 25 * 60; // Reset timer to 25 minutes
        addedTime = 0; // Clear added time
        updateTimerDisplay(25, 0); // Reset display to 25:00
        isPaused = false;
        createPomodoroTimer(); // Recreate the initial timer layout
    }

    // Handle timer end and start a break period
    function timerEnd() {
        totalSessions++;
        showPopup(); // Display notification
        breakCounter++;

        if (breakCounter === 4) {
            // Long break after 4 sessions
            breakCounter = 0;
            breakTimeLeft = 30 * 60; // 30-minute break
        } else {
            // Short break between sessions
            breakTimeLeft = 5 * 60; // 5-minute break
            isShortBreak = true;
        }
        hidePopup(); // Hide popup after some time
        resetMainTimer(); // Reset main work timer to 0
        startBreakCountdown(); // Start break countdown
    }

    // Reset main work timer display to 0
    function resetMainTimer() {
        clearInterval(interval);
        timeLeft = 0; // Reset time left
        updateTimerDisplay(0, 0);
    }

    // Start the countdown for the break period
    function startBreakCountdown() {
        const restartButton = document.getElementById('restart');
        restartButton.disabled = true; // Disable restart button during the break
        isBreakRunning = true;

        const popup = document.getElementById('popup');
        const popupContent = popup.querySelector('.popup-content');
        popup.classList.remove('hidden');
        popupContent.innerHTML = `
            <h2>Time is up!</h2>
            <p>Take a break and start again after: <span id="break-time">${Math.floor(breakTimeLeft / 60)} mins</span></p>
        `;

        // Countdown for the break period
        const breakInterval = setInterval(() => {
            const minutes = Math.floor(breakTimeLeft / 60);
            const seconds = breakTimeLeft % 60;
            const startButton = document.getElementById('pause');
            startButton.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            document.getElementById('break-time').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (breakTimeLeft > 0) {
                breakTimeLeft--; // Decrease break time left
            } else {
                clearInterval(breakInterval); // End break countdown
                popupContent.innerHTML = `
                    <h2>Break is over!</h2>
                    <p>Time to start a new work session.</p>
                `;
                setTimeout(() => {
                    popup.classList.add('hidden'); // Hide popup after 5 seconds
                    resetWorkSession(); // Reset for next work session
                    restartButton.disabled = false; // Re-enable restart button
                    isBreakRunning = false; // Break is no longer active
                }, 5000);
            }
        }, 1000);
    }

    // Reset the work session after the break
    function resetWorkSession() {
        // Reset timer to 25 minutes + any additional time
        timeLeft = 25 * 60 + addedTime;  
        addedTime = 0; // Reset additional time
        document.getElementById('pause').textContent = 'Start'; // Change button back to 'Start'
        document.getElementById('pause').setAttribute('id', 'start');
    }

    // Add event listeners for the buttons
    document.addEventListener('click', (e) => {
        if (e.target.id === 'start') {
            startTimer(); // Start the timer
        } else if (e.target.id === 'pause' && !isBreakRunning) {
            pauseTimer(); // Pause the timer
        } else if (e.target.id === 'resume') {
            resumeTimer(); // Resume the timer
        } else if (e.target.id === 'restart' && !isBreakRunning) {
            resetTimer(); // Restart the timer
        } else if (e.target.id === 'add-1min') {
            // Add 1 minute to the current time and update display
            addedTime += 60;  
            if (!isPaused && !isBreakRunning) {
                timeLeft += 60;
            }
            updateTimerDisplay(Math.floor(timeLeft / 60), timeLeft % 60);
        } else if (e.target.id === 'add-10min') {
            addedTime += 600;  // Add 10 minutes to the added time
            if (!isPaused && !isBreakRunning) {
                timeLeft += 600;
            }
            updateTimerDisplay(Math.floor(timeLeft / 60), timeLeft % 60);
        }
    });
});
