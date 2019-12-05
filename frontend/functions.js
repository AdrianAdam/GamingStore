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
	setTimeout(async () => {
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
	}, 1 * 1000);
}


async function initializeFriendsFunctions()
{
	const elInputSearchFriend = document.getElementById("searchFriend");
	elInputSearchFriend.addEventListener(
		"change",
		async () => { 
			if(elInputSearchFriend.value)
			{
				document.getElementById("searchedFriendSpan").textContent = elInputSearchFriend.value;
				document.getElementById("searchedFriend").style.display = "";

				const elUsernameSpan = document.getElementById("userDisplayName");
				if(elUsernameSpan)
				{
					if(elUsernameSpan.textContent === elInputSearchFriend.value)
					{
						document.getElementById("addSearchedFriend").disabled = true;
						document.getElementById("removeSearchedFriend").disabled = true;
					}
					else
					{
						const bResponse = await backendClient.checkIfFriend(elInputSearchFriend.value);
						if(bResponse)
						{
							document.getElementById("addSearchedFriend").disabled = true;
							document.getElementById("removeSearchedFriend").disabled = false;
						}
						else
						{
							document.getElementById("addSearchedFriend").disabled = false;
							document.getElementById("removeSearchedFriend").disabled = true;
						}
					}
				}
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

			document.getElementById("addSearchedFriend").disabled = true;
			document.getElementById("removeSearchedFriend").disabled = false;

			alert(strResponse);
		}
	);

	document.getElementById("removeSearchedFriend").addEventListener(
		"click",
		async () => {
			const strResponse = await backendClient.removeFriend(document.getElementById("searchedFriendSpan").textContent);

			document.getElementById("addSearchedFriend").disabled = false;
			document.getElementById("removeSearchedFriend").disabled = true;

			alert(strResponse);
		}
	);
}


/**
 * Displays all posts created by your friends.
 * 
 * @param {Array<Object<string, string>>} arrPosts
 */
async function displayCommunityPosts(arrPosts=undefined)
{
	const elCommunityPosts = document.getElementById("communityPosts");
	elCommunityPosts.innerHTML = "";

	const elCreatePostDiv = document.createElement("div");
	const elPostTextArea = document.createElement("textarea");
	const elPostSubmitDiv = document.createElement("div");

	elCreatePostDiv.style.width = "30%";
	elCreatePostDiv.style.marginRight = "20px";
	elCreatePostDiv.style.cssFloat = "left";
	elCreatePostDiv.style.height = "160px";
	elPostTextArea.setAttribute("type", "text");
	elPostTextArea.style.color = "black";
	elPostTextArea.style.height = "130px";
	elPostTextArea.style.width = "100%";
	elPostTextArea.style.overflowY = "scroll";

	const elSavePostButton = document.createElement("a");
	const elSavePostSpan = document.createElement("span");
	const elCancelButton = document.createElement("a");
	const elCancelPostSpan = document.createElement("span");
	elSavePostButton.classList = "btn btn-success btn-xs";
	elSavePostSpan.classList = "glyphicon glyphicon-floppy-saved";
	elCancelButton.classList = "btn btn-danger btn-xs";
	elCancelButton.style.cssFloat = "right";
	elCancelPostSpan.classList = "glyphicon glyphicon-floppy-remove";

	elSavePostButton.addEventListener(
		"click",
		async () => {
			await backendClient.createNewPost(elPostTextArea.value);
			elPostTextArea.value = "";
		}
	);
	elCancelButton.addEventListener(
		"click",
		async () => {
			elPostTextArea.value = "";
		}
	);

	elCancelButton.appendChild(elCancelPostSpan);
	elCancelButton.appendChild(document.createTextNode(" Cancel"));
	elSavePostButton.appendChild(elSavePostSpan);
	elSavePostButton.appendChild(document.createTextNode(" Save"));
	elPostSubmitDiv.appendChild(elSavePostButton);
	elPostSubmitDiv.appendChild(elCancelButton);
	elCreatePostDiv.appendChild(elPostTextArea);
	elCreatePostDiv.appendChild(elPostSubmitDiv);

	elCommunityPosts.appendChild(elCreatePostDiv);

	if(typeof arrPosts !== "undefined")
	{
		let nPostIndex = 0;
		for(let elPost of arrPosts)
		{
			const elPostDiv = document.createElement("div");
			const elTextSpan= document.createElement("span");

			if(nPostIndex >= 2)
			{
				elPostDiv.style.marginTop = "20px";
			}
			elPostDiv.style.width = "30%";
			elPostDiv.style.cssFloat = "left";
			elPostDiv.style.marginRight = "20px";
			elPostDiv.style.height = "160px";
			elPostDiv.style.backgroundColor = "grey";
			elPostDiv.style.overflowY = "scroll";
			elTextSpan.style.width = "100%";
			elTextSpan.style.marginLeft = "5px";
			elTextSpan.style.marginRight = "5px";

			const elLink = elPost.post.match(/\s{0,}[a-z]+:\/\/[a-z\.]+\/[A-Za-z0-9?=]+/gm);
			let nLinkIndex = 0;
			if(elLink)
			{
				const arrSplitPost = elPost.post.split(/\s{0,}[a-z]+:\/\/[a-z\.]+\/[A-Za-z0-9?=]+/gm)
				for(let strPartialPost of arrSplitPost)
				{
					if(strPartialPost !== "")
					{
						const elAnchor = document.createElement("a");
						if(typeof elLink[nLinkIndex] !== "undefined")
						{
							elAnchor.appendChild(document.createTextNode(elLink[nLinkIndex]));
							elAnchor.classList = "btn";
	
							elTextSpan.appendChild(document.createTextNode(strPartialPost));
							elTextSpan.appendChild(elAnchor);
						}
						else
						{
							elTextSpan.appendChild(document.createTextNode(strPartialPost));
						}

						nLinkIndex++;
					}
					else
					{
						if(strPartialPost === "" && typeof elLink[nLinkIndex] !== "undefined")
						{
							const elAnchor = document.createElement("a");
							elAnchor.appendChild(document.createTextNode(elLink[nLinkIndex]));
							elAnchor.classList = "btn";

							elTextSpan.appendChild(elAnchor);

							nLinkIndex++;
						}
					}
				}
			}
			elPostDiv.appendChild(elTextSpan);

			const elDetailDiv = document.createElement("div");
			elDetailDiv.style.marginTop = "20px";
			elDetailDiv.style.marginLeft = "5px";
			elDetailDiv.style.marginRight = "5px";
			const elNameSpan = document.createElement("span");
			const elTimeSpan = document.createElement("span");
			elTimeSpan.style.cssFloat = "right";

			elNameSpan.appendChild(document.createTextNode(elPost.username));
			elTimeSpan.appendChild(document.createTextNode(elPost.time));

			elDetailDiv.appendChild(elNameSpan);
			elDetailDiv.appendChild(elTimeSpan);

			elPostDiv.appendChild(elDetailDiv);
			elCommunityPosts.appendChild(elPostDiv);

			nPostIndex++;
		}
	}
}


/**
 * Starts the watcher for posts.
 */
async function setCommunityPostsWatcher()
{
	await backendClient.watchCommunityPosts();
}