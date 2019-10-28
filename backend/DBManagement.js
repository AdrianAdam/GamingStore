"use strict";

const FrontendClient = require("./FrontendClient");
const frontendClient = new FrontendClient();
const firebase = require("firebase/app");
const database = require("firebase/database");
const auth = require("firebase/auth");
const fs = require("fs");

class DBManagement {

	constructor()
	{
		if(!!DBManagement.instance)
		{
			return DBManagement.instance;
		}

		const objJSON = fs.readFileSync("./privateInfo.json");
		const objFirebaseConfig = JSON.parse(objJSON);

		firebase.initializeApp(objFirebaseConfig);
		firebase.database();
		firebase.auth();

		DBManagement.instance = this;

		return this;
	}


	/**
	 * Creates a Firebase account with email and password.
	 * 
	 * @param {string} strEmail 
	 * @param {string} strPassword 
	 * 
	 * @returns {string}
	 */
	async createUserAccount(strEmail, strPassword)
	{
		await firebase.auth().createUserWithEmailAndPassword(strEmail, strPassword)
			.then((value) => {
				frontendClient.sendResponseToRegisterForm(value.user.email);
			})
			.catch((error) => {
				console.error(error.code);
				console.error(error.message);
				frontendClient.sendResponseToRegisterForm(error.message);
		});
	}


	/**
	 * Sign in a user with email and password
	 * 
	 * @param {string} strEmail 
	 * @param {string} strPassword 
	 * 
	 * @returns {string}
	 */
	async signIn(strEmail, strPassword)
	{
		await firebase.auth().signInWithEmailAndPassword(strEmail, strPassword)
			.then((value) => {
				frontendClient.sendResponseToLoginForm(value.user.email);
			})
			.catch((error) => {
				console.error(error.code);
				console.error(error.message);
				frontendClient.sendResponseToLoginForm(error.message);
		});
	}


	async logoutUser()
	{
		await firebase.auth().signOut()
			.then(() => {
				frontendClient.currentUserChanged(false);
			})
			.catch((error) => {
				console.error(error.code);
				console.error(error.message);
			})
	}


	getAllGames()
	{

	}



	getUserGames()
	{

	}


	updateUserGames()
	{

	}


	deleteUserAccount()
	{

	}
}

module.exports = DBManagement;