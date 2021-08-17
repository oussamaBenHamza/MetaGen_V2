sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/ButtonType",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"./modules/checkOdataProject",
	"./modules/generateProject",
	"./modules/saveProject",
	"./modules/errorManager",
	"./modules/upDateCurrentProject",
	"./modules/propsTableRendering",
	"./modules/createAssociation",
	"./modules/rendering",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, Dialog, Button, Label, ButtonType, Menu, MenuItem, checkOdata, generateProject,
	saveProject, errorManager, upDateCurrentProject, propsTableRendering, createAssociation, rendering, MessageBox) {
	"use strict";

	return Controller.extend("metaGen.obh.MetaGen.controller.CreateEntities", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf metaGen.obh.MetaGen.view.CreateEntities
		 */
		associationModule: createAssociation,
		generateProjectdModule: generateProject,
		renderingModule: rendering,
		test: rendering,
		onInit: function () {
			this.fullScreen = true;
			this.saveProject = saveProject;
			this.upDateProject = upDateCurrentProject;
			this.propsTableRendering = propsTableRendering;
			this.generateProject = generateProject;
			this.createAssociation = createAssociation;
			this.rendering = rendering;
			// var oProjectModel = new JSONModel({
			// 	projectName :"Z"
			// });
			var oProjectModel = this.getOwnerComponent().getModel("oDataService");
			this.getView().setModel(oProjectModel, "oDataService")
			var oModel = new JSONModel(sap.ui.require.toUrl("metaGen/obh/MetaGen/ProjectTree") + "/serviceTree.json");
			this.getView().setModel(oModel);
			var oGoAssociation = new sap.ui.model.json.JSONModel({
				enabled: false // Pas cliquable par défaut
			});
			this.getView().setModel(oGoAssociation, "onCreateAssEnabled");

			var oVisibleWizard = new sap.ui.model.json.JSONModel({
				createEntities: false,
				createAssociation: false,
				createNavProps: false
			});
			this.getView().setModel(oVisibleWizard, "creationWizard");

			var oToggleBtSettings = new sap.ui.model.json.JSONModel({
				toggleState: "No"
			});
			this.getView().setModel(oToggleBtSettings, "ToggleBtSettings");

			this.createdItems = 1;
			this.navPropNumber = 2;
		},
		onAppSettings: function (oEvent) {
			var that = this;
			if (!this._settingsDialog) {
				this._settingsDialog = sap.ui.xmlfragment(
					"metaGen.obh.MetaGen.view.fragments.settings",
					this
				);
				this.getView().addDependent(this._settingsDialog);
			}
			// delete this._settingsDialog._sDialogWidth;
			// this._settingsDialog._sDialogWidth = "370px";
			this._settingsDialog.open();

		},
		onAfterRendering: function (oEvt) {
			// this.byId("saveBt").addStyleClass("animation");
			var that = this;
			var me = this;

			this.oPropertiesTable = this.getView().byId("table");

			this.byId("Tree").attachBrowserEvent("dblclick", function (oEvent) {
				var selectedItem = this.getSelectedItem();
				upDateCurrentProject.upDateProjectOnDbClick.apply(that, [oEvent, selectedItem]);
			});
			this.byId("Tree").attachBrowserEvent("contextmenu", function (oEvent) {
				var selectedItem;
				var target = oEvent.target.innerText;
				var aTreeItems = this.getItems();
				aTreeItems.forEach(function (oItem) {
					if (oItem.getProperty("title") === target) {
						selectedItem = oItem;
						var that = this;
					}
				});
				this.setSelectedItem(selectedItem);
				upDateCurrentProject.manageProject.apply(that, [oEvent]);
				// alert(oEvent.target.innerText);
			});
			// rendering.toggleTextonMouseOver.apply(this, ["generateBt", "Generate"]);
			// rendering.toggleTextonMouseOver.apply(this, ["saveBt", "Save"]);
		},
		getTargetFromTree: function (selectedTarget) {
			var projectName = this.getView().byId("SerName").getValue();
			var allEntityType = this.getAllEntityTypes(this.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes);
			var selectedTargetIsEntityType = allEntityType.find(element => element === selectedTarget);
			if (selectedTarget === projectName) {
				alert("Project Name");
				// upDateCurrentProject.upDateProjectName(selectedTargetIsEntityType);
			} else if (selectedTargetIsEntityType) {

				alert("UPdating Entity " + selectedTargetIsEntityType);
				// upDateCurrentProject.upDateEntity(selectedTargetIsEntityType);
			} else {
				if (this.targetToUpdateIsProperty(selectedTarget).length > 0) {
					alert("UPdating property in entity " + this.targetToUpdateIsProperty(selectedTarget)[0].text);
					// upDateCurrentProject.upDateEntity(selectedTargetIsEntityType);
				}
			}
		},

		getAllEntityTypes: function (aEntityTypes) {
			var aEntityTypesNames = [];
			aEntityTypes.forEach(function (oEntityType) {
				aEntityTypesNames.push(oEntityType.text);
			});
			return aEntityTypesNames;

		},
		targetToUpdateIsProperty: function (selectedTarget) {
			var entityToUpdate = [];
			var allEntities = this.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes;
			allEntities.forEach(function (entity) {
				entity.nodes.forEach(function (prop) {
					prop.nodes.forEach(function (oProp) {
						if (oProp.text === selectedTarget) {
							entityToUpdate.push(entity);
						}
					});
				});
			});
			return entityToUpdate;
		},
		onClick: function (oEventt) {
			var that = this;
		},
		onSelect: function (oEvent) {
			var entityName = this.getView().byId("EntityName").getValue();
			var checkedState = this.getView().byId("entitySetName").getEnabled();
			this.getView().byId("entitySetName").setEnabled(!checkedState);
			if (entityName !== "") {
				this.getView().byId("entitySetName").setValue(entityName + "Set");
			}
		},
		onInitFinished: function (oEvent) {
			var sEntityName = this.getView().byId("EntityName").getValue();
			if (sEntityName !== "") {
				checkOdata.enablePropertyTable.apply(this);
			}
		},
		onEntityNameLiveChnage: function (oEvent) {
			var entityName = oEvent.getSource().getValue();
			var createEntitySet = this.getView().byId("createEntitySet").getSelected();
			if (entityName === "") {
				this.getView().byId("entitySetName").setValue("");
				checkOdata.enableDisablePropTab.apply(this, [false]);
			} else {
				checkOdata.enableDisablePropTab.apply(this, [true]);
			}
			if (createEntitySet && entityName !== "") {
				this.getView().byId("entitySetName").setValue(entityName + "Set");
			}
		},
		onCreate: function (oEvent) {

			var that = this;
			this.Context = oEvent;
			this.treeModel = oEvent.getSource().getParent().getModel();
			// oEvent.getSource().getParent().getModel().getData()[0].nodes.push(newEntity);
			// oEvent.getSource().getParent().getModel().refresh();
			this.oDialog = new Dialog({
				title: "Create Entity Type",
				content: [
					new Label({
						text: "Entity Name"

					}),
					new sap.m.Input({
						width: "50%"
					})
				],
				beginButton: new Button({
					type: ButtonType.Emphasized,
					icon: "sap-icon://accept",
					press: function () {
						that.entityName = this.getParent().getContent()[1].getValue();
						that.oDialog.close();
					}
				}),
				endButton: new Button({
					icon: "sap-icon://sys-cancel-2",
					press: function () {
						that.oDialog.close();
					}
				}),
				afterClose: function () {
					that.oDialog.destroy();
				}
			});

			this.oDialog.open();
			if (that.entityName) {
				var newEntity = {
					text: that.entityName
				};
				oEvent.getSource().getParent().getModel().getData()[0].nodes.push(newEntity);
				oEvent.getSource().getParent().getModel().refresh();
			}

		},
		onCreateEntity: function () {
			var oDialog = new Dialog({
				title: "Create Entity Type",
				content: [
					new Label({
						text: "Entity Name"
					}),
					new sap.m.Input()
				],
				beginButton: new Button({
					type: ButtonType.Emphasized,
					icon: "sap-icon://accept",
					press: function () {
						oDialog.close();
					}
				}),
				endButton: new Button({
					icon: "sap-icon://sys-cancel-2",
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			});

			oDialog.open();
		},
		onDelete: function (oEvent) {},
		onUpdate: function (oEvent) {
			var selectedNodePath = this.oPropagatedProperties.oBindingContexts.undefined.sPath;
			var selectNode = this.getModel().getProperty(selectedNodePath);
			if (selectNode.text === "Entity Types") {
				oEvent.getSource().setEnabled(false);
			}
			var that = this;
			upDateCurrentProject.upDate.apply(this, [oEvent]);
		},
		handleToggleSecondaryContent: function (oEvent) {
			if (this.fullScreen) {
				this.getView().byId("fullScreenBt").setIcon("sap-icon://exit-full-screen");
			} else {
				this.getView().byId("fullScreenBt").setIcon("sap-icon://full-screen");
			}
			this.fullScreen = !this.fullScreen;
			var oSplitContainer = this.byId("mySplitContainer");
			oSplitContainer.setShowSecondaryContent(!oSplitContainer.getShowSecondaryContent());
		},
		onPropertyNameChange: function (oEvt) {

			if (!this.oPropertiesTable) {
				this.oPropertiesTable = this.getParent().getParent();
			}
			var aItems = this.oPropertiesTable.getItems();
			var nbrOfItems = aItems.length;
			if (this.oPropertiesTable.getItems().length === 1) {
				this.sValue = this.oPropertiesTable.getItems()[0].getCells()[0].getValue();
			} else if (this.oPropertiesTable.getItems().length > 1) {
				var beforeLastItem = aItems[nbrOfItems - 2];
				this.sValue = beforeLastItem.getCells()[0].getValue();

			}

			if (this.sValue !== "") {
				var lastItemIndex = aItems.length - 1;
				if (!this.itemIsEmpty(aItems[lastItemIndex].getCells())) {
					this.oPropertiesTable.addItem(this._createAddLine());
					this._addAddLine(this.oPropertiesTable);
				}
			} else {
				aItems = this.oPropertiesTable.getItems();
				lastItemIndex = aItems.length - 1;
				if (this.itemIsEmpty(aItems[lastItemIndex].getCells())) {
					this.oPropertiesTable.removeItem(this.oPropertiesTable.getItems()[lastItemIndex]);
					this._removeLine(this.oPropertiesTable);
				}
			}
		},
		_getNewEmptyItem: function (oTableItem) {
			oTableItem.getCells()[0].setValue("");
			oTableItem.getCells()[1].setSelected(false);
			oTableItem.getCells()[2].setSelectedKey("empty");
			return oTableItem;
		},
		_createAddLine: function () {
			var that = this;
			this.createdEmptyItems = 1;
			var columnListItem = new sap.m.ColumnListItem({
				cells: [
					new sap.m.Input({
						value: "",
						liveChange: [this.onNewItemChange, that]
					}),
					new sap.m.CheckBox({}),
					// new sap.m.ComboBox(),
					that._createTypeComboBox(),
					new sap.m.Input({
						type: "Number"
					}),
					new sap.m.Input({
						type: "Number"
					}),
					new sap.m.Input({
						type: "Number"
					}),
					new sap.m.CheckBox(),
					new sap.m.CheckBox(),
					new sap.m.CheckBox(),
					new sap.m.CheckBox(),
					new sap.m.CheckBox(),
					new sap.m.Input()
				]
			});
			return columnListItem;
		},
		_createNavPropsLine: function () {

			var that = this;

			var columnListItem = new sap.m.ColumnListItem({
				cells: [
					new sap.m.Input(),
					new sap.m.Input(
						"refConst_id" + that.navPropNumber, {
							value: "",
							showSuggestion: true,
							showValueHelp: true,
							valueHelpRequest: [that.openAssociations, that]
						}
					),
					new sap.m.Input()
				]
			});
			that.navPropNumber++;
			return columnListItem;

		},
		_createTypeComboBox: function (selectedKey) {
			var emtpyItem = new sap.ui.core.Item({
				key: "emtpy",
				text: ""
			});
			var binaryItem = new sap.ui.core.Item({
				key: "Binary",
				text: "Binary"
			});
			var BooleanItem = new sap.ui.core.Item({
				key: "Boolean",
				text: "Boolean"
			});
			var ByteItem = new sap.ui.core.Item({
				key: "Byte",
				text: "Byte"
			});
			var DateTimeItem = new sap.ui.core.Item({
				key: "DateTime",
				text: "DateTime"
			});
			var DateTimeOffsetItem = new sap.ui.core.Item({
				key: "DateTimeOffset",
				text: "DateTimeOffset"
			});
			var DecimalItem = new sap.ui.core.Item({
				key: "Decimal",
				text: "Decimal"
			});
			var doubleItem = new sap.ui.core.Item({
				key: "Double",
				text: "Double"
			});
			var FloatItem = new sap.ui.core.Item({
				key: "Float",
				text: "Float"
			});
			var GuidItem = new sap.ui.core.Item({
				key: "Guid",
				text: "Guid"
			});
			var int16Item = new sap.ui.core.Item({
				key: "Int16",
				text: "Int16"
			});
			var int32Item = new sap.ui.core.Item({
				key: "Int32",
				text: "Int32"
			});
			var int64Item = new sap.ui.core.Item({
				key: "Int64",
				text: "Int64"
			});
			var sByteItem = new sap.ui.core.Item({
				key: "SByte",
				text: "SByte"
			});
			var singleItem = new sap.ui.core.Item({
				key: "Single",
				text: "Single"
			});
			var stringItem = new sap.ui.core.Item({
				key: "String",
				text: "String"
			});
			var timeItem = new sap.ui.core.Item({
				key: "Time",
				text: "Time"
			});
			var newTypeCombo = new sap.m.ComboBox();
			newTypeCombo.addItem(emtpyItem);
			newTypeCombo.addItem(binaryItem);
			newTypeCombo.addItem(BooleanItem);
			newTypeCombo.addItem(ByteItem);
			newTypeCombo.addItem(DateTimeItem);
			newTypeCombo.addItem(DateTimeOffsetItem);
			newTypeCombo.addItem(DecimalItem);
			newTypeCombo.addItem(doubleItem);
			newTypeCombo.addItem(FloatItem);
			newTypeCombo.addItem(GuidItem);

			newTypeCombo.addItem(int16Item);
			newTypeCombo.addItem(int32Item);
			newTypeCombo.addItem(int64Item);

			newTypeCombo.addItem(sByteItem);
			newTypeCombo.addItem(singleItem);

			newTypeCombo.addItem(stringItem);
			newTypeCombo.addItem(timeItem);
			return newTypeCombo;
		},
		_addAddLine: function (oTable) {
			oTable.onAfterRendering = function () {
				var $this = this.$();
				var lastlines = $this.find(".sapMLIB:nth-last-of-type(1)");
				var lastline = lastlines[0];
				var cells = lastline.getElementsByClassName("sapMListTblCell");
				try {
					cells.this._addColumnId_cell1.colSpan = 2;
				} catch (err) {
					// do nothing
				}
			};
		},
		_removeLine: function (oTable) {
			oTable.onAfterRendering = function () {
				var $this = this.$();
				var lastlines = $this.find(".sapMLIB:nth-last-of-type(1)");
				var lastline = lastlines[0];
				var cells = lastline.getElementsByClassName("sapMListTblCell");
				try {
					cells.this._addColumnId_cell1.colSpan = 2;
				} catch (err) {
					// do nothing
				}
			};
		},
		itemIsEmpty: function (oProp) {
			if (oProp[0].getValue() === "" && !oProp[1].getSelected() && oProp[2].getSelectedKey() === "" && oProp[3].getValue() === "" &&
				oProp[4].getValue() === "" && oProp[5].getValue() === "" && !oProp[6].getSelected() && !oProp[7].getSelected() && !oProp[8].getSelected() &&
				!oProp[9].getSelected() && !oProp[10].getSelected() && oProp[11].getValue() === ""
			) {
				return true;
			} else {
				return false;
			}
		},
		onNewItemChange: function (oEvent, oController) {
			oEvent.getSource().getParent().getParent().getItems()[0].getCells()[0].fireLiveChange({
				event: oEvent
			});
		},
		onAddProperty: function (oEvent) {
			this.oPropertiesTable.addItem(this._createAddLine());
			this._addAddLine(this.oPropertiesTable);
		},
		onAddNavProperty: function (oEvent) {
			this.oNavPropsTable = this.getView().byId("navPropsTable");
			this.oNavPropsTable.addItem(this._createNavPropsLine());
			this._addAddLine(this.oNavPropsTable);
		},
		onDeleteSelectedProperties: function (oEvent) {
			var that = this;
			var deleteAuthorised = false;
			var sMsg = "";

			var allProperties = this.oPropertiesTable.getItems();
			var selectedProperties = this.oPropertiesTable.getSelectedItems();
			if (allProperties.length === 1 || allProperties.length === selectedProperties.length) {
				sMsg = "Cannot Have Empty Entity";
			} else {
				deleteAuthorised = true;
			}
			if (deleteAuthorised) {
				selectedProperties.forEach(function (property) {
					that.oPropertiesTable.removeItem(property);
					that._removeLine(that.oPropertiesTable);
				});
			} else {
				MessageToast.show(sMsg);
			}

		},
		onDeleteNavProperties: function (oEvent) {
			var that = this;
			var allProperties = this.oNavPropsTable.getItems();
			var selectedProperties = this.oNavPropsTable.getSelectedItems();
			selectedProperties.forEach(function (property) {
				that.oNavPropsTable.removeItem(property);
				that._removeLine(that.oNavPropsTable);
			});
		},
		onCancel: function (oEvent) {
			this.getView().byId("generateBt").setEnabled(false);
			this.getOwnerComponent().getRouter().navTo("metaGen");
		},
		onCheck: function (oEvent) {

			this.getView().byId("errBt").setVisible(false);
			this.checkOdata = checkOdata;
			this.createErrosPopOver.apply(this, [new JSONModel()]);
			var aMsgCheck = [];
			/* Checking Odata */
			var srvNameMsg = checkOdata.checkSrvName.apply(this);
			if (srvNameMsg.type === "Error") {
				aMsgCheck.push(srvNameMsg);
			}

			var oEntityCheckMsg = checkOdata.checkEntities.apply(this);
			if (oEntityCheckMsg.length > 0) {
				oEntityCheckMsg.forEach(function (error) {
					aMsgCheck.push(error);
				});
			}
			/*Checking assocations*/
			// var oAssociationMsgs = checkOdata.checkAssociations.apply(this);
			// if (oEntityCheckMsg.length > 0) {
			// 	oEntityCheckMsg.forEach(function (error) {
			// 		aMsgCheck.push(error);
			// 	});
			// }
			/* Creating Console msgs Array */

			if (aMsgCheck.length > 0) {
				this.getView().byId("successMsg").setVisible(false);
				if (aMsgCheck[0].type === "Error") {
					this.getView().byId("errBt").setType("Negative");
				}
				if (aMsgCheck[0].type === "Warning") {
					this.getView().byId("errBt").setType("Critical");
				}
				this.getView().byId("errBt").setVisible(true);
				this.getView().byId("errBt").setText(aMsgCheck.length);
				this.oMessageView.getModel().setData(aMsgCheck);
			} else {
				var sSrvName = this.getView().byId("SerName").getValue();
				var checkMsg = "Project '" + sSrvName + "' has been checked; no errors were found";
				this.getView().byId("errBt").setVisible(false);
				this.getView().byId("successMsg").setVisible(true);
				this.getView().byId("successMsg").setText(checkMsg);
				this.getView().byId("generateBt").setEnabled(true);
			}
			// this.getView().byId("checkBt").setEnabled(false);

		},
		createErrosPopOver: function (oModel) {
			var oMessageTemplate = new sap.m.MessageItem({
				type: "{type}",
				title: "{title}",
				description: "{description}",
				subtitle: "{subtitle}",
				counter: "{counter}",
				markupDescription: "{markupDescription}"
			});

			var aMockMessages = [];

			// var oModel = new JSONModel(),
			var that = this;

			oModel.setData(aMockMessages);
			var oBackButton = new sap.m.Button({
				icon: sap.ui.core.IconPool.getIconURI("nav-back"),
				visible: false,
				press: function () {
					that.oMessageView.navigateBack();
					this.setVisible(false);
				}
			});
			this.oMessageView = new sap.m.MessageView({
				showDetailsPageHeader: false,
				itemSelect: function () {
					oBackButton.setVisible(true);
				},
				items: {
					path: "/",
					template: oMessageTemplate
				}
			});
			this.oMessageView.setModel(oModel);
			var oCloseButton = new Button({
					text: "Close",
					press: function () {
						that._oPopover.close();
					}
				}),
				oPopoverFooter = new sap.m.Bar({
					contentRight: oCloseButton
				}),
				oPopoverBar = new sap.m.Bar({
					contentLeft: [oBackButton],
					contentMiddle: [
						new sap.ui.core.Icon({
							color: "#bb0000",
							src: "sap-icon://message-error"
						}),
						new sap.m.Text({
							text: "Console"
						})
					]
				});

			this._oPopover = new sap.m.Popover({
				customHeader: oPopoverBar,
				contentWidth: "440px",
				contentHeight: "440px",
				verticalScrolling: false,
				modal: true,
				content: [this.oMessageView],
				footer: oPopoverFooter
			});
		},
		entityHasKey: function (aProperties) {

			var hasKey = false;
			for (var i = 0; i < aProperties.length; i++) {
				if (aProperties[i].getCells()[1].getSelected()) {
					hasKey = true;
					break;
				}
			}
			return hasKey;
		},

		onEditProject: function (oEvent) {
			// this.getView().byId("editPrjctBt").setVisible(true);
			this.getView().byId("SerName").setEnabled(true);
			this.getView().byId("editPrjctBt").setVisible(false);
		},
		onSave: function (oEvent) {
			this.getView().byId("successMsg").setVisible(false);
			this.getView().byId("checkBt").setEnabled(true);
			this.getView().byId("editPrjctBt").setVisible(true);
			// this.getView().byId("EntityName").setEnabled(false);
			// this.getView().byId("createEntitySet").setEnabled(false);
			// this.getView().byId("entitySetName").setEnabled(false);

			this.getView().byId("Tree").expandToLevel(4);

			this.bSaved = false;
			this.checkOdata = checkOdata;
			var sProjectName = this.getView().byId("SerName").getValue();
			var entityName = this.getView().byId("EntityName").getValue();
			var entitySetName = this.getView().byId("entitySetName").getValue();
			if (sProjectName !== "") {
				this.bSaved = saveProject.createProject.apply(this, [sProjectName]);
			}
			if (entityName !== "" && this.bSaved) {
				this.bSaved = this.bSaved && saveProject.createEntityType.apply(this, [entityName]);
			}
			if (entitySetName !== "" && this.bSaved) {
				this.bSaved = this.bSaved && saveProject.createEntitySet.apply(this, [entitySetName]);
			}
			/*Saving Properties*/
			saveProject.saveProperties.apply(this);

			/*Saving Associations*/
			if (this.getView().byId("AssociationWizard").getVisible()) {
				this.bSaved = this.bSaved && saveProject.createAssociation.apply(this);
				this.bSaved = this.bSaved && saveProject.createAssociationSet.apply(this, [this.getView().byId("assSetName").getValue()]);
			}
			// /*Saving Associations Set/Navigations*/
			// if (this.getView().byId("associationSwitch").getState() && this.bSaved) {
			// 	this.bSaved = this.bSaved && saveProject.createAssociationSet.apply(this, [this.getView().byId("assSetName").getValue()]);
			// }
			/*Saving Navigations*/
			/*if (this.bSaved) {
				this.bSaved = this.bSaved && saveProject.createNavigationProps.apply(this);
			}*/
			// 
			if (this.bSaved) {
				var saveMsg = " Data Saved : Check Project Tree";
				MessageToast.show(saveMsg);
			}

		},
		onCreateServiceFinish: function (oEvent) {
			var sServiceName = this.getView().byId("SerName").getValue();
			if (sServiceName.length > 1 && sServiceName.length !== "Z") {
				this.getView().byId("Tree").getModel().getData()[0].text = sServiceName;
				this.getView().byId("Tree").getModel().refresh();
				this.getView().byId("EntityName").setEnabled(true);
				this.getView().byId("createEntitySet").setEnabled(true);
			}
		},
		onSrvNameLiveChange: function (oEvent) {
			var sSrvName = oEvent.getSource().getValue();
			if (sSrvName !== "Z" && sSrvName !== "") {
				this.getView().byId("EntityName").setEnabled(true);
				this.getView().byId("createEntitySet").setEnabled(true);
				if (sSrvName[0] !== "Z") {
					oEvent.getSource().setValue("Z" + sSrvName.toUpperCase());
				}
			} else {
				this.getView().byId("EntityName").setEnabled(false);
				this.getView().byId("createEntitySet").setEnabled(false);
			}
			oEvent.getSource().setValue(oEvent.getSource().getValue().toUpperCase());
		},
		onOpenErrors: function (oEvent) {
			this.oMessageView.navigateBack();
			this._oPopover.openBy(oEvent.getSource());
		},
		onDelete: function (oEvent) {
			var that = this;
			this.selectedItem = this.getView().byId("Tree").getSelectedItem();
			if (this.selectedItem) {
				MessageBox.confirm("Delete Confirmation", {
					title: "Confirm", // default
					onClose: that.confirmDelete, // default
					styleClass: "", // default
					initialFocus: null, // default
					textDirection: sap.ui.core.TextDirection.Inherit // default
				});
			} else {
				MessageToast.show("Nothing to delete");
			}
		},
		onItemPress: function (oEvent) {
			var that = this;
			var oProjectTree = this.getView().byId("Tree");
		},
		confirmDelete: function (oEvent) {
			var that = this;
			if (oEvent === "OK") {

			}
		},
		onResetPropsTable: function (oEvent) {
			this.getView().byId("table").destroyItems();
			this.getView().byId("addPropBt").firePress();
		},
		onTypeChange: function (oEvent) {
			var oPropTable = this.getView().byId("table");
			var sType = oEvent.getSource().getValue();
			if (sType === "DateTime" || sType === "DateTimeOffset" || sType === "Decimal" || sType === "Time") {
				this.getView().byId("prec").setEnabled(true);
			} else {
				this.getView().byId("prec").setEnabled(false);
			}
		},
		openAssociations: function (oEvent) {

			var that = this;
			var sInputValue = oEvent.getSource().getValue();

			this.navInputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._assDialog) {
				this._assDialog = sap.ui.xmlfragment(
					"metaGen.obh.MetaGen.view.fragments.associations",
					this
				);
				this.getView().addDependent(this._assDialog);
			}
			var allAssociations = this.getView().byId("Tree").getModel().getData()[0].nodes[1].nodes;
			this._assDialog.destroyItems();
			allAssociations.forEach(function (association) {
				var oItem = new sap.m.StandardListItem({
					title: association.text,
					icon: "sap-icon://locate-me"
				});
				that._assDialog.addItem(oItem);
			});
			this._assDialog.open(sInputValue);

		},
		openEntities: function (oEvent) {
			var that = this;
			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"metaGen.obh.MetaGen.view.fragments.allEntities",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}

			// create a filter for the binding
			// this._valueHelpDialog.getBinding("items").filter([new Filter(
			// 	"Name",
			// 	sap.ui.model.FilterOperator.Contains, sInputValue
			// )]);

			// open value help dialog filtered by the input value
			var allEntities = this.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes;
			this._valueHelpDialog.destroyItems();
			allEntities.forEach(function (oEntity) {
				var oItem = new sap.m.StandardListItem({
					title: oEntity.text,
					icon: "sap-icon://heatmap-chart"
				});
				that._valueHelpDialog.addItem(oItem);
			});
			this._valueHelpDialog.open(sInputValue);

		},
		relationSelected: function (oEvent) {
			var selectedRelation = oEvent.getParameter("selectedItem").getProperty("title");
			this.getView().byId(this.navInputId).setValue(selectedRelation);
		},
		entitySelected: function (oEvent) {
			var that = this;
			var selectedItem = oEvent.getParameter("selectedItem").getProperty("title");
			if (this.inputId.indexOf("secSetName") > -1) {
				var inputId = "secSetName";
			}
			if (this.inputId.indexOf("prinEntity") > -1) {
				var inputId = "prinEntity";
			}
			if (this.inputId.indexOf("depId") > -1) {
				var inputId = "prinEntity";
			}
			if (this.inputId.indexOf("prinEntitySet") > -1) {
				var inputId = "prinEntitySet";
			}
			if (this.inputId.indexOf("secEntitySetName") > -1) {
				var inputId = "secEntitySetName";
			}
			if (this.inputId.indexOf("assSecSetName") > -1) {
				var inputId = "assSecSetName";
			}
			this.getView().byId(inputId).setValue(selectedItem);
			var sPrincipalEntity = this.getView().byId("prinEntity").getValue();
			var sSecEntity = this.getView().byId("secSetName").getValue();
			if (sPrincipalEntity !== "" && sSecEntity !== "") {
				this.aPrinEnityKeys = this.getEntityKeys(sPrincipalEntity);
				this.aSecEnityKeys = this.getEntityKeys(sSecEntity);
				if (inputId !== "prinEntitySet" && inputId !== "secEntitySetName") {
					this.getView().byId("refConst").destroyItems();
				}
				/*setting entitySet for associationSets*/
				// var allAssociationsSetName = this.getView().byId("Tree").getModel().getData()[0].nodes[2].nodes;
				// allAssociationsSetName.forEach(function (assSet) {
				// 	if (assSet.entityName === sPrincipalEntity) {
				// 		that.getView().byId("prinEntitySet").setValue(assSet.text);
				// 	}
				// 	if (assSet.entityName === sSecEntity) {
				// 		that.getView().byId("secEntitySetName").setValue(assSet.text);
				// 	}
				// });

				this.aPrinEnityKeys.forEach(function (Key, index) {
					var columnListItem = new sap.m.ColumnListItem("inputId_" + index.toString(), {
						cells: [
							new sap.m.Text({
								text: sPrincipalEntity
							}),
							new sap.m.Input({
								type: "Text",
								showSuggestion: true,
								showValueHelp: true,
								value: Key.text,
								valueHelpRequest: [that.openPrimaryKeys, that]
							}),
							new sap.m.Text({
								text: sSecEntity
							}),
							new sap.m.Input({
								type: "Text",
								showSuggestion: true,
								showValueHelp: true,
								valueHelpRequest: [that.openSecondaryKeys, that]
							})
						]
					});
					that.getView().byId("refConst").addItem(columnListItem);
					that._addAddLine(that.getView().byId("refConst"));
				});
			}

		},
		openPrimaryKeys: function (oEvent) {
			var that = this;
			var sInputValue = oEvent.getSource().getValue();
			this.primaryKey = true;
			this.secondaryKey = false;
			this.inputId = oEvent.getSource().getParent().getId();
			// create value help dialog
			if (!this._keyDialog) {
				this._keyDialog = sap.ui.xmlfragment(
					"metaGen.obh.MetaGen.view.fragments.keys",
					this
				);
				this.getView().addDependent(this._keyDialog);
			}

			// create a filter for the binding
			// this._valueHelpDialog.getBinding("items").filter([new Filter(
			// 	"title",
			// 	sap.ui.model.FilterOperator.Contains, sInputValue
			// )]);

			// open value help dialog filtered by the input value
			var allEntities = this.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes;
			this._keyDialog.destroyItems();
			this.aPrinEnityKeys.forEach(function (key) {
				var oItem = new sap.m.StandardListItem({
					title: key.text,
				});
				that._keyDialog.addItem(oItem);
			});
			this._keyDialog.setTitle("Select Principal Key")
			this._keyDialog.open(sInputValue);

		},
		openSecondaryKeys: function (oEvent) {
			var that = this;
			var sInputValue = oEvent.getSource().getValue();
			this.primaryKey = false;
			this.secondaryKey = true;
			this.inputId = oEvent.getSource().getParent().getId();
			// create value help dialog
			if (!this._secKeysDialog) {
				this._secKeysDialog = sap.ui.xmlfragment(
					"metaGen.obh.MetaGen.view.fragments.keys",
					this
				);
				this.getView().addDependent(this._secKeysDialog);
			}

			// create a filter for the binding
			// this._valueHelpDialog.getBinding("items").filter([new Filter(
			// 	"Name",
			// 	sap.ui.model.FilterOperator.Contains, sInputValue
			// )]);

			// open value help dialog filtered by the input value
			var allEntities = this.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes;
			this._secKeysDialog.destroyItems();
			this.aSecEnityKeys.forEach(function (key) {
				var oItem = new sap.m.StandardListItem({
					title: key.text,
				});
				that._secKeysDialog.addItem(oItem);
			});
			this._secKeysDialog.setTitle("Select Dependent Property")
			this._secKeysDialog.open(sInputValue);
		},
		keySelected: function (oEvent) {
			var that = this;
			var selectedKey = oEvent.getParameter("selectedItem").getProperty("title");
			this.refConstraints = this.getView().byId("refConst");
			this.refConstraints.getItems().forEach(function (oItem) {
				if (oItem.getId() === that.inputId) {
					if (that.primaryKey) {
						oItem.getCells()[1].setValue(selectedKey);
					}
					if (that.secondaryKey) {
						oItem.getCells()[3].setValue(selectedKey);
					}

				}
			});
		},
		getEntityKeys: function (sEntityName) {
			var that = this;
			var aKeys = [];
			var allEntityProps = [];
			var found = false;
			var allEntities = this.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes;
			allEntities.forEach(function (oEntity) {
				if (!found) {
					allEntityProps = that.getEntityProps(oEntity, sEntityName);
					if (allEntityProps && allEntityProps.length > 0) {
						found = true;
					}
				}
			});
			if (found) {
				allEntityProps.forEach(function (oProp) {
					if (oProp.isKey) {
						aKeys.push(oProp);
					}
				});
			}
			return aKeys;

		},
		getEntityProps: function (oEntity, sEntityName) {
			if (oEntity.text === sEntityName) {
				return oEntity.nodes[0].nodes;
			}
		},
		openEntitiesSets: function (oEvent) {
			var that = this;
			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"metaGen.obh.MetaGen.view.fragments.allEntities",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}

			// create a filter for the binding
			// this._valueHelpDialog.getBinding("items").filter([new Filter(
			// 	"Name",
			// 	sap.ui.model.FilterOperator.Contains, sInputValue
			// )]);

			// open value help dialog filtered by the input value
			var allEntitySets = this.getView().byId("Tree").getModel().getData()[0].nodes[2].nodes;
			this._valueHelpDialog.destroyItems();
			allEntitySets.forEach(function (key) {
				var oItem = new sap.m.StandardListItem({
					title: key.text,
				});
				that._valueHelpDialog.addItem(oItem);
			});
			this._valueHelpDialog.setTitle("Choose an Entity Set")
			this._valueHelpDialog.open(sInputValue);

		},
		onExpandSrvTree: function (oEvent) {
			this.getView().byId("Tree").expandToLevel(4);
		},
		onCollapseSrvTree: function (oEvent) {
			this.getView().byId("Tree").expandToLevel(0);
		},
		onCreateNewService: function (oEvent) {
			this.getView().getModel("creationWizard").setProperty("/createEntities", true);
			this.getView().getModel("creationWizard").setProperty("/createAssociation", false);
		}

	});

});