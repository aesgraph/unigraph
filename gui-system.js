const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const http = require('http');

const mainWindowUrl = 'http://localhost:3000';
const yellowSystemPrint = '\x1b[35mGUI SYSTEM:\x1b[0m';
const unableToLoadHtml = '<h1 style="color:red;">Could not load app.</h1>';
const POLLING_INTERVAL = 1000;
const WINDOW_URL_TIMEOUT = 3000;
const WINDOW_URL_POLLING_INTERVAL = 500;
let splash;
let mainWindow;

function waitForMainSystemUrl(urlChecking) { // Handle the main window url to ensure it's loaded at the right time
  return new Promise(function(resolve, reject) {
    const start = Date.now();

    const check = () => {
      const requesting = http.get(urlChecking, function() {
        resolve();
      });

      requesting.on('error', function() {
        if (Date.now() - start > WINDOW_URL_TIMEOUT) {
          reject(new Error('timed out waiting for main window'));
        } else {
          setTimeout(check, WINDOW_URL_POLLING_INTERVAL);
        }
      });
    };

    check();
  });
}

app.setName('Unigraph');

function createWindow() { // Make the splash screen
  splash = new BrowserWindow({
    width: 300,
    height: 90,
    frame: true,
    resizable: false,
    transparent: false,
    alwaysOnTop: true
  });

  splash.loadFile(path.join(__dirname, 'splash.html')); // Load the splash screen
  Menu.setApplicationMenu(null);

  const template = [ // Custom menu
    {
      label: 'Unigraph',
      submenu: [
        {
          label: 'Quit Unigraph',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q', // Add keyboard shortcut to exit
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle DevTools',
          accelerator: process.platform === 'darwin' ? 'Cmd+Alt+I' : 'Ctrl+Shift+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.openDevTools();
            }
          }
        }
      ]
    }
  ];

  if (process.platform === 'win32' || process.platform === 'linux') { // For windows and linux use File label
    template[0].label = 'File';
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow = new BrowserWindow({ // Make the main window
    title: "Unigraph",
    width: 1200,
    height: 800,
    backgroundColor: '#000',
    show: true,
    webPreferences: {
      contextIsolation: true
    },
  });

  waitForMainSystemUrl(mainWindowUrl).then(() => {
    mainWindow.loadURL(mainWindowUrl);
  }).catch(err => {
    console.log(`${yellowSystemPrint} server not ready on time: ${err}`);
    mainWindow.loadURL(`data:text/html, ${encodeURIComponent(unableToLoadHtml)}`);
  });

  mainWindow.webContents.setMaxListeners(30);

  const checkDomLoaded = setInterval(() => { // Check for dom loaded and then remove the splash
    mainWindow.webContents.executeJavaScript('window.isDomLoaded')
      .then(isDomLoaded => {
        console.log(`${yellowSystemPrint} polling dom was: ${isDomLoaded}`);

        if (isDomLoaded) {
          clearInterval(checkDomLoaded);
          console.log(`${yellowSystemPrint} dom is loaded`);
          if (splash && !splash.isDestroyed()) {
            splash.close(); // Exit the splash screen
          }

        } else {
          console.log(`${yellowSystemPrint} dom not loaded yet`);
            mainWindow.reload();
        }
      })
      .catch(error => {
        console.log(`${yellowSystemPrint} error checking dom: ${error}`);
      });
  }, POLLING_INTERVAL);
}

app.whenReady().then(() => {
  createWindow();

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
});
