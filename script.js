// DOM Elements
const studyTab = document.querySelector('[data-mode="study"]')
const breakTab = document.querySelector('[data-mode="break"]')
const studyTimeInput = document.getElementById("studyTime")
const breakTimeInput = document.getElementById("breakTime")
const minutesDisplay = document.getElementById("minutes")
const secondsDisplay = document.getElementById("seconds")
const startBtn = document.getElementById("startBtn")
const modeLabel = document.getElementById("modeLabel")
const countdownOverlay = document.getElementById("countdownOverlay")
const countdownText = document.getElementById("countdownText")

// State
let currentMode = "study"
let isRunning = false
let timeRemaining = 0
let timerInterval = null

// Initialize
function init() {
  updateDisplay()

  studyTab.addEventListener("click", () => switchTab("study"))
  breakTab.addEventListener("click", () => switchTab("break"))
  startBtn.addEventListener("click", toggleTimer)

  studyTimeInput.addEventListener("change", updateDisplay)
  breakTimeInput.addEventListener("change", updateDisplay)
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
    updateDisplay()
  }
}

function updateDisplay() {
  if (!isRunning) {
    const minutes =
      currentMode === "study" ? Number.parseInt(studyTimeInput.value) : Number.parseInt(breakTimeInput.value)

    timeRemaining = minutes * 60
    displayTime(timeRemaining)
  }
}

function displayTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  minutesDisplay.textContent = mins.toString().padStart(2, "0")
  secondsDisplay.textContent = secs.toString().padStart(2, "0")
}

function toggleTimer() {
  if (isRunning) {
    pauseTimer()
  } else {
    startTimer()
  }
}

function startTimer() {
  isRunning = true
  startBtn.textContent = "Pause"
  startBtn.classList.add("pause")

  // If starting fresh, get the time from inputs
  if (timeRemaining === 0) {
    updateDisplay()
  }

  timerInterval = setInterval(() => {
    timeRemaining--
    displayTime(timeRemaining)

    if (timeRemaining <= 0) {
      clearInterval(timerInterval)
      switchMode()
    }
  }, 1000)
}

function pauseTimer() {
  isRunning = false
  startBtn.textContent = "Start"
  startBtn.classList.remove("pause")
  clearInterval(timerInterval)
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

      // Start the new timer automatically
      updateDisplay()
      startTimer()
    }
  }, 1000)
}

// Initialize the app
init()
