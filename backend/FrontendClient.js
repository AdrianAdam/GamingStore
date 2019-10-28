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
	sendResponseToLoginForm(strResponse)
	{
		frontendEndpoint.sendResponseToLoginForm(strResponse);
	}


	/**
	 * @param {string} strResponse 
	 */
	sendResponseToRegisterForm(strResponse)
	{
		frontendEndpoint.sendResponseToRegisterForm(strResponse);
	}
}

module.exports = FrontendClient;