document.addEventListener('DOMContentLoaded', () => {
  document.title = 'Pomodoro App - 25:00';

  // DOM Elements creation using BEM methodology
  const pomodoroApp = document.getElementById('pomodoro-app');

  let breakCounter = 0;
  let isPaused = false;
  let isBreak = false;
  let interval;
  let totalSessions = 0;
  let breakSessions = 0;
  let isShortBreak = false;

  // Create Timer DOM
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

  // Initial call to set up timer
  createPomodoroTimer();

  let timeLeft = 25 * 60;  // Set the timer to 25 minutes

  // Update timer display
  function updateTimerDisplay(minutes, seconds) {
      const timeDisplay = document.getElementById('time-display');
      timeDisplay.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      document.title = `${minutes}:${seconds < 10 ? '0' : ''}${seconds} - Pomodoro Timer`;
  }

  // Timer countdown function
  function countdown() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;

      updateTimerDisplay(minutes, seconds);

      if (timeLeft > 0) {
          timeLeft--;
      } else {
          clearInterval(interval);
          timerEnd();
      }
  }

  // Show the popup when the time is up
  function showPopup() {
      const popup = document.getElementById('popup');
      popup.classList.remove('hidden'); // Show popup
  }

  // Hide the popup after 5 seconds
  function hidePopup() {
      const popup = document.getElementById('popup');
      setTimeout(() => {
          popup.classList.add('hidden');
      }, 10000); // Hide after 10 seconds
  }

  // Start the timer
  function startTimer() {
      if (!isPaused && !isBreak) {
          timeLeft = 25 * 60; // Set the timer to 25 minutes
      }
      interval = setInterval(countdown, 1000);
      document.getElementById('start').textContent = 'Pause';
      document.getElementById('start').setAttribute('id', 'pause');
      isPaused = false;
  }

  // Pause the timer
  function pauseTimer() {
      clearInterval(interval);
      document.getElementById('pause').textContent = 'Resume';
      document.getElementById('pause').setAttribute('id', 'resume');
      isPaused = true;
  }

  // Resume the timer after pausing
  function resumeTimer() {
      interval = setInterval(countdown, 1000);
      document.getElementById('resume').textContent = 'Pause';
      document.getElementById('resume').setAttribute('id', 'pause');
  }

  // Reset the timer
  function resetTimer() {
      clearInterval(interval);
      timeLeft = 25 * 60;
      isPaused = false;
      createPomodoroTimer();
  }

  // Timer ends
  function timerEnd() {
      totalSessions++;
      showPopup(); // Show the popup
      breakCounter++;
      if (breakCounter === 4) {
          breakCounter = 0;
          timeLeft = 30 * 60;  // Set 30-minute long break
      } else {
          timeLeft = 5 * 60;  // Set 5-minute break
          isShortBreak = true;
      }
      hidePopup(); // Hide the popup after a few seconds
      startBreakCountdown(); // Start the break timer
  }

  // Start break countdown, but display break time on start button
  function startBreakCountdown() {
      let breakTimeLeft = timeLeft;
      const restartButton = document.getElementById('restart');
      restartButton.disabled = true; // Disable the restart button during break

      const popup = document.getElementById('popup');
      const popupContent = popup.querySelector('.popup-content');
      popup.classList.remove('hidden');
      popupContent.innerHTML = `
          <h2>Time is up!</h2>
          <p>Take a break and start again after: <span id="break-time">${Math.floor(breakTimeLeft / 60)} mins</span></p>
      `;

      const breakInterval = setInterval(() => {
          const minutes = Math.floor(breakTimeLeft / 60);
          const seconds = breakTimeLeft % 60;
          const startButton = document.getElementById('pause');
          startButton.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

          document.getElementById('break-time').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // Update break time in the popup

          if (breakTimeLeft > 0) {
              breakTimeLeft--;
          } else {
              clearInterval(breakInterval);
              popupContent.innerHTML = `
                  <h2>Break is over!</h2>
                  <p>Time to start a new work session.</p>
              `;
              setTimeout(() => {
                  popup.classList.add('hidden');
                  resetWorkSession();
                  restartButton.disabled = false; // Re-enable the restart button after break
              }, 5000); // Hide the popup after 5 seconds
          }
      }, 1000);
  }

  // Reset the work session after the break
  function resetWorkSession() {
      timeLeft = 25 * 60;  // Reset the timer to 25 minutes
      isShortBreak = false;
      document.getElementById('pause').textContent = 'Start';  // Reset button text to 'Start'
      document.getElementById('pause').setAttribute('id', 'start');
  }

  // Add event listeners for buttons
  document.addEventListener('click', (e) => {
      if (e.target.id === 'start') {
          startTimer();
      } else if (e.target.id === 'pause') {
          pauseTimer();
      } else if (e.target.id === 'resume') {
          resumeTimer();
      } else if (e.target.id === 'restart') {
          resetTimer();
      } else if (e.target.id === 'add-1min') {
          timeLeft += 60;
      } else if (e.target.id === 'add-10min') {
          timeLeft += 600;
      }
  });
});
