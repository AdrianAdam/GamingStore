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

		if(user)
		{
			const strNewPostKey = firebase.database().ref("friends/").child(user.displayName).push().key;
			await firebase.database().ref("friends/").child(user.displayName + "/" + strNewPostKey).update({ username: strFriendUsername }, (error) => {
				if(error)
				{
					console.error(error);
					bHadError = true;
					strErrorMessage = error.message;
				}
			});
		}

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

		if(user)
		{
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
		}

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

		if(user)
		{
			await firebase.database().ref("friends/" + user.displayName).once("value").then((snapshot) => {
				snapshot.forEach((item) => {
					if(item.val().username === strFriendUsername)
					{
						bFound = true;
					}
				})
			});
		}

		return bFound;
	}


	/**
	 * Create a new post for the current user.
	 * 
	 * @param {string} strPostText 
	 */
	async createNewPost(strPostText)
	{
		const user = await firebase.auth().currentUser;

		if(user)
		{
			const objTime = new Date();
			const strFullTime = objTime.getFullYear() + "-" + (objTime.getMonth() + 1) + "-" + objTime.getDate() + " "
				+ objTime.getHours() + ":" + objTime.getMinutes() + ":" + objTime.getSeconds();
	
			const strNewPostKey = firebase.database().ref("posts/").child(user.displayName).push().key;
			await firebase.database().ref("posts/").child(user.displayName + "/" + strNewPostKey).update({ username: user.displayName, post: strPostText, time: strFullTime }, (error) => {
				if(error)
				{
					console.error(error);
				}
			});
		}
	}


	/**
	 * Watches the database for changes on posts.
	 */
	async watchCommunityPosts()
	{
		const user = await firebase.auth().currentUser;

		if(user)
		{
			const watcherDB = await firebase.database().ref(`posts/${user.displayName}`);
			watcherDB.on(
				"value",
				(snapshot) => {
					const arrPosts = [];
	
					snapshot.forEach((item) => {
						const arrPost = { username: item.val().username, post: item.val().post, time: item.val().time };
						arrPosts.push(arrPost);
					});
	
					frontendClient.updateCommunityPosts(arrPosts);
				}
			);
		}
	}
}

module.exports = DBManagement;