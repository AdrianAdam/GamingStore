"use strict";

class DBManagement {

	constructor()
	{
		if(!!DBManagement.instance)
		{
			return DBManagement.instance;
		}

		DBManagement.instance = this;

		return this;
	}


	getData()
	{

	}


	updateData()
	{

	}


	deleteData()
	{

	}
}

module.exports = DBManagement;