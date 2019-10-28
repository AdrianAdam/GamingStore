"use strict";

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
	 */
	async login(strEmail, strPassword)
	{
		await DB.signIn(strEmail, strPassword);
	}


	/**
	 * Makes sure the user didn't try a SQL injection.
	 * 
	 * @param {string} strEmail 
	 * @param {string} strPassword 
	 */
	async createAccount(strEmail, strPassword)
	{
		await DB.createUserAccount(strEmail, strPassword);
	}


	async logoutCurrentUser()
	{
		await DB.logoutUser();
	}
}

module.exports = BackendEndpoint;