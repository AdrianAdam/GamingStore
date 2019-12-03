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
	 * @param {string} strUsername
	 */
	async createUserAccount(strEmail, strPassword, strUsername)
	{
		await firebase.auth().createUserWithEmailAndPassword(strEmail, strPassword)
			.then((value) => {
				value.user.updateProfile({
					displayName: strUsername
				});

				frontendClient.sendResponseToRegisterForm(value.user.email);

				firebase.database().ref("users/" + strUsername).set({
					username: strUsername
				});
			})
			.catch((error) => {
				console.error(error.message);
				frontendClient.sendResponseToRegisterForm(error.message);
		});
	}


	/**
	 * Sign in a user with email and password
	 * 
	 * @param {string} strEmail 
	 * @param {string} strPassword 
	 */
	async signIn(strEmail, strPassword)
	{
		await firebase.auth().signInWithEmailAndPassword(strEmail, strPassword)
			.then((value) => {
				frontendClient.sendResponseToLoginForm(value.user.email);
			})
			.catch((error) => {
				console.error(error.message);
				frontendClient.sendResponseToLoginForm(error.message);
		});
	}


	/**
	 * Used to logout the user.
	 */
	async logoutUser()
	{
		await firebase.auth().signOut()
			.catch((error) => {
				console.error(error.message);
			})
	}


	/**
	 * Returns a list of all registered users;
	 * 
	 * @returns {string[]}
	 */
	async retrieveUsers()
	{
		const arrUsers = [];
		await firebase.database().ref("users/").once("value").then((snapshot) => {
			snapshot.forEach((item) => {
				arrUsers.push(item.val().username);
			})
		});

		return arrUsers;
	}


	/**
	 * Verifies if the user is logged in.
	 * 
	 * @returns {string}
	 */
	async checkLoginStatus()
	{
		const user = await firebase.auth().currentUser;

		if(user)
		{
			return user.displayName;
		}
		else
		{
			return "";
		}
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
		let bHadError = false;
		let strErrorMessage = "";
		const user = await firebase.auth().currentUser;

		const strNewPostKey = firebase.database().ref("friends/").child(user.displayName).push().key;
		await firebase.database().ref("friends/").child(user.displayName + "/" + strNewPostKey).update({ username: strFriendUsername }, (error) => {
			if(error)
			{
				console.error(error);
				bHadError = true;
				strErrorMessage = error.message;
			}
		});

		if(!bHadError)
		{
			return "Success";
		}
		else
		{
			return strErrorMessage;
		}
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
		let bHadError = false;
		let strErrorMessage = "";
		const user = await firebase.auth().currentUser;

		await firebase.database().ref("friends/" + user.displayName).once("value").then((snapshot) => {
			snapshot.forEach((item) => {
				if(item.val().username === strFriendUsername)
				{
					firebase.database().ref("friends/" + user.displayName).child(item.key).remove()
						.catch((error) => {
							bHadError = true;
							strErrorMessage = error.message;
					});
				}
			})
		});

		if(!bHadError)
		{
			return "Success";
		}
		else
		{
			return strErrorMessage;
		}
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
		let bFound = false;
		const user = await firebase.auth().currentUser;

		await firebase.database().ref("friends/" + user.displayName).once("value").then((snapshot) => {
			snapshot.forEach((item) => {
				if(item.val().username === strFriendUsername)
				{
					bFound = true;
				}
			})
		});

		return bFound;
	}
}

module.exports = DBManagement;