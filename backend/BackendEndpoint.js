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
}

module.exports = BackendEndpoint;