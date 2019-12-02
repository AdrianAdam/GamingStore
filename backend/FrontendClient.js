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
}

module.exports = FrontendClient;