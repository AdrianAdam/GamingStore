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
	 */
	async createAccount(strEmail, strPassword)
	{
		await backendEndpoint.createAccount(strEmail, strPassword);
	}


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
}

module.exports = BackendClient;