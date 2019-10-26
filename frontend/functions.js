"use strict";

const { remote } = require("electron");
const app = remote.app;
const win = remote.getCurrentWindow();
const StoreManagement = require("../backend/StoreManagement");
const store = new StoreManagement();


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
	document.getElementById("versionNumber").innerText = remote.app.getVersion();
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
 * We call functions from StoreManagement, ProfileManagement, LibraryManagement, CommunityManagement
 * to load data that's available on database.
 */
function renderPages()
{

}