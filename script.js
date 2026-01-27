// Custom cursor and login system with Mini Games
document.addEventListener('DOMContentLoaded', function() {
  console.log('กำลังโหลดระบบ Login, เมาส์ และมินิเกม...');
  
  // สร้างองค์ประกอบเมาส์ถ้ายังไม่มี
  function createCursorElements() {
    if (!document.querySelector('.cursor-dot')) {
      const cursorDot = document.createElement('div');
      cursorDot.className = 'cursor-dot';
      document.body.appendChild(cursorDot);
    }
    
    if (!document.querySelector('.cursor-outline')) {
      const cursorOutline = document.createElement('div');
      cursorOutline.className = 'cursor-outline';
      document.body.appendChild(cursorOutline);
    }
    
    if (!document.querySelector('.cursor-trail')) {
      const cursorTrail = document.createElement('div');
      cursorTrail.className = 'cursor-trail';
      document.body.appendChild(cursorTrail);
    }
    
    if (!document.getElementById('click-effects')) {
      const clickEffectsContainer = document.createElement('div');
      clickEffectsContainer.id = 'click-effects';
      document.body.appendChild(clickEffectsContainer);
    }
  }
  
  // สร้างองค์ประกอบเมาส์
  createCursorElements();
  
  // Cursor elements
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');
  const cursorTrail = document.querySelector('.cursor-trail');
  const clickEffectsContainer = document.getElementById('click-effects');
  
  // Login elements
  const loginModal = document.getElementById('loginModal');
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const mainContent = document.getElementById('mainContent');
  const logoutBtn = document.getElementById('logoutBtn');
  const sessionTimer = document.getElementById('sessionTimer');
  
  // Game elements
  const clickGameArea = document.getElementById('clickGameArea');
  const catchGameArea = document.getElementById('catchGameArea');
  const memoryGameArea = document.getElementById('memoryGameArea');
  
  // Mouse position
  let mouseX = 0;
  let mouseY = 0;
  let outlineX = 0;
  let outlineY = 0;
  let trailX = 0;
  let trailY = 0;
  
  // Cursor speed
  const outlineSpeed = 0.15;
  const trailSpeed = 0.05;
  
  // Trail history
  const trailHistory = [];
  const trailLength = 10;
  
  // Is mouse down?
  let isMouseDown = false;
  
  // Login state
  let isLoggedIn = false;
  let escapeMode = false;
  let escapeTimer = null;
  let sessionTime = 60 * 60; // 60 minutes in seconds
  
  // Game states
  let clickGameActive = false;
  let clickScore = 0;
  let clickTimeLeft = 10;
  let clickInterval = null;
  
  let catchGameActive = false;
  let catchScore = 0;
  let missScore = 0;
  let catchInterval = null;
  
  let memoryGameActive = false;
  let memorySequence = [];
  let playerSequence = [];
  let memoryLevel = 1;
  let memoryScore = 0;
  
  // Update cursor position
  function updateCursorPosition(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Add position to trail history
    trailHistory.unshift({x: mouseX, y: mouseY});
    if (trailHistory.length > trailLength) {
      trailHistory.pop();
    }
    
    // Update dot position immediately if cursor is visible
    if (cursorDot.style.display !== 'none') {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  }
  
  // Animate cursor
  function animateCursor() {
    // Smooth movement for outline
    outlineX += (mouseX - outlineX) * outlineSpeed;
    outlineY += (mouseY - outlineY) * outlineSpeed;
    
    // Smooth movement for trail (average of trail history)
    if (trailHistory.length > 0) {
      let avgX = 0;
      let avgY = 0;
      for (let i = 0; i < trailHistory.length; i++) {
        avgX += trailHistory[i].x;
        avgY += trailHistory[i].y;
      }
      avgX /= trailHistory.length;
      avgY /= trailHistory.length;
      
      trailX += (avgX - trailX) * trailSpeed;
      trailY += (avgY - trailY) * trailSpeed;
    } else {
      trailX = mouseX;
      trailY = mouseY;
    }
    
    // Apply positions if cursor is visible
    if (cursorOutline.style.display !== 'none') {
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
      
      cursorTrail.style.left = `${trailX}px`;
      cursorTrail.style.top = `${trailY}px`;
    }
    
    // Request next animation frame
    requestAnimationFrame(animateCursor);
  }
  
  // Create click effect
  function createClickEffect(x, y, color = '#ff6b9d') {
    const clickEffect = document.createElement('div');
    clickEffect.className = 'click-effect';
    clickEffect.style.left = `${x}px`;
    clickEffect.style.top = `${y}px`;
    clickEffect.style.background = `radial-gradient(circle, ${color} 0%, rgba(255,107,157,0) 70%)`;
    
    clickEffectsContainer.appendChild(clickEffect);
    
    // Remove effect after animation completes
    setTimeout(() => {
      if (clickEffect.parentNode) {
        clickEffect.remove();
      }
    }, 600);
  }
  
  // Handle mouse clicks
  function handleClick(e) {
    createClickEffect(e.clientX, e.clientY, '#ff6b9d');
    
    // Create smaller secondary effects
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const offsetX = (Math.random() - 0.5) * 50;
        const offsetY = (Math.random() - 0.5) * 50;
        const size = Math.random() * 50 + 20;
        
        const miniEffect = document.createElement('div');
        miniEffect.style.position = 'fixed';
        miniEffect.style.left = `${e.clientX + offsetX}px`;
        miniEffect.style.top = `${e.clientY + offsetY}px`;
        miniEffect.style.width = `${size}px`;
        miniEffect.style.height = `${size}px`;
        miniEffect.style.borderRadius = '50%';
        miniEffect.style.background = `radial-gradient(circle, rgba(255,107,157,0.6) 0%, rgba(255,107,157,0) 70%)`;
        miniEffect.style.transform = 'translate(-50%, -50%)';
        miniEffect.style.pointerEvents = 'none';
        miniEffect.style.zIndex = '99996';
        miniEffect.style.animation = 'clickRipple 0.4s ease-out forwards';
        
        clickEffectsContainer.appendChild(miniEffect);
        
        setTimeout(() => {
          if (miniEffect.parentNode) {
            miniEffect.remove();
          }
        }, 400);
      }, i * 100);
    }
    
    // Cursor click animation
    cursorDot.style.transform = 'translate(-50%, -50%) scale(0.5)';
    cursorOutline.style.transform = 'translate(-50%, -50%) scale(0.8)';
    cursorOutline.style.borderColor = 'rgba(255, 107, 157, 1)';
    
    setTimeout(() => {
      cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
      if (!isMouseDown) {
        cursorOutline.style.borderColor = 'rgba(255, 107, 157, 0.7)';
      }
    }, 100);
  }
  
  // Handle mouse down
  function handleMouseDown() {
    isMouseDown = true;
    cursorDot.style.transform = 'translate(-50%, -50%) scale(0.7)';
    cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.2)';
    cursorOutline.style.borderColor = 'rgba(255, 107, 157, 1)';
    cursorOutline.style.boxShadow = '0 0 20px rgba(255, 107, 157, 0.8)';
  }
  
  // Handle mouse up
  function handleMouseUp() {
    isMouseDown = false;
    cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorOutline.style.borderColor = 'rgba(255, 107, 157, 0.7)';
    cursorOutline.style.boxShadow = '0 0 10px rgba(255, 107, 157, 0.5)';
  }
  
  // Handle hover effects
  function handleHoverStart(e) {
    if (escapeMode && e.target === loginBtn) return;
    
    cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
    cursorDot.style.backgroundColor = '#6c63ff';
    cursorDot.style.boxShadow = '0 0 15px #6c63ff, 0 0 30px #6c63ff';
    
    cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.3)';
    cursorOutline.style.borderColor = 'rgba(108, 99, 255, 0.8)';
    cursorOutline.style.boxShadow = '0 0 15px rgba(108, 99, 255, 0.6)';
  }
  
  function handleHoverEnd() {
    cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorDot.style.backgroundColor = '#ff6b9d';
    cursorDot.style.boxShadow = '0 0 10px #ff6b9d, 0 0 20px #ff6b9d';
    
    cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorOutline.style.borderColor = 'rgba(255, 107, 157, 0.7)';
    cursorOutline.style.boxShadow = '0 0 10px rgba(255, 107, 157, 0.5)';
  }
  
  // Initialize cursor position to center
  function initializeCursorPosition() {
    mouseX = window.innerWidth / 2;
    mouseY = window.innerHeight / 2;
    outlineX = mouseX;
    outlineY = mouseY;
    trailX = mouseX;
    trailY = mouseY;
    
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top = `${outlineY}px`;
    cursorTrail.style.left = `${trailX}px`;
    cursorTrail.style.top = `${trailY}px`;
  }
  
  // Show/Hide cursor based on page
  function updateCursorVisibility() {
    if (loginModal.style.display === 'flex' || loginModal.style.display === '') {
      // Hide custom cursor on login page
      cursorDot.style.display = 'none';
      cursorOutline.style.display = 'none';
      cursorTrail.style.display = 'none';
      document.body.style.cursor = 'auto';
    } else {
      // Show custom cursor on main content
      cursorDot.style.display = 'block';
      cursorOutline.style.display = 'block';
      cursorTrail.style.display = 'block';
      document.body.style.cursor = 'none';
    }
  }
  
  // Activate escape mode (button runs away from cursor)
  function activateEscapeMode() {
    if (escapeMode) return;
    
    escapeMode = true;
    console.log('🔥 ปุ่ม Login เริ่มหนีเมาส์แล้ว!');
    
    // Add escaping class
    loginBtn.classList.add('escaping');
    
    // Remove hover effects from login button
    loginBtn.removeEventListener('mouseenter', handleHoverStart);
    loginBtn.removeEventListener('mouseleave', handleHoverEnd);
    
    // Make button position absolute so it can move
    loginBtn.style.position = 'fixed';
    loginBtn.style.top = '50%';
    loginBtn.style.left = '50%';
    loginBtn.style.transform = 'translate(-50%, -50%)';
    
    // Start escape animation
    let escapeStartTime = Date.now();
    const escapeDuration = 60000; // 1 minute
    
    function updateEscapePosition() {
      if (!escapeMode) return;
      
      const elapsed = Date.now() - escapeStartTime;
      
      if (elapsed < escapeDuration) {
        // Calculate position based on time
        const progress = elapsed / escapeDuration;
        const angle = progress * Math.PI * 2;
        const radius = Math.min(window.innerWidth, window.innerHeight) * 0.4;
        
        const x = Math.cos(angle * 3) * radius * (0.5 + Math.sin(progress * Math.PI) * 0.5);
        const y = Math.sin(angle * 2) * radius * (0.5 + Math.cos(progress * Math.PI) * 0.5);
        
        loginBtn.style.left = `calc(50% + ${x}px)`;
        loginBtn.style.top = `calc(50% + ${y}px)`;
        
        // Change button color based on position
        const hue = (progress * 360) % 360;
        loginBtn.style.background = `linear-gradient(45deg, hsl(${hue}, 100%, 65%), hsl(${(hue + 60) % 360}, 100%, 65%))`;
        
        requestAnimationFrame(updateEscapePosition);
      } else {
        // Escape mode ended
        deactivateEscapeMode();
      }
    }
    
    updateEscapePosition();
    
    // Set timeout to end escape mode
    escapeTimer = setTimeout(() => {
      deactivateEscapeMode();
    }, escapeDuration);
  }
  
  // Deactivate escape mode
  function deactivateEscapeMode() {
    if (!escapeMode) return;
    
    escapeMode = false;
    console.log('✅ ปุ่ม Login หยุดหนีแล้ว');
    
    // Remove escaping class
    loginBtn.classList.remove('escaping');
    
    // Reset button position and style
    loginBtn.style.position = '';
    loginBtn.style.top = '';
    loginBtn.style.left = '';
    loginBtn.style.transform = '';
    loginBtn.style.background = '';
    
    // Restore hover effects
    loginBtn.addEventListener('mouseenter', handleHoverStart);
    loginBtn.addEventListener('mouseleave', handleHoverEnd);
    
    if (escapeTimer) {
      clearTimeout(escapeTimer);
      escapeTimer = null;
    }
  }
  
  // Handle login
  function handleLogin(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Any password works!
    console.log('🔑 รหัสผ่านที่ใส่:', password || '(ว่าง)');
    console.log('✅ เข้าสู่ระบบสำเร็จ!');
    
    // Create success effect
    createClickEffect(
      window.innerWidth / 2, 
      window.innerHeight / 2, 
      '#2ecc71'
    );
    
    // Add multiple success effects
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const angle = (i / 10) * Math.PI * 2;
        const radius = 100;
        const x = window.innerWidth / 2 + Math.cos(angle) * radius;
        const y = window.innerHeight / 2 + Math.sin(angle) * radius;
        
        createClickEffect(x, y, '#2ecc71');
      }, i * 50);
    }
    
    // Save to localStorage if remember me is checked
    if (rememberMe) {
      localStorage.setItem('waexeth_logged_in', 'true');
      localStorage.setItem('waexeth_username', 'WAEXETH');
    }
    
    // Hide login modal and show main content
    loginModal.style.opacity = '0';
    setTimeout(() => {
      loginModal.style.display = 'none';
      mainContent.style.display = 'block';
      
      // Update cursor visibility
      updateCursorVisibility();
      
      // Update last login time
      const now = new Date();
      const timeString = now.toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      document.getElementById('lastLoginTime').textContent = timeString;
      
      // Start session timer
      startSessionTimer();
      
      // Load game scores
      loadGameScores();
    }, 500);
    
    isLoggedIn = true;
  }
  
  // Handle logout
  function handleLogout() {
    // Create logout effect
    createClickEffect(
      window.innerWidth / 2, 
      window.innerHeight / 2, 
      '#ff6b9d'
    );
    
    // Reset session
    localStorage.removeItem('waexeth_logged_in');
    localStorage.removeItem('waexeth_username');
    
    // Hide main content and show login modal
    mainContent.style.display = 'none';
    loginModal.style.display = 'flex';
    loginModal.style.opacity = '1';
    
    // Update cursor visibility
    updateCursorVisibility();
    
    // Reset form
    document.getElementById('password').value = '';
    document.getElementById('rememberMe').checked = false;
    
    // Reactivate escape mode for next login
    if (escapeTimer) {
      clearTimeout(escapeTimer);
      escapeTimer = null;
    }
    escapeMode = false;
    
    isLoggedIn = false;
    
    console.log('🚪 ออกจากระบบแล้ว');
  }
  
  // Start session timer
  function startSessionTimer() {
    sessionTime = 60 * 60; // Reset to 60 minutes
    
    function updateTimer() {
      if (!isLoggedIn) return;
      
      const minutes = Math.floor(sessionTime / 60);
      const seconds = sessionTime % 60;
      
      sessionTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      if (sessionTime <= 0) {
        // Auto logout
        handleLogout();
        return;
      }
      
      sessionTime--;
      setTimeout(updateTimer, 1000);
    }
    
    updateTimer();
  }
  
  // ==================== MINI GAMES ====================
  
  // Click Game
  window.startClickGame = function() {
    closeAllGames();
    clickGameArea.style.display = 'block';
    clickGameActive = true;
    clickScore = 0;
    clickTimeLeft = 10;
    
    document.getElementById('clickCounter').textContent = clickScore;
    document.getElementById('clickTimer').textContent = clickTimeLeft;
    
    const clickTarget = document.getElementById('clickTarget');
    clickTarget.onclick = function() {
      if (!clickGameActive) return;
      
      clickScore++;
      document.getElementById('clickCounter').textContent = clickScore;
      document.getElementById('clickScore').textContent = clickScore;
      
      // Animate target
      clickTarget.style.transform = 'scale(0.95)';
      setTimeout(() => {
        clickTarget.style.transform = 'scale(1)';
      }, 100);
      
      // Create click effect
      const rect = clickTarget.getBoundingClientRect();
      createClickEffect(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        '#ff6b9d'
      );
    };
    
    // Start timer
    clickInterval = setInterval(() => {
      clickTimeLeft--;
      document.getElementById('clickTimer').textContent = clickTimeLeft;
      
      if (clickTimeLeft <= 0) {
        endClickGame();
      }
    }, 1000);
  };
  
  function endClickGame() {
    clickGameActive = false;
    clearInterval(clickInterval);
    
    // Save high score
    saveHighScore('click', clickScore);
    
    alert(`Game Over!\nคุณคลิกได้ ${clickScore} ครั้ง!`);
    closeGame('clickGameArea');
  }
  
  // Catch Game
  window.startCatchGame = function() {
    closeAllGames();
    catchGameArea.style.display = 'block';
    catchGameActive = true;
    catchScore = 0;
    missScore = 0;
    
    document.getElementById('catchCount').textContent = catchScore;
    document.getElementById('missCount').textContent = missScore;
    
    const runningDot = document.getElementById('runningDot');
    const container = document.getElementById('catchContainer');
    
    // Position dot randomly
    moveRunningDot();
    
    // Click handler for dot
    runningDot.onclick = function(e) {
      if (!catchGameActive) return;
      
      e.stopPropagation();
      catchScore++;
      document.getElementById('catchCount').textContent = catchScore;
      document.getElementById('catchScore').textContent = catchScore;
      
      // Create effect
      const rect = runningDot.getBoundingClientRect();
      createClickEffect(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        '#2ecc71'
      );
      
      // Move dot
      moveRunningDot();
    };
    
    // Miss handler
    container.onclick = function() {
      if (!catchGameActive) return;
      
      missScore++;
      document.getElementById('missCount').textContent = missScore;
      document.getElementById('missScore').textContent = missScore;
      
      // Create effect
      createClickEffect(mouseX, mouseY, '#ff0000');
    };
    
    // Auto move dot every 2 seconds
    catchInterval = setInterval(() => {
      if (catchGameActive) {
        moveRunningDot();
        missScore++;
        document.getElementById('missCount').textContent = missScore;
        document.getElementById('missScore').textContent = missScore;
      }
    }, 2000);
    
    // End game after 30 seconds
    setTimeout(() => {
      if (catchGameActive) {
        endCatchGame();
      }
    }, 30000);
  };
  
  function moveRunningDot() {
    const runningDot = document.getElementById('runningDot');
    const container = document.getElementById('catchContainer');
    const rect = container.getBoundingClientRect();
    
    const maxX = rect.width - 40;
    const maxY = rect.height - 40;
    
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    
    runningDot.style.left = `${x}px`;
    runningDot.style.top = `${y}px`;
  }
  
  function endCatchGame() {
    catchGameActive = false;
    clearInterval(catchInterval);
    
    // Save high score
    saveHighScore('catch', catchScore);
    
    alert(`Game Over!\nคุณจับจุดได้ ${catchScore} ครั้ง\nพลาด ${missScore} ครั้ง`);
    closeGame('catchGameArea');
  }
  
  // Memory Game
  window.startMemoryGame = function() {
    closeAllGames();
    memoryGameArea.style.display = 'block';
    memoryGameActive = true;
    memorySequence = [];
    playerSequence = [];
    memoryLevel = 1;
    memoryScore = 0;
    
    document.getElementById('memoryLevel').textContent = memoryLevel;
    document.getElementById('memoryScore').textContent = memoryScore;
    document.getElementById('sequenceLength').textContent = memoryLevel + 2;
    
    // Generate initial sequence
    generateSequence();
    showSequence();
    
    // Setup button handlers
    const buttons = document.querySelectorAll('.memory-btn');
    buttons.forEach(button => {
      button.onclick = function() {
        if (!memoryGameActive) return;
        
        const color = this.getAttribute('data-color');
        playerSequence.push(color);
        
        // Highlight button
        this.classList.add('active');
        setTimeout(() => {
          this.classList.remove('active');
        }, 300);
        
        // Check sequence
        checkSequence();
      };
    });
  };
  
  function generateSequence() {
    memorySequence = [];
    const colors = ['red', 'blue', 'green', 'yellow'];
    
    for (let i = 0; i < memoryLevel + 2; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      memorySequence.push(randomColor);
    }
  }
  
  function showSequence() {
    const buttons = document.querySelectorAll('.memory-btn');
    let delay = 0;
    
    memorySequence.forEach(color => {
      setTimeout(() => {
        const button = document.querySelector(`.memory-btn.${color}`);
        button.classList.add('active');
        
        setTimeout(() => {
          button.classList.remove('active');
        }, 500);
      }, delay);
      
      delay += 800;
    });
    
    // Enable player input after showing sequence
    setTimeout(() => {
      playerSequence = [];
    }, delay);
  }
  
  function checkSequence() {
    const currentIndex = playerSequence.length - 1;
    
    // Check if wrong
    if (playerSequence[currentIndex] !== memorySequence[currentIndex]) {
      memoryGameActive = false;
      saveHighScore('memory', memoryScore);
      alert(`Game Over!\nระดับที่คุณไปได้: ${memoryLevel}\nคะแนน: ${memoryScore}`);
      closeGame('memoryGameArea');
      return;
    }
    
    // Check if sequence complete
    if (playerSequence.length === memorySequence.length) {
      memoryLevel++;
      memoryScore += 10;
      
      document.getElementById('memoryLevel').textContent = memoryLevel;
      document.getElementById('memoryScore').textContent = memoryScore;
      document.getElementById('sequenceLength').textContent = memoryLevel + 2;
      
      // Generate new sequence
      generateSequence();
      setTimeout(() => {
        showSequence();
      }, 1000);
    }
  }
  
  // Game utility functions
  window.closeGame = function(gameAreaId) {
    const gameArea = document.getElementById(gameAreaId);
    if (gameArea) {
      gameArea.style.display = 'none';
    }
    
    // Reset game states
    if (gameAreaId === 'clickGameArea') {
      clickGameActive = false;
      clearInterval(clickInterval);
    } else if (gameAreaId === 'catchGameArea') {
      catchGameActive = false;
      clearInterval(catchInterval);
    } else if (gameAreaId === 'memoryGameArea') {
      memoryGameActive = false;
    }
  };
  
  function closeAllGames() {
    closeGame('clickGameArea');
    closeGame('catchGameArea');
    closeGame('memoryGameArea');
  }
  
  // Save and load high scores
  function saveHighScore(game, score) {
    const highScores = JSON.parse(localStorage.getItem('waexeth_highscores') || '{}');
    
    if (!highScores[game] || score > highScores[game]) {
      highScores[game] = score;
      localStorage.setItem('waexeth_highscores', JSON.stringify(highScores));
      updateHighScoreDisplay(game, score);
    }
  }
  
  function loadGameScores() {
    const highScores = JSON.parse(localStorage.getItem('waexeth_highscores') || '{}');
    
    Object.keys(highScores).forEach(game => {
      updateHighScoreDisplay(game, highScores[game]);
    });
  }
  
  function updateHighScoreDisplay(game, score) {
    const element = document.getElementById(`${game}Score`);
    if (element && parseInt(element.textContent) < score) {
      element.textContent = score;
      element.classList.add('score-pop');
      setTimeout(() => {
        element.classList.remove('score-pop');
      }, 300);
    }
  }
  
  // Check if already logged in
  function checkLoginStatus() {
    const savedLogin = localStorage.getItem('waexeth_logged_in');
    
    if (savedLogin === 'true') {
      // Auto login
      loginModal.style.display = 'none';
      mainContent.style.display = 'block';
      isLoggedIn = true;
      
      // Update cursor visibility
      updateCursorVisibility();
      
      // Update last login time
      const now = new Date();
      const timeString = now.toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      document.getElementById('lastLoginTime').textContent = timeString;
      
      // Start session timer
      startSessionTimer();
      
      // Load game scores
      loadGameScores();
      
      console.log('🔓 เข้าสู่ระบบอัตโนมัติจากที่จำไว้');
    } else {
      // Show cursor on login page initially
      updateCursorVisibility();
    }
  }
  
  // Event listeners
  document.addEventListener('mousemove', updateCursorPosition);
  document.addEventListener('click', handleClick);
  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mouseup', handleMouseUp);
  
  // Add hover effects to interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .link-btn, .social-link, .skill-tag, .logout-btn, .game-btn, .memory-btn');
  
  interactiveElements.forEach(element => {
    if (element !== loginBtn) { // We'll handle login button separately
      element.addEventListener('mouseenter', handleHoverStart);
      element.addEventListener('mouseleave', handleHoverEnd);
    }
  });
  
  // Login form submit
  loginForm.addEventListener('submit', handleLogin);
  
  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Forgot password link
  const forgotPassword = document.querySelector('.forgot-password');
  if (forgotPassword) {
    forgotPassword.addEventListener('click', function(e) {
      e.preventDefault();
      alert('Hint: Any password will work! 😉\nJust type anything and click login!');
    });
  }
  
  // Initialize and start animation
  initializeCursorPosition();
  animateCursor();
  
  // Check login status and setup cursor
  checkLoginStatus();
  
  // Start escape mode after a short delay if not logged in
  setTimeout(() => {
    if (!isLoggedIn) {
      activateEscapeMode();
    }
  }, 2000);
  
  // Add typing effect to the name
  const nameElement = document.querySelector('.name');
  if (nameElement && !isLoggedIn) {
    const originalName = nameElement.textContent;
    nameElement.textContent = '';
    
    let i = 0;
    function typeWriter() {
      if (i < originalName.length) {
        nameElement.textContent += originalName.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
      }
    }
    
    // Start typing effect after a short delay
    setTimeout(typeWriter, 500);
  }
  
  console.log('🎮 ระบบพร้อมใช้งาน!');
  console.log('✨ ลักษณะพิเศษ:');
  console.log('1. ระบบ Login ปลอม - พิมพ์อะไรก็ได้');
  console.log('2. ปุ่ม Login หนีเมาส์ 1 นาที');
  console.log('3. เมาส์เส้นชมพู (แสดงเฉพาะหลัง login)');
  console.log('4. มินิเกม 3 เกมในเว็บ');
  console.log('5. คลิกที่ไหนก็มีเอฟเฟกต์');
  console.log('6. จำคะแนนสูงสุดได้');
});

// เพิ่ม CSS animation ถ้ายังไม่มี
if (!document.querySelector('#cursor-styles')) {
  const style = document.createElement('style');
  style.id = 'cursor-styles';
  style.textContent = `
    @keyframes clickRipple {
      0% {
        width: 0;
        height: 0;
        opacity: 0.8;
      }
      100% {
        width: 200px;
        height: 200px;
        opacity: 0;
      }
    }
    
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;
  document.head.appendChild(style);
}
