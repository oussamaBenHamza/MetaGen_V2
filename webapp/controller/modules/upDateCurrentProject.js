sap.ui.define(["./propsTableRendering",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/MessageToast"
], function (propsTableRendering, Menu, MenuItem, MessageToast) {
	"use strict";

	var Module = {
		upDateProject: function (oEvent) {
			var selectedTarget = oEvent.target.innerText;
			var projectName = this.getView().byId("SerName").getValue();
			var allEntityType = this.getAllEntityTypes(this.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes);
			var selectedTargetIsEntityType = allEntityType.find(element => element === selectedTarget);
			if (selectedTarget === projectName) {
				alert("Project Name");
				// upDateCurrentProject.upDateProjectName(selectedTargetIsEntityType);
			} else if (selectedTargetIsEntityType) {
				this.upDateProject.upDateSelectedEntity.apply(this, [selectedTargetIsEntityType]);
			} else {
				var propAsTarget = oEvent.getTarget;
			}
		},
		upDateSelectedEntity: function (sEntityName) {
			var oEntityToUpdate = {};
			var allEntitTypes = this.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes;
			allEntitTypes.forEach(function (oEntityType) {
				if (oEntityType.text === sEntityName) {
					oEntityToUpdate = oEntityType;
				}
			});
			this.upDateProject.putEntityInPlace.apply(this, [oEntityToUpdate]);
		},
		putEntityInPlace: function (oEnityType) {
			var that = this;
			var sEntityName = oEnityType.text;
			var allEntitySets = this.getView().byId("Tree").getModel().getData()[0].nodes[2].nodes;
			var sEntitySetName = "";
			allEntitySets.forEach(function (oEntitySet) {
				if (oEntitySet.entityName === sEntityName) {
					sEntitySetName = oEntitySet.text
				}
			});
			this.getView().byId("EntityName").setValue(sEntityName);
			if (sEntitySetName) {
				this.getView().byId("createEntitySet").setSelected(true);
				this.getView().byId("entitySetName").setValue(sEntitySetName);
			}
			var aProperties = oEnityType.nodes[0].nodes;
			var nbrOfProps = aProperties;
			var nbrOfPropTableItems = this.getView().byId("table").getItems().length;
			this.getView().byId("table").destroyItems();
			aProperties.forEach(function (oProp, index) {
				propsTableRendering.addProperty.apply(that, [oProp]);

			});
			/*emtpyLine att the end of the table with liveChange to add another empty line*/
			propsTableRendering.addProperty.apply(that);

		},
		manageProject: function (oEvent) {
			var that = this;
			this.selectedItem = this.getView().byId("Tree").getSelectedItem();

			if (this.selectedItem) {
				this.getView().byId("Tree").setContextMenu(new Menu({
					items: [
						new MenuItem({
							text: "Create",
							press: [that.upDateProject.updateProjectFroCtxMenu, that]
						}),
						new MenuItem({
							text: "Delete"
						})
					]
				}));
			}
		},
		updateProjectFroCtxMenu: function (oEvent) {
			var itemsSelected = this.selectedItem.getProperty("title");
			if (itemsSelected === "Entity Types" || itemsSelected === "Entity Sets" || itemsSelected === "New Service") {
				this.getView().getModel("creationWizard").setProperty("/createEntities", true);
				this.getView().getModel("creationWizard").setProperty("/createAssociation", false);
			}
			if (itemsSelected === "Associations" || itemsSelected === "Associations Sets") {
				/*Creating Association / Association Sets*/
				this.getView().getModel("creationWizard").setProperty("/createEntities", false);
				this.getView().getModel("creationWizard").setProperty("/createAssociation", true);
				
				var allEntities = this.getOwnerComponent().getAllEntities.apply(this);
				if(allEntities.length > 0){
					this.getView().getModel("onCreateAssEnabled").setProperty("/enabled",true);
				}
				
			}
		}

	};
	return Module;
});