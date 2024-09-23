document.addEventListener('DOMContentLoaded', () => {
    // Set initial page title
    document.title = 'Pomodoro App - 25:00';

    const pomodoroApp = document.getElementById('pomodoro-app');

    // Constants
    const ONE_MINUTE = 60; // One minute in seconds
    const WORK_TIME = 25 * ONE_MINUTE; // 25 minutes for the Pomodoro timer
    const SHORT_BREAK_TIME = 5 * ONE_MINUTE; // 5-minute short break
    const LONG_BREAK_TIME = 30 * ONE_MINUTE; // 30-minute long break

    // Variables
    let breakCounter = 0;
    let isPaused = false;
    let isBreak = false;
    let isBreakRunning = false;
    let interval;
    let totalSessions = 0;
    let breakSessions = 0;
    let isShortBreak = false;
    let breakTimeLeft;
    let addedTime = 0; // Store additional minutes added to the timer
    let timeLeft = WORK_TIME;  // Initial time set to 25 minutes

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
        const minutes = Math.floor(timeLeft / ONE_MINUTE);
        const seconds = timeLeft % ONE_MINUTE;

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
            timeLeft = WORK_TIME + addedTime;  
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
        timeLeft = WORK_TIME; // Reset timer to 25 minutes
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
            breakTimeLeft = LONG_BREAK_TIME; // 30-minute break
        } else {
            // Short break between sessions
            breakTimeLeft = SHORT_BREAK_TIME; // 5-minute break
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
            <p>Take a break and start again after: <span id="break-time">${Math.floor(breakTimeLeft / ONE_MINUTE)} mins</span></p>
        `;

        // Countdown for the break period
        const breakInterval = setInterval(() => {
            const minutes = Math.floor(breakTimeLeft / ONE_MINUTE);
            const seconds = breakTimeLeft % ONE_MINUTE;
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
        timeLeft = WORK_TIME + addedTime;  
        addedTime = 0; // Reset additional time
        document.getElementById('pause').textContent = 'Start'; // Change button back to 'Start'
        document.getElementById('pause').setAttribute('id', 'start');
    }

    // Add event listeners for the buttons
    document.addEventListener('click', (e) => {
        switch (e.target.id) {
            case 'start':
                startTimer(); // Start the timer
                break;
            case 'pause':
                if (!isBreakRunning) pauseTimer(); // Pause the timer
                break;
            case 'resume':
                resumeTimer(); // Resume the timer
                break;
            case 'restart':
                if (!isBreakRunning) resetTimer(); // Restart the timer
                break;
            case 'add-1min':
                timeLeft += ONE_MINUTE;  // add 1 minute
                break;
            case 'add-10min':
                timeLeft += 10 * ONE_MINUTE;  // Add 10 minutes
                break;
        }
    });
});