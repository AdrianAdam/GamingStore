"use strict";


class FrontendEndpoint {
	constructor()
	{
	}


	/**
	 * @param {string} strResponse 
	 */
	sendResponseToLoginForm(strResponse)
	{
		if(strResponse === document.getElementById("loginEmail").value)
		{
			document.getElementById("loginStatusText").innerHTML = "Succesfully logged in";
			document.getElementById("loginStatusText").style.color = "green";
	
			setTimeout(function() {
				window.remote.getCurrentWindow().close();
			}, 1.5 * 1000);
		}
		else
		{
			document.getElementById("loginStatusText").innerHTML = strResponse;
			document.getElementById("loginStatusText").style.color = "red";
		}
	}


	/**
	 * @param {string} strResponse 
	 */
	sendResponseToRegisterForm(strResponse)
	{
		if(strResponse === document.getElementById("registerEmail").value)
		{
			document.getElementById("registerStatusText").innerHTML = "Succesfully created account";
			document.getElementById("registerStatusText").style.color = "green";
	
			setTimeout(function() {
				window.remote.getCurrentWindow().close();
			}, 1.5 * 1000);
		}
		else
		{
			document.getElementById("registerStatusText").innerHTML = strResponse;
			document.getElementById("registerStatusText").style.color = "red";
		}
	}
}

module.exports = FrontendEndpoint;