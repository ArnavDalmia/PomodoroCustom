// DOM Elements
const studyTab = document.querySelector('[data-mode="study"]')
const breakTab = document.querySelector('[data-mode="break"]')
const minutesDisplay = document.getElementById("minutes")
const secondsDisplay = document.getElementById("seconds")
const startBtn = document.getElementById("startBtn")
const modeLabel = document.getElementById("modeLabel")
const countdownOverlay = document.getElementById("countdownOverlay")
const countdownText = document.getElementById("countdownText")
const pageBlocker = document.getElementById("pageBlocker")
const container = document.querySelector('.container')
const resetBtn = document.getElementById('resetBtn')

// State
let currentMode = "study"
let isRunning = false
let timeRemaining = 0
let timerInterval = null

// Helpers to read/edit the timer directly
function readEditableTime() {
  const minsText = minutesDisplay.textContent.trim()
  const secsText = secondsDisplay.textContent.trim()

  const mins = Math.max(0, parseInt(minsText, 10) || 0)
  const secs = Math.max(0, parseInt(secsText, 10) || 0)

  return mins * 60 + secs
}

// Return saved duration for a mode (seconds) or fallback default
function getModeDefault(mode) {
  const saved = parseInt(localStorage.getItem(`pomodoro.${mode}`), 10)
  if (!Number.isNaN(saved) && saved > 0) return saved
  return mode === 'study' ? 25 * 60 : 5 * 60
}

function writeTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  minutesDisplay.textContent = mins.toString().padStart(2, '0')
  secondsDisplay.textContent = secs.toString().padStart(2, '0')
}

// Initialize
function init() {
  // Initialize UI
  writeTime(25 * 60)
  applyModeColors()

  studyTab.addEventListener("click", () => switchTab("study"))
  breakTab.addEventListener("click", () => switchTab("break"))
  startBtn.addEventListener("click", toggleTimer)
  resetBtn.addEventListener('click', softReset)

  // reset button hidden initially
  resetBtn.hidden = true

  // Allow simple editing: sanitize on blur or Enter
  minutesDisplay.addEventListener('blur', onEditBlur)
  secondsDisplay.addEventListener('blur', onEditBlur)

  minutesDisplay.addEventListener('keydown', onEditableKeydown)
  secondsDisplay.addEventListener('keydown', onEditableKeydown)

  document.addEventListener('keydown', (e) => {
    const active = document.activeElement
    if (active === minutesDisplay || active === secondsDisplay || (active && active.isContentEditable)) return

    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault()
      toggleTimer()
    }

    if (e.key && e.key.toLowerCase() === 'r') {
      // only allow reset when not running
      if (!isRunning) {
        e.preventDefault()
        softReset()
      }
    }
  })
}

function onEditableKeydown(e) {
  // If Enter pressed, commit and remove selection
  if (e.key === 'Enter') {
    e.preventDefault()
    e.target.blur()
  }
}

function onEditBlur() {
  const mins = Math.max(0, parseInt(minutesDisplay.textContent, 10) || 0)
  let secs = Math.max(0, parseInt(secondsDisplay.textContent, 10) || 0)

  const total = mins * 60 + secs
  writeTime(total)

  try {
    localStorage.setItem(`pomodoro.${currentMode}`, String(total))
  } catch (err) {
  }
}

function switchTab(mode) {
  currentMode = mode

  // Update tab styles
  if (mode === "study") {
    studyTab.classList.add("active")
    breakTab.classList.remove("active")
    modeLabel.textContent = "Study Mode"
  } else {
    breakTab.classList.add("active")
    studyTab.classList.remove("active")
    modeLabel.textContent = "Break Mode"
  }

  if (!isRunning) {
    // load saved time for this mode if present, otherwise defaults
    timeRemaining = getModeDefault(currentMode)
    writeTime(timeRemaining)
  }

  applyModeColors()
}

function applyModeColors(){
  document.body.classList.remove('mode-study','mode-break')
  if (currentMode === 'study') document.body.classList.add('mode-study')
  else document.body.classList.add('mode-break')
}

