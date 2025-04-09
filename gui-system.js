const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let POLLING_INTERVAL = 500;
let splash;
let mainWindow;

app.setName('Unigraph');

function createWindow() { // Make the splash screen
  splash = new BrowserWindow({
    width: 300,
    height: 100,
    frame: true,
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
