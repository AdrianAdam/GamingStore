"use strict";

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const child_process = require("child_process");
const DBManagement = require("./DBManagement");
const DB = new DBManagement();

class BackendEndpoint {
	constructor()
	{
	}


	/**
	 * Makes sure the user didn't try a SQL injection.
	 * 
	 * @param {string} strEmail 
	 * @param {string} strPassword 
	 * @param {string} strUsername
	 */
	async login(strEmail, strPassword, strUsername)
	{
		await DB.signIn(strEmail, strPassword, strUsername);
	}


	/**
	 * Makes sure the user didn't try a SQL injection.
	 * 
	 * @param {string} strEmail 
	 * @param {string} strPassword 
	 * @param {string} strUsername
	 */
	async createAccount(strEmail, strPassword, strUsername)
	{
		await DB.createUserAccount(strEmail, strPassword, strUsername);
	}


	/**
	 * Used to logout the user.
	 */
	async logoutCurrentUser()
	{
		await DB.logoutUser();
	}


	/**
	 * Searches for games in some paths.
	 * 
	 * @returns {object}
	 */
	async getInstalledGames()
	{
		const strPath = "/home/adrianadam/.steam/steam/steamapps/common";

		const arrDirectories = fs.readdirSync(strPath);

		let objPathsOfGames = {};

		for(let i = 0; i < arrDirectories.length; i++)
		{
			const currentPath = strPath + "/" + arrDirectories[i];
			const arrDirContents = fs.readdirSync(currentPath);

			for(let j = 0; j < arrDirContents.length; j++)
			{
				if(arrDirContents[j].endsWith(".bin.x86_64") || arrDirContents[j].endsWith(".x86_64"))
				{
					objPathsOfGames[arrDirectories[i]] = path.normalize(currentPath + "/" + arrDirContents[j]);
				}
			}
		}

		return objPathsOfGames;
	}


	/**
	 * Launches the currently selected game.
	 * 
	 * @param {string} strPath 
	 */
	async launchGame(strPath)
	{
		// child_process.exec doesn't work for paths with spaces in them. Spawn is a safer alternative that accepts spaces in paths.
		child_process.spawn(`${strPath}`);
	}


	/**
	 * Returns a list of all registered users;
	 * 
	 * @returns {string[]}
	 */
	async retrieveUsers()
	{
		return await DB.retrieveUsers();
	}


	/**
	 * Verifies if the user is logged in.
	 * 
	 * @returns {string}
	 */
	async checkLoginStatus()
	{
		return await DB.checkLoginStatus();
	}


	/**
	 * Adds a person to the friends list.
	 * 
	 * @param {string} strFriendUsername
	 * 
	 * @returns {string}
	 */
	async addFriend(strFriendUsername)
	{
		return await DB.addFriend(strFriendUsername);
	}


	/**
	 * Removes a friend from the friends list.
	 * 
	 * @param {string} strFriendUsername 
	 * 
	 * @returns {string}
	 */
	async removeFriend(strFriendUsername)
	{
		return await DB.removeFriend(strFriendUsername);
	}


	/**
	 * Checks if the current user is friend with strFriendUsername.
	 * 
	 * @param {string} strFriendUsername 
	 * 
	 * @returns {bool}
	 */
	async checkIfFriend(strFriendUsername)
	{
		return await DB.checkIfFriend(strFriendUsername);
	}


	/**
	 * Create a new post for the current user.
	 * 
	 * @param {string} strPostText 
	 */
	async createNewPost(strPostText)
	{
		return await DB.createNewPost(strPostText);
	}


	/**
	 * Watches the database for changes on posts.
	 */
	async watchCommunityPosts()
	{
		return await DB.watchCommunityPosts();
	}


	/**
	 * Deletes a post for the current user.
	 * 
	 * @param {string} strKey 
	 */
	async deletePost(strKey)
	{
		return await DB.deletePost(strKey);
	}


	/**
	 * Get all owned games from Steam.
	 * 
	 * @returns {Array}
	 */
	async getSteamOwnedGames()
	{
		// Steam blocks access to API after multiple requests in a given time. As a workaround, we will store the data in a json file.
		// This file can be updated after a given amount of time (for example, 24 hours), but we will leave it as it is.
		if(fs.existsSync("ownedGames.json"))
		{
			const data = fs.readFileSync("ownedGames.json", "utf-8")
			return JSON.parse(data);
		}
		else
		{
			const response = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${fs.readFileSync("privateSteamAPIKey.json", "utf-8").replace(/\s/g,"")}&include_appinfo=true&steamid=${fs.readFileSync("privateSteamUserID.json", "utf-8").replace(/\s/g,"")}&format=json`);
			const json = await response.json();
			fs.writeFileSync("ownedGames.json", JSON.stringify(json), "utf-8");
			return json;
		}
	}


	/**
	 * Get details for owned games.
	 * 
	 * @param {object} objSteamOwnedGames 
	 * 
	 * @returns {object} nAppID => objGameDetail
	 */
	async getGamesDetails(objSteamOwnedGames)
	{
		const objAppIDToGameDetail = {};

		// Steam blocks access to API after multiple requests in a given time. As a workaround, we will store the data in a json file.
		// Calling Steam store API for each game can take a lot of time. Even for 200+ games it will take several minutes. In case this 
		// file needs to be updated, only update certain games. DON'T update everything because the Library page won't load until this 
		// function finishes. Also, after 200 requests in less than 5 minutes, you are temporarily banned from making requests for 5 minutes.
		if(fs.existsSync("ownedGamesDetails.json"))
		{
			const data = fs.readFileSync("ownedGamesDetails.json", "utf-8")
			return JSON.parse(data);
		}
		else
		{
			for(let i = 0; i < objSteamOwnedGames.response.games.length; i++)
			{
				let nAppID = objSteamOwnedGames.response.games[i].appid;
				const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${nAppID}`);
				const json = await response.json();
				objAppIDToGameDetail[nAppID] = json[nAppID].data;
			}

			fs.writeFileSync("ownedGamesDetails.json", JSON.stringify(objAppIDToGameDetail), "utf-8");

			return objAppIDToGameDetail;
		}
	}
}

module.exports = BackendEndpoint;