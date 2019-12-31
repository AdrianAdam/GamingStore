"use strict";

const { remote } = require("electron");
const YTPlayer = require("yt-player");
const BrowserWindow = remote.BrowserWindow;
const app = remote.app;
const win = remote.getCurrentWindow();
const BackendClient = require("./BackendClient");
const backendClient = new BackendClient();
let twitchPlayer;
let youtubePlayer;

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
	const objSteamOwnedGames = await backendClient.getSteamOwnedGames();
	const objGamesDetails = await backendClient.getGamesDetails(objSteamOwnedGames);

	const elGamesDiv = document.getElementById("gamesList");
	elGamesDiv.style.marginTop = "10px";
	elGamesDiv.style.height = "800px";
	elGamesDiv.style.width = "210px";
	elGamesDiv.style.overflowY = "scroll";

	let bFirstGame = true;

	for(let i = 0; i < objSteamOwnedGames.response.games.length; i++)
	{
		// Creates list of games
		const elAnchorListGames = document.createElement("a");
		if(objInstalledGames[objSteamOwnedGames.response.games[i].name])
		{
			elAnchorListGames.classList = "btn btn-success";
		}
		else
		{
			elAnchorListGames.classList = "btn btn-primary";
		}
		elAnchorListGames.style.textAlign = "left";
		elAnchorListGames.style.marginBottom = "10px";
		elAnchorListGames.style.width = "90%";
		elAnchorListGames.style.overflow = "hidden";
		elAnchorListGames.addEventListener(
			"click",
			(() => {
				const arrGamesDetails = document.getElementsByClassName("game");

				for(let j = 0; j < arrGamesDetails.length; j++)
				{
					if(arrGamesDetails[j].id === objSteamOwnedGames.response.games[i].name)
					{
						arrGamesDetails[j].style.display = "";
					}
					else
					{
						arrGamesDetails[j].style.display = "none";
					}
				}
			})
		);

		const elSpan = document.createElement("span");
		elSpan.innerHTML = objSteamOwnedGames.response.games[i].name;

		elAnchorListGames.appendChild(elSpan);
		elGamesDiv.appendChild(elAnchorListGames);
		elGamesDiv.appendChild(document.createElement("br"));

		// Creates game details page
		const elGameDetailsDiv = document.getElementById("gameDetails");
		elGameDetailsDiv.style.height = "800px";
		elGameDetailsDiv.style.marginTop = "10px";
		elGameDetailsDiv.style.overflowY = "auto";

		const elTitle = document.createElement("h3");
		elTitle.innerHTML = objSteamOwnedGames.response.games[i].name;

		const elDivGameDetails = document.createElement("div");
		elDivGameDetails.classList = "game";
		elDivGameDetails.id = objSteamOwnedGames.response.games[i].name;

		if(bFirstGame)
		{
			bFirstGame = false;
		}
		else
		{
			elDivGameDetails.style.display = "none";
		}

		const elAnchorGameDetails = document.createElement("a");
		if(objInstalledGames[objSteamOwnedGames.response.games[i].name])
		{
			elAnchorGameDetails.innerHTML = "Launch game";
			elAnchorGameDetails.classList = "btn btn-success";
			elAnchorGameDetails.addEventListener(
				"click",
				(async() => {
					await launchGame(objInstalledGames[objSteamOwnedGames.response.games[i].name]);
				})
			);
		}
		else
		{
			elAnchorGameDetails.innerHTML = "Install game";
			elAnchorGameDetails.classList = "btn btn-primary";
		}

		elDivGameDetails.appendChild(elTitle);
		elDivGameDetails.appendChild(document.createElement("br"));
		elDivGameDetails.appendChild(elAnchorGameDetails);
		elDivGameDetails.appendChild(document.createElement("br"));
		elDivGameDetails.appendChild(document.createElement("br"));

		const nAppID = objSteamOwnedGames.response.games[i].appid;
		if(objGamesDetails[nAppID])
		{
			const elImgGame = document.createElement("img");
			elImgGame.src = objGamesDetails[nAppID].header_image;
			elImgGame.style.width = "800px";
			elImgGame.style.height = "400px";
			elImgGame.style.marginLeft = "auto";
			elImgGame.style.marginRight = "auto";
			elImgGame.style.display = "block";
			elDivGameDetails.appendChild(elImgGame);
			elDivGameDetails.appendChild(document.createElement("br"));
			elDivGameDetails.appendChild(document.createElement("br"));

			const elDescriptionSpan = document.createElement("span");
			elDescriptionSpan.innerHTML = objGamesDetails[nAppID].detailed_description;
			elDivGameDetails.appendChild(elDescriptionSpan);
			elDivGameDetails.appendChild(document.createElement("br"));
			elDivGameDetails.appendChild(document.createElement("br"));

			const elCategoriesSpan = document.createElement("span");
			const arrCategories = [];
			for(let j = 0; j < objGamesDetails[nAppID].categories.length; j++)
			{
				arrCategories.push(objGamesDetails[nAppID].categories[j].description);
			}
			elCategoriesSpan.appendChild(document.createTextNode("Categories: " + arrCategories.join(", ")));
			elDivGameDetails.appendChild(elCategoriesSpan);
			elDivGameDetails.appendChild(document.createElement("br"));
			elDivGameDetails.appendChild(document.createElement("br"));

			const elDevelopersSpan = document.createElement("span"); 
			elDevelopersSpan.appendChild(document.createTextNode("Publisher: " + objGamesDetails[nAppID].publishers.toString()));
			elDivGameDetails.appendChild(elDevelopersSpan);
			elDivGameDetails.appendChild(document.createElement("br"));
			elDivGameDetails.appendChild(document.createElement("br"));

			const elReleaseDateSpan = document.createElement("span");
			elReleaseDateSpan.appendChild(document.createTextNode("Release date: " + objGamesDetails[nAppID].release_date.date));
			elDivGameDetails.appendChild(elReleaseDateSpan);
			elDivGameDetails.appendChild(document.createElement("br"));
			elDivGameDetails.appendChild(document.createElement("br"));

			if(objGamesDetails[nAppID].price_overview)
			{
				const elPriceSpan = document.createElement("span");
				elPriceSpan.appendChild(document.createTextNode("Price: " + objGamesDetails[nAppID].price_overview.final_formatted));
				elDivGameDetails.appendChild(elPriceSpan);
				elDivGameDetails.appendChild(document.createElement("br"));
				elDivGameDetails.appendChild(document.createElement("br"));
			}

			const elSupportedLanguages = document.createElement("span");
			elSupportedLanguages.innerHTML = "Languages: " + objGamesDetails[nAppID].supported_languages;
			elDivGameDetails.appendChild(elSupportedLanguages);
			elDivGameDetails.appendChild(document.createElement("br"));
			elDivGameDetails.appendChild(document.createElement("br"));

			const elPCRequirements = document.createElement("span");
			elPCRequirements.innerHTML = "PC requirements: " + objGamesDetails[nAppID].pc_requirements.minimum;
			elDivGameDetails.appendChild(elPCRequirements);
			elDivGameDetails.appendChild(document.createElement("br"));
			elDivGameDetails.appendChild(document.createElement("br"));
		}

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
	elCommunityPosts.style.marginBottom = "70px";

	const elCreatePostDiv = document.createElement("div");
	const elPostTextArea = document.createElement("textarea");
	const elPostSubmitDiv = document.createElement("div");

	elCreatePostDiv.style.width = "30%";
	elCreatePostDiv.style.marginRight = "20px";
	elCreatePostDiv.style.cssFloat = "left";
	elCreatePostDiv.style.height = "160px";
	elCreatePostDiv.style.backgroundColor = "black";
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
	elSavePostButton.style.marginLeft = "5px";
	elCancelButton.classList = "btn btn-danger btn-xs";
	elCancelButton.style.cssFloat = "right";
	elCancelPostSpan.classList = "glyphicon glyphicon-floppy-remove";
	elCancelButton.style.marginRight = "5px";

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
			if(elPost.post.length > 230)
			{
				elPostDiv.style.overflowY = "scroll";
			}
			elPostDiv.style.backgroundColor = "black";
			elTextSpan.style.width = "100%";
			elTextSpan.style.marginLeft = "5px";
			elTextSpan.style.marginRight = "5px";

			const arrLink = elPost.post.match(/\s{0,}[a-z]+:\/\/[a-z\.]+\/[A-Za-z0-9?=]+(\/[0-9]+)?/gm);
			let nLinkIndex = 0;
			if(arrLink)
			{
				let arrSplitPost;
				if(elPost.post.match(/\s{0,}[a-z]+:\/\/[a-z\.]+\/[A-Za-z0-9?=]+\/[0-9]+/gm))
				{
					arrSplitPost = elPost.post.split(/\s{0,}[a-z]+:\/\/[a-z\.]+\/[A-Za-z0-9?=]+\/[0-9]+/gm);
				}
				else
				{
					arrSplitPost = elPost.post.split(/\s{0,}[a-z]+:\/\/[a-z\.]+\/[A-Za-z0-9?=]+/gm);
				}
				for(let strPartialPost of arrSplitPost)
				{
					const strLink = arrLink[nLinkIndex];
					const elAnchor = document.createElement("a");
					elAnchor.appendChild(document.createTextNode(strLink));
					elAnchor.classList = "btn";
					elAnchor.addEventListener(
						"click",
						() => {
							if(strLink.match(/\s{0,}[a-z]+:\/\/www\.twitch\.tv\/[A-Za-z0-9?=]+\/[0-9]+/gm))
							{
								const arrTwitchSplit = strLink.split("/");
								const strTwitchVideoID = arrTwitchSplit[arrTwitchSplit.length - 1];
								if(twitchPlayer)
								{
									twitchPlayer.setVideo(strTwitchVideoID);
								}
								else
								{
									twitchPlayer = new Twitch.Player("socialMediaTwitch", { width: 720, height: 480, video: strTwitchVideoID });
									twitchPlayer.setVolume(0.5);
								}
							}
							else 
							{
								if(strLink.match(/\s{0,}[a-z]+:\/\/www\.twitch\.tv\/[A-Za-z0-9?=]+/gm))
								{
									const arrTwitchSplit = strLink.split("/");
									const strChannelName = arrTwitchSplit[arrTwitchSplit.length - 1];
									if(twitchPlayer)
									{
										twitchPlayer.setChannel(strChannelName);
									}
									else
									{
										twitchPlayer = new Twitch.Player("socialMediaTwitch", { width: 720, height: 480, channel: strChannelName });
										twitchPlayer.setVolume(0.5);
									}
								}
								else if(strLink.match(/\s{0,}[a-z]+:\/\/www\.youtube\.com\/[A-Za-z0-9?=]+/gm))
								{
									const arrYoutbeSplit = strLink.split("/");
									const strYoutubeVideoID = arrYoutbeSplit[arrYoutbeSplit.length - 1].split("=")[1];
									if(youtubePlayer)
									{
										youtubePlayer.load(strYoutubeVideoID, /* bAutoplay */ true);
									}
									else
									{
										youtubePlayer = new YTPlayer("#socialMediaYoutube", { width: 720, height: 480 });
										youtubePlayer.load(strYoutubeVideoID, /* bAutoplay */ true);
										youtubePlayer.setVolume(50);
									}
								}
							}
						}
					);

					if(typeof arrLink[nLinkIndex] !== "undefined")
					{
						if(strPartialPost !== "")
						{
							elTextSpan.appendChild(document.createTextNode(strPartialPost));
						}

						elTextSpan.appendChild(elAnchor);
					}
					else
					{
						elTextSpan.appendChild(document.createTextNode(strPartialPost));
					}


					nLinkIndex++;
				}
			}
			else
			{
				elTextSpan.appendChild(document.createTextNode(elPost.post));
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

			if(document.getElementById("userDisplayName") && elPost.username === document.getElementById("userDisplayName").textContent)
			{
				const elDeleteButton = document.createElement("a");
				elDeleteButton.style.marginTop = "10px";
				elDeleteButton.style.cssFloat = "right";
				elDeleteButton.style.marginRight = "5px";
				elDeleteButton.classList = "btn btn-danger btn-xs";
				const elDeleteSpan = document.createElement("span");
				elDeleteSpan.classList = "glyphicon glyphicon-trash";
				elDeleteButton.appendChild(elDeleteSpan);
				elDeleteButton.appendChild(document.createTextNode(" Delete post"));

				elDeleteButton.addEventListener(
					"click",
					async () => {
						await backendClient.deletePost(elPost.key);
					}
				);

				elPostDiv.appendChild(elDeleteButton);
			}

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