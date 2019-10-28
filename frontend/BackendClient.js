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
}

module.exports = BackendClient;