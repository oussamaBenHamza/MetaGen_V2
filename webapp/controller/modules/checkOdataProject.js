sap.ui.define([], function () {
	"use strict";

	var Module = {
		enableDisablePropTab: function (oBeloean) {

			var aPropsTableItems = this.getView().byId("table").getItems();
			this.getView().byId("table").getHeaderToolbar().setEnabled(oBeloean);
			var sLineItemCells = aPropsTableItems[0].getCells();
			sLineItemCells.forEach(function (cell) {
				cell.setEnabled(oBeloean);
			});

		},
		enablePropertyTable: function () {
			var aPropsTableItems = this.getView().byId("table").getItems();
			this.getView().byId("table").getHeaderToolbar().setEnabled(true);
			var sLineItemCells = aPropsTableItems[0].getCells();
			sLineItemCells.forEach(function (cell) {
				cell.setEnabled(true);
			});
		},
		checkSrvName: function () {
			var checkMsg = "";
			var checkMsgType = "";
			var sSrvName = this.getView().byId("SerName").getValue();
			if (sSrvName === "Z" || sSrvName === "") {
				if (sSrvName === "") {
					sSrvName = "emtpy";
				}
				this.getView().byId("SerName").setValueState("Error");
				this.getView().byId("errBt").setVisible(true);
				checkMsgType = "Error";
				checkMsg = "Project Name cannot be '" + sSrvName + "'";
				this.getView().byId("successMsg").setVisible(false);
			} else {
				this.getView().byId("SerName").setValueState("None");
				checkMsgType = "Success";
				checkMsg = "Project '" + sSrvName + "' has been checked; no errors were found";
				// this.getView().byId("errBt").setVisible(false);
				// this.getView().byId("successMsg").setVisible(true);
				// this.getView().byId("successMsg").setText(checkMsg);
			}
			var returnMsg = {
				type: checkMsgType,
				title: checkMsg,
				description: "",
				subtitle: ""
			};
			return returnMsg;
		},
		checkEntities: function () {
			var entitiesChecks = [];
			if (this.bSaved) {
				entitiesChecks = this.checkOdata.checkEntitiesFromTree.apply(this);
			}
			/*else {
				this.checkOdata.checkEntitiesFromWizard.apply(this);
			}*/
			return entitiesChecks;
		},
		checkEntitiesFromTree: function () {
			var that = this;
			var EntitiesErorrs = [];
			this.EntitiesWithErrors = [];
			var entityErors = [];
			var aEntities = this.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes;
			aEntities.forEach(function (entityType) {
				entityErors = that.checkOdata.checkEntityFromTree.apply(that, [entityType]);
				entityErors.forEach(function (oError) {
					EntitiesErorrs.push(oError);
				});

			});
			this.checkOdata.HighLightEntitiesWithErrors.apply(this, [this.EntitiesWithErrors]);
			return EntitiesErorrs;
		},
		HighLightEntitiesWithErrors: function (aErrors) {
			var oProjectTree = this.getView().byId("Tree").getItems();
			oProjectTree.forEach(function (oItem, index) {
				$("Li[id*=Tree-" + index + "]").removeClass("HighlighError");
			});
			oProjectTree.forEach(function (oItem, index) {
				if (aErrors.find(element => element === oItem.getProperty("title"))) {
					$("Li[id*=Tree-" + index + "]").addClass("HighlighError");
				}
			});
		},
		checkEntityFromTree: function (oEntityType) {
			var oProjectTree = this.getView().byId("Tree").getItems();

			var that = this;
			var aErrors = [];
			var sEntityName = oEntityType.text;
			oProjectTree.forEach(function (oItem, index) {
				$("Li[id*=Tree-" + index + "]").removeClass("HighlighError");
			});
			var oProperties = oEntityType.nodes[0].nodes;
			if (oProperties.length === 0) {
				aErrors.push({
					type: "Error",
					title: "Entity Type '" + sEntityName + "' must define at least one key property",
					description: "",
					subtitle: ""
				});
			} else {
				/*Unicity Check*/
				that.checkOdata.chechEntityPropsUnicity(oProperties, sEntityName).forEach(function (oError) {
					aErrors.push(oError);
				});
				/*Key  Check*/
				that.checkOdata.checkEntityHasAtLeastOneKey(oProperties, sEntityName).forEach(function (oError) {
					aErrors.push(oError);
				});
				/*Type Check*/
				that.checkOdata.checkPropsTypes(oProperties, sEntityName).forEach(function (oError) {
					aErrors.push(oError);
				});
				/*Type Check*/
				that.checkOdata.checkPropsPrec(oProperties, sEntityName).forEach(function (oError) {
					aErrors.push(oError);
				});
			}
			if (aErrors.length > 0) {
				this.EntitiesWithErrors.push(sEntityName);
				// oProjectTree.forEach(function (oItem, index) {
				// 	if (oItem.getProperty("title") === sEntityName) {
				// 		$("Li[id*=Tree-" + index + "]").addClass("HighlighError");
				// 	}
				// });
			}

			return aErrors;
		},
		chechEntityPropsUnicity: function (oProps, sEntityName) {
			var that = this;
			var aUnicityPropsErrors = [];
			oProps.forEach(function (oProp, index) {
				if (that.isNotUnique(oProp, oProps)) {
					aUnicityPropsErrors.push({
						type: "Error",
						title: "Property name '" + oProp.text + "' not unique",
						description: "Entity '" +
							sEntityName + "' : Property name '" + oProp.text + "' not unique",
						subtitle: ""
					});
				}
			});
			return aUnicityPropsErrors;
		},
		isNotUnique: function (oProp, oProps) {
			var bNotUnique = false;
			var aPropFound = 0;
			for (var i = 0; i < oProps.length; i++) {
				if (oProps[i].text === oProp.text) {
					aPropFound++;
					if (aPropFound === 2) {
						bNotUnique = true;
						break;
					}
				}
			}
			return bNotUnique;
		},
		checkEntityHasAtLeastOneKey: function (oProps, sEntityName) {
			var keyError = [];
			var hasKey = false;
			for (var i = 0; i < oProps.length; i++) {
				if (oProps[i].isKey) {
					hasKey = true;
					break;
				}
			}
			if (!hasKey) {
				keyError.push({
					type: "Error",
					title: "Entity Type '" + sEntityName + "' must define at least one key property",
					description: "",
					subtitle: ""
				});
			}
			return keyError;
		},
		checkPropsTypes: function (oProps, sEntityName) {
			var that = this;
			var aTypesErrors = [];
			oProps.forEach(function (oProp) {
				if (!that.isPropType(oProp.type)) {
					aTypesErrors.push({
						type: "Error",
						title: "Property '" + oProp.text + "' must define a type",
						description: "",
						subtitle: ""
					});
				}
			});
			return aTypesErrors;
		},
		isPropType: function (sPropType) {
			if (sPropType !== "Binary" && sPropType !== "Boolean" && sPropType !== "Byte" && sPropType !== "DateTime" &&
				sPropType !== "DateTimeOffset" && sPropType !== "Decimal" && sPropType !== "Double" && sPropType !== "Float" &&
				sPropType !== "Guid" && sPropType !== "Int16" && sPropType !== "Int32" && sPropType !== "Int64" &&
				sPropType !== "SByte" && sPropType !== "Single" && sPropType !== "String" && sPropType !== "Time") {
				return false;
			} else {
				return true;
			}

		},
		checkPropsPrec: function (oProps, sEntityName) {
			var aTypesErrors = [];
			oProps.forEach(function (oProp) {
				var sType = oProp.type;
				if (oProp.prec !== "" && (sType === "DateTime" || sType === "DateTimeOffset" || sType === "Decimal" || sType === "Time")) {
					aTypesErrors.push({
						type: "Error",
						title: "Model binding",
						description: "Valid type mapping; not precise, but best possible",
						subtitle: ""
					});
				}
			});
			return aTypesErrors;
		},
		checkPropsUnicity: function () {
			var oPropsTable = this.getView().byId("")
		},
		checkAssociations: function () {
			var associcationsErrors = [];
			var associationNameState = this.getView().byId("assName").getValueState();
			var principalEntityState = this.getView().byId("prinEntity").getValueState();
			var secEntityState = this.getView().byId("secSetName").getValueState();
			var principalCardState = this.getView().byId("cardinal").getValueState();
			var secCardState = this.getView().byId("cardinal2").getValueState();

			this.getView().byId("refConst").getItems().forEach(function (oItem) {
				if (oItem.getCells()[1].getValueState() === "Error" || oItem.getCells()[3].getValueState() === "Error") {
					associcationsErrors.push({
						type: "Warning",
						title: "Association Errors"
					});
				}
			});

			if (associationNameState === "Error" || principalEntityState === "Error" || secEntityState === "Error" || principalCardState ===
				"Error" || secCardState === "Error") {
				associcationsErrors.push({
					type: "Warning",
					title: "Association Errors"
				});
			}
			return associcationsErrors;
		}
	};
	return Module;
});