"use strict";

const BackendEndpoint = require("../backend/BackendEndpoint");
const backendEndpoint = new BackendEndpoint();

class BackendClient {
	constructor()
	{
	}


	/**
	 * @param {string} strEmail 
	 * @param {string} strPassword 
	 */
	async login(strEmail, strPassword)
	{
		await backendEndpoint.login(strEmail, strPassword);
	}


	/**
	 * @param {string} strEmail 
	 * @param {string} strPassword 
	 * @param {string} strUsername
	 */
	async createAccount(strEmail, strPassword, strUsername)
	{
		await backendEndpoint.createAccount(strEmail, strPassword, strUsername);
	}


	/**
	 * Used to logout the user.
	 */
	async logoutCurrentUser()
	{
		await backendEndpoint.logoutCurrentUser();
	}


	/**
	 * Searches for games in some paths.
	 * 
	 * @returns {object}
	 */
	async getInstalledGames()
	{
		return await backendEndpoint.getInstalledGames();
	}


	/**
	 * Launches the currently selected game.
	 * 
	 * @param {string} strPath 
	 */
	async launchGame(strPath)
	{
		await backendEndpoint.launchGame(strPath);
	}


	/**
	 * Returns a list of all registered users;
	 * 
	 * @returns {string[]}
	 */
	async retrieveUsers()
	{
		return await backendEndpoint.retrieveUsers();
	}


	/**
	 * Verifies if the user is logged in.
	 * 
	 * @returns {string}
	 */
	async checkLoginStatus()
	{
		return await backendEndpoint.checkLoginStatus();
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
		return await backendEndpoint.addFriend(strFriendUsername);
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
		return await backendEndpoint.removeFriend(strFriendUsername);
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
		return await backendEndpoint.checkIfFriend(strFriendUsername);
	}


	/**
	 * Create a new post for the current user.
	 * 
	 * @param {string} strPostText 
	 */
	async createNewPost(strPostText)
	{
		return await backendEndpoint.createNewPost(strPostText);
	}


	/**
	 * Watches the database for changes on posts.
	 */
	async watchCommunityPosts()
	{
		return await backendEndpoint.watchCommunityPosts();
	}


	/**
	 * Deletes a post for the current user.
	 * 
	 * @param {string} strKey 
	 */
	async deletePost(strKey)
	{
		return await backendEndpoint.deletePost(strKey);
	}


	/**
	 * Get all owned games from Steam.
	 * 
	 * @returns {Array}
	 */
	async getSteamOwnedGames()
	{
		return await backendEndpoint.getSteamOwnedGames();
	}


	/**
	 * Get details for owned games.
	 * 
	 * @param {object} objSteamOwnedGames 
	 * 
	 * @returns {object} nAppID => strGameDetail
	 */
	async getGamesDetails(objSteamOwnedGames)
	{
		return await backendEndpoint.getGamesDetails(objSteamOwnedGames);
	}
}

module.exports = BackendClient;