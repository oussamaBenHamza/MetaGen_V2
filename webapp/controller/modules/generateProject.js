sap.ui.define(["sap/ui/core/util/Export",
	"sap/ui/core/util/ExportType"
], function (Export, ExportType) {
	"use strict";

	var Module = {
		onGenerate: function (oEvent) {
			var header = '<?xml version="1.0" encoding="UTF-8"?>';
			header = header + "\n" +
				'<edmx:Edmx xmlns:sap="http://www.sap.com/Protocols/SAPData" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">';
			header = header + "\n" + '\t<edmx:DataServices m:DataServiceVersion="2.0">' + "\n";

			var footer = '\t</edmx:DataServices>' + "\n" + '</edmx:Edmx>';

			/*Service Header */
			var srvNameHeader = this.generateProject.getSrvNameXml.apply(this).header;
			var srvNameFooter = this.generateProject.getSrvNameXml.apply(this).footer;

			/*Entities Xml*/
			var entities = this.generateProject.getEntitiesXml.apply(this);

			/*Association Xml*/
			var associations = this.generateProject.getAssociations.apply(this);

			/*EntitySets Xml*/
			var entitySets = this.generateProject.getEntitiesSetsXml.apply(this);

			/*formatting XML*/
			var xml = header + srvNameHeader + entities + associations + entitySets + srvNameFooter + footer;
			// var xmltext = "<sometag><someothertag></someothertag></sometag>";

			var pom = document.createElement("a");
			var filename = "metaData.xml";
			// var pom = document.createElement('a');
			var bb = new Blob([xml], {
				type: "text/plain"
			});

			pom.setAttribute("href", window.URL.createObjectURL(bb));
			pom.setAttribute("download", filename);

			pom.dataset.downloadurl = ["text/plain", pom.download, pom.href].join(":");
			pom.draggable = true;
			pom.classList.add("dragout");

			pom.click();
		},
		getSrvNameXml: function () {
			var srvName = this.getView().byId("SerName").getValue() + "_SRV";
			var srvNameHedarXml =
				'\t\t<Schema xml:lang="fr" xmlns="http://schemas.microsoft.com/ado/2008/09/edm" sap:schema-version="1" Namespace="' + srvName +
				'">' +
				'\n';
			var srvNameFooterXml = '\t\t</Schema>' + '\n';
			return {
				header: srvNameHedarXml,
				footer: srvNameFooterXml
			};
		},
		getEntitiesXml: function () {
			var that = this;
			var entitiesXml = "";
			var allEntities = this.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes;
			allEntities.forEach(function (entity) {
				entitiesXml = entitiesXml + that.generateProject.getEntityXml(entity);
			});
			return entitiesXml;
		},
		getEntityXml: function (oEntity) {
			var entityName = oEntity.text;
			var entityNameXml = '\t\t\t<EntityType sap:content-version="1" Name="' + entityName + '">\n';

			var keyProps = this.getKeysPropsXml(oEntity.nodes[0].nodes);
			var entityNameXmlFooter = "\t\t\t</EntityType>\n";
			var propsDef = this.getPropsXml(oEntity.nodes[0].nodes);
			return entityNameXml + keyProps + propsDef + entityNameXmlFooter;
		},
		getKeysPropsXml: function (oProps) {
			var keyPropsXml = "";
			oProps.forEach(function (oProp) {
				if (oProp.isKey) {
					keyPropsXml = keyPropsXml + '\t\t\t\t\t<PropertyRef Name="' + oProp.text + '"/>\n';
				}
			});
			keyPropsXml = "\t\t\t\t<Key>\n" + keyPropsXml + "\t\t\t\t</Key>\n";
			return keyPropsXml;
		},
		getPropsXml: function (oProps) {
			var propsXml = "";
			oProps.forEach(function (oProp) {
				var sPropName = oProp.text;
				var sNullable = oProp.nullable ? "" : ' Nullable="false"';
				var sType = ' Type="Edm.' + oProp.type + '" ';
				var sFiltrable = oProp.filltrable ? "" : ' sap:filterable="false"';
				var sSortable = oProp.sortable ? "" : ' sap:sortable="false"';
				var sUpdatable = oProp.updatable ? "" : ' sap:updatable="false"';
				var sCreatable = oProp.creatable ? "" : ' sap:creatable="false"';
				var sMaxLength = oProp.maxLenght === "" ? "" : ' MaxLength="' + oProp.maxLenght + '"';
				var sLabel = oProp.label === "" ? "" : ' sap:label="' + oProp.label + '"';
				propsXml = propsXml +
					'\t\t\t\t<Property Name="' + sPropName + '"' +
					' sap:unicode="false"' +
					sLabel +
					sMaxLength +
					sNullable +
					sType +
					sFiltrable +
					sSortable +
					sUpdatable +
					sCreatable +
					"/>\n";
			});
			return propsXml;
		},
		getEntitiesSetsXml: function () {
			var srvName = this.getView().byId("SerName").getValue();
			var entitySets = '\t\t\t<EntityContainer Name="' + srvName + "_SRV_Entities" +
				'" sap:supported-formats="atom json xlsx" m:IsDefaultEntityContainer="true">\n';
			var allEntitySets = this.getView().byId("Tree").getModel().getData()[0].nodes[2].nodes;
			allEntitySets.forEach(function (entitySet) {
				entitySets = entitySets + '\t\t\t\t<EntitySet sap:content-version="1" Name="' + entitySet.text + '" EntityType="' + srvName +
					"_SRV" + "." +
					entitySet.entityName + '"/>\n';
			});
			return entitySets + "\t\t\t</EntityContainer>\n";
		},
		getAssociations: function () {
			var that = this;
			var srvName = this.getView().byId("SerName").getValue();
			var assocationsXml = "";
			var allAssocations = this.getView().byId("Tree").getModel().getData()[0].nodes[1].nodes;
			allAssocations.forEach(function (association) {
				assocationsXml = assocationsXml + that.generateProject.getAssociation(association, srvName);
			});
			return assocationsXml;
		},
		getAssociation: function (oAssocation, srvName) {

			var associationXml = '\t\t\t<Association sap:content-version="1" Name="' + oAssocation.text + '">\n';
			var principalEntity = '\t\t\t\t<End Type="' + srvName + "_SRV." + oAssocation.principalEntity +
				'" Role="FromRole_' + oAssocation.text + '" Multiplicity="' + oAssocation.principalCardinlaty + '"/>\n';
			var secondaryEntity = '\t\t\t\t<End Type="' + srvName + "_SRV." + oAssocation.secondaryEntity +
				'" Role="ToRole_' + oAssocation.text + '" Multiplicity="' + oAssocation.secondaryCardinlaty + '"/>\n';

			var refConstraints = this.getRefConst(oAssocation);

			associationXml = associationXml + principalEntity + secondaryEntity + refConstraints + "\t\t\t</Association>\n";
			return associationXml;
		},
		getRefConst: function (oAssocation) {
			var aRefConstraints = oAssocation.nodes[0].nodes;
			var refConstraints = "";
			aRefConstraints.forEach(function (refConstraint) {
				refConstraints += '\t\t\t\t\t<Principal Role="FromRole_' + oAssocation.text + '">\n';
				refConstraints += '\t\t\t\t\t\t<PropertyRef Name="' + refConstraint.text + '"/>\n';
				refConstraints += "\t\t\t\t\t</Principal>\n";
				refConstraints += '\t\t\t\t\t<Dependent Role="ToRole_' + oAssocation.text + '">\n';
				refConstraints += '\t\t\t\t\t\t<PropertyRef Name="' + refConstraint.dependentKey + '"/>\n';
				refConstraints += "\t\t\t\t\t</Dependent>\n";
			});
			refConstraints = "\t\t\t\t<ReferentialConstraint>\n" + refConstraints;
			refConstraints += "\t\t\t\t</ReferentialConstraint>\n";
			return refConstraints;
		},
		createNavigationsProps: function () {
			var entityNavigations = "";
			var projetectName = this.getOwnerComponent().getModel("oDataService").getProperty("/projectName");
			var allNavigations = this.getView().byId("navPropsTable").getItems();
			allNavigations.forEach(function (oNavigation) {
				entityNavigations += '< NavigationProperty Name = "' + oNavigation.getCells()[0].getValue() + '"' +
					'sap: label = "' + oNavigation.getCells()[2].getValue() + '"' +
					'ToRole = "ToRole_' + oNavigation.getCells()[1].getValue() + '"' +
					'FromRole = "FromRole_' + oNavigation.getCells()[1].getValue() + '"' +
					'Relationship = "' + projetectName + "_SRV." + oNavigation.getCells()[1].getValue() + " / > ";
			});
			return entityNavigations;
		}
	};
	return Module;
});