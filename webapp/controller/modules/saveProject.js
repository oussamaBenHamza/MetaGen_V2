sap.ui.define(["sap/m/MessageToast"], function (MessageToast) {
	"use strict";

	var Module = {
		createProject: function (sProjectName) {
			this.getView().byId("SerName").setEnabled(false);
			this.getView().byId("Tree").getModel().getData()[0].text = this.getView().byId("SerName").getValue();
			this.getView().byId("Tree").getModel().refresh();
			return true;
		},
		createEntityType: function (sEntityTypeName) {
			var entityNameIntree = {
				text: sEntityTypeName,
				"ref": "sap-icon://table-row",
				nodes: [{
					text: "Properties",
					"ref": "sap-icon://folder-blank",
					nodes: []
				}]
			};
			if (this.bCreateNavigation) {
				this.saveProject.createNavigationProps.apply(this);
			}
			var entityTypes = this.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes;
			var exsit = entityTypes.find(element => element.text === sEntityTypeName);
			if (!exsit) {
				this.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes.push(entityNameIntree);
				this.getView().byId("Tree").getModel().refresh();
			}
			return true;
		},
		createEntitySet: function (sEntitySetName) {
			var sEntityTypeName = this.getView().byId("EntityName").getValue();
			var entitySetNameIntree = {
				text: sEntitySetName,
				"ref": "sap-icon://table-row",
				entityName: sEntityTypeName
			};
			var entitySets = this.getView().byId("Tree").getModel().getData()[0].nodes[2].nodes;
			var entitySetexsit = entitySets.find(element => element.text === sEntitySetName);
			if (!entitySetexsit) {
				this.getView().byId("Tree").getModel().getData()[0].nodes[2].nodes.push(entitySetNameIntree);
				this.getView().byId("Tree").getModel().refresh();
			}
			return true;
		},
		saveProperties: function () {
			var that = this;
			var sEntityTypeName = this.getView().byId("EntityName").getValue();
			var sEntitySetName = this.getView().byId("entitySetName").getValue();
			var aAllEntityTypes = that.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes;
			var newEntityIndex = 0;
			aAllEntityTypes.forEach(function (sEntityType, index) {
				if (sEntityType.text === sEntityTypeName) {
					newEntityIndex = index;
				}
			});

			var oProperties = this.oPropertiesTable.getItems();
			this.opropsInTree = [];
			if (oProperties.length > 0) {
				if (that.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes[newEntityIndex]) {
					that.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes[newEntityIndex].nodes[0].nodes = [];
					oProperties.forEach(function (item) {
						var isEmpty = that.itemIsEmpty(item.getCells());
						if (!isEmpty) {
							var oProp = {
								text: item.getCells()[0].getValue(),
								isKey: item.getCells()[1].getSelected(),
								type: item.getCells()[2].getSelectedKey(),
								prec: item.getCells()[3].getValue(),
								scale: item.getCells()[4].getValue(),
								maxLenght: item.getCells()[5].getValue(),
								creatable: item.getCells()[6].getSelected(),
								updatable: item.getCells()[7].getSelected(),
								sortable: item.getCells()[8].getSelected(),
								nullable: item.getCells()[9].getSelected(),
								filltrable: item.getCells()[10].getSelected(),
								label: item.getCells()[11].getValue()
							};
							if (item.getCells()[1].getSelected()) {
								oProp.ref = "sap-icon://primary-key";
							}
							that.opropsInTree.push(oProp);
						}
					});
					if (that.opropsInTree.length > 0) {
						that.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes[newEntityIndex].nodes[0].ref = "sap-icon://folder";
					}
					for (var i = 0; i < that.opropsInTree.length; i++) {
						that.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes[newEntityIndex].nodes[0].nodes.push(that.opropsInTree[i]);
					}
				}
			}
			that.getView().byId("Tree").getModel().refresh();
		},
		createAssociation: function () {
			var that = this;
			var sAssName = this.getView().byId("assName").getValue();
			var principalEntity = this.getView().byId("prinEntity").getValue();
			var principalCardinlaty = this.getView().byId("cardinal").getSelectedKey();
			var secondaryEntity = this.getView().byId("secSetName").getValue();
			var secondaryCardinlaty = this.getView().byId("cardinal2").getSelectedKey();

			if (sAssName === "") {
				MessageToast.show("Enter Association name.");
				this.getView().byId("assName").setValueState("Error");
				return false;
			} else
			if (principalEntity === "") {
				this.getView().byId("assName").setValueState("None");
				this.getView().byId("prinEntity").setValueState("Error");
				MessageToast.show("Enter the Entity Type name for Principal Entity.");

				return false;
			} else
			if (!principalCardinlaty) {
				this.getView().byId("assName").setValueState("None");
				this.getView().byId("prinEntity").setValueState("None");
				this.getView().byId("cardinal").setValueState("Error");
				MessageToast.show("Enter the Cardinality for Principal Entity.");
				return false;
			} else
			if (secondaryEntity === "") {
				this.getView().byId("assName").setValueState("None");
				this.getView().byId("prinEntity").setValueState("None");
				this.getView().byId("cardinal").setValueState("None");
				this.getView().byId("secSetName").setValueState("Error");
				MessageToast.show("Enter the Entity Type name for Dependent Entity.");
				return false;
			} else
			if (!secondaryCardinlaty) {
				this.getView().byId("assName").setValueState("None");
				this.getView().byId("prinEntity").setValueState("None");
				this.getView().byId("cardinal").setValueState("None");
				this.getView().byId("secSetName").setValueState("None");
				this.getView().byId("cardinal2").setValueState("Error");
				MessageToast.show("Enter the Cardinality for Dependent Entity.");
				return false;
			} else {
				this.getView().byId("assName").setValueState("None");
				this.getView().byId("prinEntity").setValueState("None");
				this.getView().byId("cardinal").setValueState("None");
				this.getView().byId("secSetName").setValueState("None");
				this.getView().byId("cardinal2").setValueState("None");
				var allAssociationsName = this.getView().byId("Tree").getModel().getData()[0].nodes[1].nodes;

				var referentialConstraintsPrimKeys = [];
				this.getView().byId("refConst").getItems().forEach(function (oItem) {

					// that.saveProject.saveRefConstraints(oItem,principalEntity,secondaryEntity);

					if (oItem.getCells()[3].getValue() !== "") {
						oItem.getCells()[3].setValueState("None");
						referentialConstraintsPrimKeys.push({
							text: oItem.getCells()[1].getValue(),
							"ref": "sap-icon://chain-link",
							principalEntity: principalEntity,
							secondaryEntity: secondaryEntity,
							dependentKey: oItem.getCells()[3].getValue()
						});
					} else {
						oItem.getCells()[3].setValueState("Error");
					}
					if (oItem.getCells()[1].getValue() === "") {
						oItem.getCells()[1].setValueState("Error");
					} else {
						oItem.getCells()[1].setValueState("None");
					}

				});
				if (referentialConstraintsPrimKeys.length > 0 && referentialConstraintsPrimKeys.length === this.getView().byId("refConst").getItems()
					.length) {
					that.dependentError = false;
					var oAssociation = {
						text: sAssName,
						"ref": "sap-icon://chain-link",
						principalEntity: principalEntity,
						principalCardinlaty: principalCardinlaty,
						secondaryEntity: secondaryEntity,
						secondaryCardinlaty: secondaryCardinlaty,
						nodes: [{
							text: "Referential Constraints",
							"ref": "sap-icon://folder",
							nodes: referentialConstraintsPrimKeys
						}]
					};
					var exist = allAssociationsName.findIndex(element => element.text === sAssName);
					if (exist < 0) {
						this.getView().byId("navPropsTableTbar").setEnabled(true);
						this.getView().byId("Tree").getModel().getData()[0].nodes[1].nodes.push(oAssociation);
						this.getView().byId("Tree").getModel().refresh();
						that.saveProject.enableNavigPropsCreation.apply(that);
						return true;

					} else {
						this.getView().byId("navPropsTableTbar").setEnabled(true);
						this.getView().byId("Tree").getModel().getData()[0].nodes[1].nodes[exist] = oAssociation;
						this.getView().byId("Tree").getModel().refresh();
						that.saveProject.enableNavigPropsCreation.apply(that);
						return true;
					}
				} else if (referentialConstraintsPrimKeys.length < this.getView().byId("refConst").getItems().length) {
					MessageToast.show("Dependent Property for referential constraint must not be initial");
				}
			}
		},
		saveRefConstraints: function (oItem, sPrinEntity, sSecEntity) {
			var aMainEntityKeys = that.saveProject.getEntityKeys.apply(this, [sPrinEntity]);
			var aSecdEntityKeys = that.saveProject.getEntityKeys.apply(this, [sPrinEntity]);
		},
		getEntityKeys: function (sEntityName) {

		},
		createAssociationSet: function (assSetName) {

			var allAssociationsSetName = this.getView().byId("Tree").getModel().getData()[0].nodes[3].nodes;
			var exsit = allAssociationsSetName.find(element => element.text === assSetName);
			if (!exsit && assSetName !== "") {
				this.getView().byId("assSetName").setValueState("None");
				var oAssociation = {
					text: assSetName,
					"ref": "sap-icon://chain-link"
				};
				this.getView().byId("Tree").getModel().getData()[0].nodes[3].nodes.push(oAssociation);
				this.getView().byId("Tree").getModel().refresh();
				return true;
			} else {
				this.getView().byId("assSetName").setValueState("Error");
				MessageToast.show("Enter Association Set name.");
			}
		},
		enableNavigPropsCreation: function () {
			this.bCreateNavigation = true;
			this.getView().byId("navPropsTableTbar").setEnabled(true);
			this.getView().byId("navPropsTable").getItems().forEach(function (oItem) {
				oItem.getCells().forEach(function (oCell) {
					oCell.setEnabled(true);
				})
			});
		},
		createNavigationProps: function () {
			var entityNavigations = [];
			var currentEntity = this.getView().byId("EntityName").getValue();
			var projetectName = this.getOwnerComponent().getModel("oDataService").getProperty("/projectName");
			var allNavigations = this.getView().byId("navPropsTable").getItems();
			allNavigations.forEach(function (oNavigation) {
				var oNavigations = {
					text: oNavigation.getCells()[0].getValue(),
					"ref": "sap-icon://chain-link"
				}
				entityNavigations.push(oNavigations);
			});
			this.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes.forEach(function (oEntity) {
				if (oEntity.text === currentEntity) {
					var allNavigations = oEntity.nodes[1];
					oEntity.nodes[1] = {
						text: "Navigation Properties",
						"ref": "sap-icon://chain-link",
						nodes: entityNavigations
					};
				}
			});
			return true;
		}

	};
	return Module;
});