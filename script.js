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

  // Allow simple editing: sanitize on blur or Enter
  minutesDisplay.addEventListener('blur', onEditBlur)
  secondsDisplay.addEventListener('blur', onEditBlur)

  minutesDisplay.addEventListener('keydown', onEditableKeydown)
  secondsDisplay.addEventListener('keydown', onEditableKeydown)
}

function onEditableKeydown(e) {
  // If Enter pressed, commit and remove selection
  if (e.key === 'Enter') {
    e.preventDefault()
    e.target.blur()
  }
}

function onEditBlur() {
  // sanitize values and ensure they fit into minutes/seconds
  const mins = Math.max(0, parseInt(minutesDisplay.textContent, 10) || 0)
  let secs = Math.max(0, parseInt(secondsDisplay.textContent, 10) || 0)

  // carry over extra seconds into minutes
  const total = mins * 60 + secs
  writeTime(total)
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

  // Reset timer if not running
  if (!isRunning) {
    // preset common defaults for each mode only when not running
    if (currentMode === 'study') writeTime(25 * 60)
    else writeTime(5 * 60)
  }

  applyModeColors()
}

function applyModeColors(){
  // remove both and add the one matching currentMode on body
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
  // If starting fresh, determine the starting time BEFORE marking running
  if (timeRemaining === 0) {
    const read = readEditableTime()
    if (read > 0) timeRemaining = read
    else timeRemaining = currentMode === 'study' ? 25 * 60 : 5 * 60
  }

  isRunning = true
  startBtn.textContent = "Pause"
  startBtn.classList.add("pause")

  // lock edits and block page interactions
  minutesDisplay.contentEditable = 'false'
  secondsDisplay.contentEditable = 'false'
  pageBlocker.classList.add('active')

  // allow startBtn (which becomes pause) to remain clickable by raising its z-index
  startBtn.style.position = 'relative'
  startBtn.style.zIndex = 1001

  // ensure no existing interval is running
  if (timerInterval) clearInterval(timerInterval)

  // show initial time immediately
  writeTime(timeRemaining)

  timerInterval = setInterval(() => {
    timeRemaining--

    if (timeRemaining >= 0) {
      // show the current time (this will show 00:00 when it reaches zero)
      displayTime(timeRemaining)
    }

    if (timeRemaining <= 0) {
      clearInterval(timerInterval)
      timerInterval = null
      switchMode()
    }
  }, 1000)
}

function pauseTimer() {
  isRunning = false
  startBtn.textContent = "Start"
  startBtn.classList.remove("pause")
  clearInterval(timerInterval)

  // unlock editing and remove page blocker
  minutesDisplay.contentEditable = 'true'
  secondsDisplay.contentEditable = 'true'
  pageBlocker.classList.remove('active')
  startBtn.style.zIndex = ''
  startBtn.style.position = ''
}

function switchMode() {
  isRunning = false

  // Switch to opposite mode
  currentMode = currentMode === "study" ? "break" : "study"

  // Update UI
  if (currentMode === "study") {
    studyTab.classList.add("active")
    breakTab.classList.remove("active")
    modeLabel.textContent = "Study Mode"
  } else {
    breakTab.classList.add("active")
    studyTab.classList.remove("active")
    modeLabel.textContent = "Break Mode"
  }

  // Show countdown animation
  showCountdown()
}

function showCountdown() {
  countdownOverlay.classList.add("active")

  const countdownSequence = ["3", "2", "1", "Start!"]
  let index = 0

  countdownText.textContent = countdownSequence[index]

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
      countdownOverlay.classList.remove("active")

      // Prepare next session time (use defaults for auto-switch) then start
      timeRemaining = currentMode === 'study' ? 25 * 60 : 5 * 60
      writeTime(timeRemaining)
      startTimer()
    }
  }, 1000)
}

// Initialize the app
init()
