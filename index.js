"use strict";

const { app, BrowserWindow } = require("electron");

let win;

function createWindow () {
	win = new BrowserWindow({
		width: 1920,
		height: 1080,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: true,
			allowRunningInsecureContent: false
		}
	});

	win.setMenuBarVisibility(false);
	win.setAutoHideMenuBar(true);

	win.loadFile("frontend/index.html");

	win.on("closed", () => {
		win = null;
	});
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
	if(process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if(win === null) {
		createWindow();
	}
});
