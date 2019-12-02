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
		document.getElementById("loginPass").value,
	);
}


async function register()
{
	await backendClient.createAccount(
		document.getElementById("registerEmail").value,
		document.getElementById("registerPass").value,
		document.getElementById("registerUsername").value
	);
}


async function logout()
{
	await backendClient.logoutCurrentUser();
}


async function generateLibraryPage()
{
	const objInstalledGames = await backendClient.getInstalledGames();

	const elGamesDiv = document.getElementById("gamesList");
	const elGameDetailsDiv = document.getElementById("gameDetails");

	let bFirstGame = true;

	for(let strKey in objInstalledGames)
	{
		// Creates list of games
		const elAnchorListGames = document.createElement("a");
		elAnchorListGames.classList = "btn btn-primary";
		elAnchorListGames.style.width = "100%";
		elAnchorListGames.style.textAlign = "left";
		elAnchorListGames.addEventListener(
			"click",
			(() => {
				const arrGamesDetails = document.getElementsByClassName("game");

				for(let i = 0; i < arrGamesDetails.length; i++)
				{
					if(arrGamesDetails[i].id === strKey)
					{
						arrGamesDetails[i].style.display = "?";
					}
					else
					{
						arrGamesDetails[i].style.display = "none";
					}
				}
			})
		);

		const elSpan = document.createElement("span");
		elSpan.innerHTML = strKey;

		const elDivListGames = document.createElement("div");

		elAnchorListGames.appendChild(elSpan);
		elDivListGames.appendChild(elAnchorListGames);
		elGamesDiv.appendChild(elDivListGames);
		elGamesDiv.appendChild(document.createElement("br"));

		// Creates game details page
		const elTitle = document.createElement("h3");
		elTitle.innerHTML = strKey;

		const elDivGameDetails = document.createElement("div");
		elDivGameDetails.classList = "game";
		elDivGameDetails.id = strKey;

		if(!bFirstGame)
		{
			elDivGameDetails.style.display = "none";
		}

		const elAnchorGameDetails = document.createElement("a");
		elAnchorGameDetails.innerHTML = "Launch game";
		elAnchorGameDetails.classList = "btn btn-primary";
		elAnchorGameDetails.addEventListener(
			"click",
			(async() => {
				await launchGame(objInstalledGames[strKey]);
			})
		)

		const elParagraph = document.createElement("p");
		elParagraph.innerHTML = "here will be game details";

		elDivGameDetails.appendChild(elTitle);
		elDivGameDetails.appendChild(document.createElement("br"));
		elDivGameDetails.appendChild(elAnchorGameDetails);
		elDivGameDetails.appendChild(document.createElement("br"));
		elDivGameDetails.appendChild(document.createElement("br"));
		elDivGameDetails.appendChild(elParagraph);

		elGameDetailsDiv.appendChild(elDivGameDetails);
	}
}


/**
 * Launches the currently selected game.
 * 
 * @param {string} strPath 
 */
async function launchGame(strPath)
{
	await backendClient.launchGame(strPath);
}


/**
 * Adds all users to an autocomplete input.
 */
async function autocompleteCommunitySearch()
{
	const elDatalist = document.getElementById("datalistAllUsers");
	const arrUsernames = await backendClient.retrieveUsers();

	for(let i = 0; i < arrUsernames.length; i++)
	{
		const elOption = document.createElement("option");
		elOption.setAttribute("value", arrUsernames[i]);
		elDatalist.appendChild(elOption);
	}
}


/**
 * Verifies if the user is logged in.
 */
async function checkLoginStatus()
{
	setInterval(async () => {
		const strResponse = await backendClient.checkLoginStatus();

		if(strResponse && strResponse !== "")
		{
			document.getElementById("userDisplayName").textContent = strResponse;
			document.getElementById("loginButton").style.display = "none";
			document.getElementById("accountButton").style.display = "";
			document.getElementById("logoutButton").style.display = "";
		}
		else
		{
			document.getElementById("loginButton").style.display = "";
			document.getElementById("accountButton").style.display = "none";
			document.getElementById("logoutButton").style.display = "none";
		}
	}, 5 * 1000);
}


async function initializeFriendsFunctions()
{
	const elInputSearchFriend = document.getElementById("searchFriend");
	elInputSearchFriend.addEventListener(
		"change",
		() => { 
			if(elInputSearchFriend.value)
			{
				document.getElementById("searchedFriendSpan").textContent = elInputSearchFriend.value;
				document.getElementById("searchedFriend").style.display = "";
			}
			else
			{
				document.getElementById("searchedFriend").style.display = "none";
			}
	});

	document.getElementById("addSearchedFriend").addEventListener(
		"click",
		async () => {
			const strResponse = await backendClient.addFriend(document.getElementById("searchedFriendSpan").textContent);
			alert(strResponse);
		}
	);

	document.getElementById("removeSearchedFriend").addEventListener(
		"click",
		async () => {
			const strResponse = await backendClient.removeFriend(document.getElementById("searchedFriendSpan").textContent);
			alert(strResponse);
		}
	);
}