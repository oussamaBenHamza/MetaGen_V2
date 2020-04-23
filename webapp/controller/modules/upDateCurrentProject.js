sap.ui.define(["./propsTableRendering",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/MessageToast"
], function (propsTableRendering, Menu, MenuItem, MessageToast) {
	"use strict";

	var Module = {
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
				if (allEntities.length > 0) {
					this.getView().getModel("onCreateAssEnabled").setProperty("/enabled", true);
				}

			}
		},
		upDateProjectOnDbClick : function(oSelectedItem){
			var selectedItemTitle = oSelectedItem.getProperty("title");
			if(selectedItemTitle === "Entity Types"){
				alert("Entity Types");
			}else if(this.isEntity(selectedItemTitle)){
				alert(selectedItemTitle + "is entity");
			}
		}

	};
	return Module;
});