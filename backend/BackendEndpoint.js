"use strict";

const fs = require("fs");
const path = require("path");
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
				if(arrDirContents[j].endsWith(".bin.x86_64"))
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
		child_process.exec(strPath);
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
}

module.exports = BackendEndpoint;