"use strict";

const { remote } = require("electron");
const BrowserWindow = remote.BrowserWindow;
const app = remote.app;
const win = remote.getCurrentWindow();
const BackendClient = require("./BackendClient");
const backendClient = new BackendClient();

window.remote = remote; 
let secondWindow = null;


function quitApp()
{
	if(process.platform !== "darwin") {
		app.quit();
	}
}


function openConsole()
{
	win.webContents.openDevTools();
}


function updateVersionNumber()
{
	document.getElementById("versionNumber").innerText = window.remote.app.getVersion();
}


/**
 * Changes current page.
 * 
 * @param {string} strPageName 
 */
function goToPage(strPageName)
{
	const objPages = document.getElementsByClassName("pages");

	for(let i = 0; i < objPages.length; i++)
	{
		objPages[i].style.display = "none";
	}

	document.getElementsByClassName(strPageName)[0].style.display = "block";
}


/**
 * Opens a new BrowserWindow based on file "login.html"
 */
function createLoginPage()
{
	secondWindow = new BrowserWindow({
		width: 640,
		height: 320,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: true,
			allowRunningInsecureContent: false
		}
	});
	secondWindow.webContents.openDevTools();
	secondWindow.setMenuBarVisibility(false);
	secondWindow.setAutoHideMenuBar(true);

	secondWindow.loadFile("frontend/login.html");

	secondWindow.on("closed", () => {
		secondWindow = null;
	});
}


async function login()
{
	await backendClient.login(
		document.getElementById("loginEmail").value,
		document.getElementById("loginPass").value
	);
}


async function register()
{
	await backendClient.createAccount(
		document.getElementById("registerEmail").value,
		document.getElementById("registerPass").value
	);
}


async function logout()
{
	await backendClient.logoutCurrentUser();
}
