const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro dimensions
    deviceScaleFactor: 3,
  });
  
  const page = await context.newPage();
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Since we can't run the actual app, let's create mock HTML pages
  // that represent the app screens with the actual design

  // Swipe Screen HTML
  const swipeHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: linear-gradient(135deg, #0A0A0B 0%, #151517 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          color: #FF7979;
          font-size: 28px;
          font-weight: bold;
        }
        .icons {
          display: flex;
          gap: 15px;
        }
        .icon {
          width: 40px;
          height: 40px;
          background: #1A1A1D;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F5F5F7;
        }
        .card-container {
          flex: 1;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card {
          width: 100%;
          max-width: 350px;
          height: 600px;
          background: linear-gradient(135deg, #FF7979 0%, #FF6B6B 100%);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
        }
        .profile-image {
          width: 100%;
          height: 70%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .profile-info {
          position: absolute;
          bottom: 0;
          width: 100%;
          padding: 20px;
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
        }
        .name {
          color: white;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .bio {
          color: rgba(255,255,255,0.8);
          font-size: 16px;
        }
        .actions {
          display: flex;
          justify-content: center;
          gap: 30px;
          padding: 20px;
        }
        .action-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .reject { background: #1A1A1D; color: #FF4458; }
        .super { background: #1A1A1D; color: #44D884; }
        .like { background: #FF7979; color: white; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Pairity</div>
        <div class="icons">
          <div class="icon">🔔</div>
          <div class="icon">💬</div>
        </div>
      </div>
      <div class="card-container">
        <div class="card">
          <div class="profile-image"></div>
          <div class="profile-info">
            <div class="name">Sarah, 25</div>
            <div class="bio">Adventure seeker | Coffee lover ☕</div>
          </div>
        </div>
      </div>
      <div class="actions">
        <div class="action-btn reject">✕</div>
        <div class="action-btn super">★</div>
        <div class="action-btn like">♥</div>
      </div>
    </body>
    </html>
  `;

  // Chat Screen HTML
  const chatHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #0A0A0B;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .header {
          background: #151517;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          border-bottom: 1px solid #1A1A1D;
        }
        .back { color: #FF7979; font-size: 24px; }
        .avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
        }
        .header-info {
          flex: 1;
        }
        .name { color: #F5F5F7; font-weight: bold; }
        .status { color: #FF7979; font-size: 12px; }
        .messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }
        .message {
          margin-bottom: 20px;
          display: flex;
        }
        .message.sent {
          justify-content: flex-end;
        }
        .bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 20px;
        }
        .received .bubble {
          background: #1A1A1D;
          color: #F5F5F7;
          border-bottom-left-radius: 4px;
        }
        .sent .bubble {
          background: #FF7979;
          color: white;
          border-bottom-right-radius: 4px;
        }
        .input-area {
          background: #151517;
          padding: 15px;
          display: flex;
          gap: 10px;
          border-top: 1px solid #1A1A1D;
        }
        .input {
          flex: 1;
          background: #1A1A1D;
          border: none;
          padding: 12px 20px;
          border-radius: 25px;
          color: #F5F5F7;
          font-size: 16px;
        }
        .send-btn {
          width: 45px;
          height: 45px;
          background: #FF7979;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <span class="back">←</span>
        <div class="avatar"></div>
        <div class="header-info">
          <div class="name">Sarah</div>
          <div class="status">Online</div>
        </div>
        <span style="color: #F5F5F7;">📞</span>
        <span style="color: #F5F5F7;">📹</span>
      </div>
      <div class="messages">
        <div class="message received">
          <div class="bubble">Hey! How's your day going? 😊</div>
        </div>
        <div class="message sent">
          <div class="bubble">Hi Sarah! It's been great, just finished a workout. How about you?</div>
        </div>
        <div class="message received">
          <div class="bubble">Nice! I love staying active too. Just got back from hiking!</div>
        </div>
        <div class="message sent">
          <div class="bubble">That sounds amazing! Where did you go?</div>
        </div>
        <div class="message received">
          <div class="bubble">Trail Ridge Road, the views were incredible! 🏔️</div>
        </div>
      </div>
      <div class="input-area">
        <input type="text" class="input" placeholder="Type a message...">
        <div class="send-btn">➤</div>
      </div>
    </body>
    </html>
  `;

  // Profile Screen HTML
  const profileHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #0A0A0B;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #F5F5F7;
        }
        .header {
          background: linear-gradient(135deg, #FF7979 0%, #FF6B6B 100%);
          padding: 40px 20px 80px;
          position: relative;
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .title { font-size: 24px; font-weight: bold; color: white; }
        .settings { color: white; font-size: 24px; }
        .profile-pic {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          border: 4px solid white;
          position: absolute;
          bottom: -60px;
          left: 50%;
          transform: translateX(-50%);
        }
        .content {
          padding: 80px 20px 20px;
        }
        .name {
          text-align: center;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .age {
          text-align: center;
          color: #888;
          margin-bottom: 20px;
        }
        .premium-badge {
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #0A0A0B;
          padding: 8px 20px;
          border-radius: 20px;
          text-align: center;
          width: fit-content;
          margin: 0 auto 30px;
          font-weight: bold;
        }
        .stats {
          display: flex;
          justify-content: space-around;
          padding: 20px 0;
          border-bottom: 1px solid #1A1A1D;
          margin-bottom: 30px;
        }
        .stat {
          text-align: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #FF7979;
        }
        .stat-label {
          color: #888;
          font-size: 14px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .bio {
          color: #888;
          line-height: 1.6;
        }
        .interests {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .interest {
          background: #1A1A1D;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
        }
        .edit-btn {
          background: #FF7979;
          color: white;
          padding: 15px;
          border-radius: 12px;
          text-align: center;
          font-weight: bold;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-top">
          <div class="title">Profile</div>
          <div class="settings">⚙️</div>
        </div>
        <div class="profile-pic"></div>
      </div>
      <div class="content">
        <div class="name">Alex Johnson</div>
        <div class="age">28 years old</div>
        <div class="premium-badge">✨ PREMIUM MEMBER</div>
        
        <div class="stats">
          <div class="stat">
            <div class="stat-value">156</div>
            <div class="stat-label">Matches</div>
          </div>
          <div class="stat">
            <div class="stat-value">89%</div>
            <div class="stat-label">Compatibility</div>
          </div>
          <div class="stat">
            <div class="stat-value">4.8</div>
            <div class="stat-label">Rating</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">About Me</div>
          <div class="bio">Passionate about life and always seeking new adventures. Love hiking, photography, and deep conversations over coffee. Looking for someone genuine to share life's beautiful moments.</div>
        </div>
        
        <div class="section">
          <div class="section-title">Interests</div>
          <div class="interests">
            <div class="interest">🎵 Music</div>
            <div class="interest">📚 Reading</div>
            <div class="interest">✈️ Travel</div>
            <div class="interest">🍳 Cooking</div>
            <div class="interest">🏃 Fitness</div>
            <div class="interest">📷 Photography</div>
          </div>
        </div>
        
        <div class="edit-btn">Edit Profile</div>
      </div>
    </body>
    </html>
  `;

  // Discover Screen HTML
  const discoverHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #0A0A0B;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #F5F5F7;
        }
        .header {
          background: #151517;
          padding: 20px;
          border-bottom: 1px solid #1A1A1D;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          color: #FF7979;
          margin-bottom: 20px;
        }
        .search {
          background: #1A1A1D;
          border: none;
          padding: 12px 20px;
          border-radius: 25px;
          color: #F5F5F7;
          width: 100%;
          font-size: 16px;
        }
        .filters {
          padding: 15px 20px;
          display: flex;
          gap: 10px;
          overflow-x: auto;
          background: #151517;
        }
        .filter {
          background: #1A1A1D;
          padding: 8px 16px;
          border-radius: 20px;
          white-space: nowrap;
          font-size: 14px;
        }
        .filter.active {
          background: #FF7979;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          padding: 20px;
        }
        .card {
          background: #151517;
          border-radius: 15px;
          overflow: hidden;
          position: relative;
        }
        .card-image {
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card-info {
          padding: 12px;
        }
        .card-name {
          font-weight: bold;
          margin-bottom: 4px;
        }
        .card-detail {
          color: #888;
          font-size: 14px;
        }
        .online-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 12px;
          height: 12px;
          background: #44D884;
          border: 2px solid #151517;
          border-radius: 50%;
        }
        .premium-tag {
          position: absolute;
          top: 10px;
          left: 10px;
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #0A0A0B;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Discover</div>
        <input type="text" class="search" placeholder="Search by interests...">
      </div>
      <div class="filters">
        <div class="filter active">All</div>
        <div class="filter">Online</div>
        <div class="filter">New</div>
        <div class="filter">Nearby</div>
        <div class="filter">Premium</div>
        <div class="filter">Verified</div>
      </div>
      <div class="grid">
        <div class="card">
          <div class="premium-tag">PREMIUM</div>
          <div class="online-badge"></div>
          <div class="card-image"></div>
          <div class="card-info">
            <div class="card-name">Emma, 26</div>
            <div class="card-detail">2 miles away</div>
          </div>
        </div>
        <div class="card">
          <div class="online-badge"></div>
          <div class="card-image" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"></div>
          <div class="card-info">
            <div class="card-name">Sophia, 24</div>
            <div class="card-detail">5 miles away</div>
          </div>
        </div>
        <div class="card">
          <div class="card-image" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);"></div>
          <div class="card-info">
            <div class="card-name">Olivia, 27</div>
            <div class="card-detail">8 miles away</div>
          </div>
        </div>
        <div class="card">
          <div class="premium-tag">PREMIUM</div>
          <div class="card-image" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);"></div>
          <div class="card-info">
            <div class="card-name">Isabella, 25</div>
            <div class="card-detail">3 miles away</div>
          </div>
        </div>
        <div class="card">
          <div class="online-badge"></div>
          <div class="card-image" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);"></div>
          <div class="card-info">
            <div class="card-name">Ava, 29</div>
            <div class="card-detail">6 miles away</div>
          </div>
        </div>
        <div class="card">
          <div class="card-image" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);"></div>
          <div class="card-info">
            <div class="card-name">Mia, 23</div>
            <div class="card-detail">10 miles away</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Logo HTML
  const logoHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: white;
        }
        .logo-container {
          width: 300px;
          height: 300px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #FF7979 0%, #FF6B6B 100%);
          border-radius: 60px;
          box-shadow: 0 20px 60px rgba(255, 121, 121, 0.3);
        }
        .logo-text {
          color: white;
          font-size: 72px;
          font-weight: bold;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          letter-spacing: -2px;
        }
        .heart {
          color: white;
          font-size: 48px;
          margin-left: 10px;
        }
      </style>
    </head>
    <body>
      <div class="logo-container">
        <div class="logo-text">P<span class="heart">♥</span></div>
      </div>
    </body>
    </html>
  `;

  // Capture Swipe Screen
  await page.setContent(swipeHTML);
  await page.screenshot({ path: path.join(screenshotsDir, 'swipe.png') });
  console.log('✅ Captured Swipe Screen');

  // Capture Chat Screen
  await page.setContent(chatHTML);
  await page.screenshot({ path: path.join(screenshotsDir, 'chat.png') });
  console.log('✅ Captured Chat Screen');

  // Capture Profile Screen
  await page.setContent(profileHTML);
  await page.screenshot({ path: path.join(screenshotsDir, 'profile.png') });
  console.log('✅ Captured Profile Screen');

  // Capture Discover Screen
  await page.setContent(discoverHTML);
  await page.screenshot({ path: path.join(screenshotsDir, 'discover.png') });
  console.log('✅ Captured Discover Screen');

  // Capture Logo with smaller viewport
  await page.setViewportSize({ width: 300, height: 300 });
  await page.setContent(logoHTML);
  await page.screenshot({ path: path.join(screenshotsDir, 'logo.png') });
  console.log('✅ Captured Logo');

  await browser.close();
  console.log('\n🎉 All screenshots captured successfully!');
  console.log(`📁 Screenshots saved in: ${screenshotsDir}`);
}

captureScreenshots().catch(console.error);