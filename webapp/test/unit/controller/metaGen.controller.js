/*global QUnit*/

sap.ui.define([
	"metaGen/obh/MetaGen/controller/metaGen.controller"
], function (Controller) {
	"use strict";

	QUnit.module("metaGen Controller");

	QUnit.test("I should test the metaGen controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});