function updateDisplay() {
  if (!isRunning) {
    timeRemaining = readEditableTime()
    writeTime(timeRemaining)
  }
}

function displayTime(seconds) { writeTime(seconds) }

function toggleTimer() {
  if (isRunning) {
    pauseTimer()
  } else {
    startTimer()
  }
}

function startTimer() {
  // if starting fresh, determine the starting time BEFORE marking running
  if (timeRemaining === 0) {
    const read = readEditableTime()
    if (read > 0) timeRemaining = read
    else {
      timeRemaining = getModeDefault(currentMode)
    }
  }
  console.log("TEST")

  isRunning = true
  startBtn.textContent = "Pause"
  startBtn.classList.add("pause")

  // immutable when in start mode
  minutesDisplay.contentEditable = 'false'
  secondsDisplay.contentEditable = 'false'
  pageBlocker.classList.add('active')

  startBtn.style.position = 'relative' // keep the pause button relative open
  startBtn.style.zIndex = 1001

  resetBtn.hidden = true //only when running we hide it

  if (timerInterval) clearInterval(timerInterval)

  // show initial time immediately
  writeTime(timeRemaining)

  timerInterval = setInterval(() => {
    timeRemaining--

    if (timeRemaining >= 0) {
      displayTime(timeRemaining)
    }

    if (timeRemaining <= 0) {
      clearInterval(timerInterval)
      timerInterval = null
      switchMode()
    }
  }, 1000) //1000 ms in 1 sec
}

function softReset() {
  // stop timer and overlays
  isRunning = false
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
  countdownOverlay.classList.remove('active')
  pageBlocker.classList.remove('active')

  // restore defaults and UI
  currentMode = 'study'
  studyTab.classList.add('active')
  breakTab.classList.remove('active')
  modeLabel.textContent = 'Study Mode'
  applyModeColors()
  timeRemaining = getModeDefault('study')

  writeTime(timeRemaining)

  minutesDisplay.contentEditable = 'true'
  secondsDisplay.contentEditable = 'true'
  resetBtn.hidden = true
}

function pauseTimer() {
  isRunning = false
  startBtn.textContent = "Start"
  startBtn.classList.remove("pause")
  clearInterval(timerInterval)

  minutesDisplay.contentEditable = 'true'
  secondsDisplay.contentEditable = 'true'
  pageBlocker.classList.remove('active')
  startBtn.style.zIndex = ''
  startBtn.style.position = ''
  resetBtn.hidden = false
}

function switchMode() {
  isRunning = false

  currentMode = currentMode === "study" ? "break" : "study"

  if (currentMode === "study") { // UI update
    studyTab.classList.add("active")
    breakTab.classList.remove("active")
    modeLabel.textContent = "Study Mode"
  } else {
    breakTab.classList.add("active")
    studyTab.classList.remove("active")
    modeLabel.textContent = "Break Mode"
  }

  showCountdown()
}

function showCountdown() { //special animation for changing modes
  pageBlocker.classList.add('active')
  pageBlocker.style.zIndex = '9998'
  countdownOverlay.classList.add("active")
  resetBtn.hidden = true

  const countdownSequence = ["3", "2", "1", "Start!"]
  let index = 0
  countdownText.textContent = countdownSequence[index]

  if (currentMode === 'study') countdownText.style.color = '#e6875e'
  else countdownText.style.color = '#79b3ed'

  const countdownInterval = setInterval(() => {
    index++

    if (index < countdownSequence.length) {
      countdownText.textContent = countdownSequence[index]
      // Restart animation
      countdownText.style.animation = "none"
      setTimeout(() => {
        countdownText.style.animation = "countdownPulse 1s ease-in-out"
      }, 10)
    } else {
      clearInterval(countdownInterval)

      applyModeColors() //UI change
      countdownOverlay.classList.remove("active")

  timeRemaining = getModeDefault(currentMode) //local storage update
  writeTime(timeRemaining)

      // reset pageBlocker z-index to normal (startTimer will ensure it's active)
      pageBlocker.style.zIndex = ''
      startTimer()
    }
  }, 1000)
}

init()
