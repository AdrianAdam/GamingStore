"use strict";

const FrontendEndpoint = require("../frontend/FrontendEndpoint");
const frontendEndpoint = new FrontendEndpoint();

class FrontendClient {
	constructor()
	{
	}


	/**
	 * @param {string} strResponse 
	 */
	async sendResponseToLoginForm(strResponse)
	{
		frontendEndpoint.sendResponseToLoginForm(strResponse);
	}


	/**
	 * @param {string} strResponse 
	 */
	async sendResponseToRegisterForm(strResponse)
	{
		frontendEndpoint.sendResponseToRegisterForm(strResponse);
	}


	/**
	 * Update the community page with new posts.
	 * 
	 * @param {string} arrPosts 
	 */
	async updateCommunityPosts(arrPosts)
	{
		frontendEndpoint.updateCommunityPosts(arrPosts);
	}


	/**
	 * Update the friends list
	 * 
	 * @param {array} arrFriends 
	 */
	async updateFriendsList(arrFriends)
	{
		frontendEndpoint.updateFriendsList(arrFriends);
	}
}

module.exports = FrontendClient;
