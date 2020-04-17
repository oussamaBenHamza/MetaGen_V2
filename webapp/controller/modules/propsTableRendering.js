sap.ui.define([], function () {
	"use strict";

	var Module = {
		addProperty: function (oProp) {
			var that = this;
			this.getView().byId("table").addItem(this.propsTableRendering._createAddLine.apply(that,[oProp]));
			this.propsTableRendering._addAddLine.apply(that, [this.getView().byId("table")]);
		},
		_createAddLine: function (oProp) {
			var that = this;
			this.createdEmptyItems = 1;
			var columnListItem = new sap.m.ColumnListItem({
				cells: [
					new sap.m.Input({
						value: oProp.text
					}),
					new sap.m.CheckBox({
						selected : oProp.isKey
					}),
					// new sap.m.ComboBox(),
					that.propsTableRendering._createTypeComboBox(oProp.type),
					new sap.m.Input({
						value : oProp.prec,
						type: "Number"
					}),
					new sap.m.Input({
						value : oProp.scale,
						type: "Number"
					}),
					new sap.m.Input({
						value : oProp.maxLenght,
						type: "Number"
					}),
					new sap.m.CheckBox({
						selected : oProp.creatable
					}),
					new sap.m.CheckBox({
						selected : oProp.updatable
					}),
					new sap.m.CheckBox({
						selected : oProp.sortable
					}),
					new sap.m.CheckBox({
						selected : oProp.filltrable
					}),
					new sap.m.CheckBox({
						selected : oProp.nullable
					}),
					new sap.m.Input({
						value: oProp.label
					})
				]
			});
			return columnListItem;
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
				key: "int16",
				text: "int16"
			});
			var int32Item = new sap.ui.core.Item({
				key: "int32",
				text: "int32"
			});
			var int64Item = new sap.ui.core.Item({
				key: "int64",
				text: "int64"
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
			newTypeCombo.setSelectedKey(selectedKey);
			return newTypeCombo;
		}
	};
	return Module;
});