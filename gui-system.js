const { app, BrowserWindow } = require('electron');
const path = require('path');

let POLLING_INTERVAL = 500;
let splash;
let mainWindow;

function createWindow() { // Make the splash screen
  splash = new BrowserWindow({
    width: 300,
    height: 100,
    frame: true,
    transparent: false,
    alwaysOnTop: true
  });

  splash.loadFile(path.join(__dirname, 'splash.html')); // Load the splash screen


  mainWindow = new BrowserWindow({ // Make the main window
    width: 1200,
    height: 800,
    backgroundColor: '#000',
    show: true,
    webPreferences: {
      contextIsolation: true
    },
  });

  mainWindow.loadURL('http://localhost:3000');


  const checkDomLoaded = setInterval(() => { // Check for dom loaded and then remove the splash
    mainWindow.webContents.executeJavaScript('window.isDomLoaded')
      .then(isDomLoaded => {
        console.log('Polling dom loaded:', isDomLoaded);

        if (isDomLoaded) {
          clearInterval(checkDomLoaded);
          console.log('Dom is loaded');
          if (splash && !splash.isDestroyed()) {
            splash.close(); // Exit the splash screen
          }

        } else {
            console.log('DOM not loaded yet...');
            mainWindow.reload();
        }
      })
      .catch(error => {
        console.error('Error checking DOM loaded:', error);
      });
  }, POLLING_INTERVAL);
}

app.whenReady().then(() => {
  createWindow();

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
});
