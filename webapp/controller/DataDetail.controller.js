sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/m/MessageToast',
    'sap/ui/core/routing/History',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
  ],
  (Controller, MessageToast, History, JSONModel, Filter, FilterOperator) => {
    'use strict';

    return Controller.extend('rfgundemo.controller.DataDetail', {
      onInit() {
        const that = this;
        const oRouter = this.getOwnerComponent().getRouter();

        oRouter.attachRouteMatched(
          function (oEvent) {
            const oArgs = oEvent.getParameter('arguments');
            if (oArgs && oArgs.purchaseOrderNumber) {
              that.getView().setBusy(true);
              that
                ._loadPurchaseOrderData(oArgs.purchaseOrderNumber)
                .then(() => {
                  that.getView().setBusy(false);
                })
                .catch(() => {
                  that.getView().setBusy(false);
                });
            }
          }.bind(this)
        );

        this._attachInputEventDelegates();
      },

      onNavBack: function () {
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo('RouteMainScreen', {}, true);
        }
      },

      onSaveAndPostButtonPress: function () {
        const oList = this.byId('orderList');
        const aSelectedItems = oList.getSelectedItems();
        const aSelectedData = [];

        aSelectedItems.forEach(item => {
          const oItemData = {};
          const oInputs = item.getContent()[0].getItems();

          oItemData['lineNo'] = oInputs[0].getItems()[1].getValue();
          oItemData['material'] = oInputs[1].getItems()[1].getValue();
          oItemData['materialDesc'] = oInputs[2].getItems()[1].getValue();
          oItemData['quantitySuggest'] = oInputs[3].getItems()[1].getValue();
          oItemData['quantityReceive'] = oInputs[4].getItems()[1].getValue();
          oItemData['plant'] = oInputs[5].getItems()[1].getValue();
          oItemData['storageLocation'] = oInputs[6].getItems()[1].getValue();

          aSelectedData.push(oItemData);
        });

        console.log('Data from Selected Items:', aSelectedData);
      },

      _attachInputEventDelegates: function () {
        const oDataDetailPage = this.byId('dataDetailPage');
        if (oDataDetailPage) {
          oDataDetailPage.addEventDelegate({
            onkeydown: oEvent => {
              if (oEvent.key === 'F3') {
                oEvent.preventDefault();
                this.onNavBack();
              } else if (oEvent.key === 'F8') {
                oEvent.preventDefault();
                this.onSaveAndPostButtonPress();
              }
            },
          });
        }
      },

      _loadPurchaseOrderData: function (sPurchaseOrder) {
        const oPurchaseOrderModel =
          this.getOwnerComponent().getModel('purchaseOrder');

        return new Promise(resolve => {
          if (!oPurchaseOrderModel) {
            const oNewModel = new JSONModel({
              purchaseOrderNumber: '',
              items: [],
            });

            this.getOwnerComponent().setModel(oNewModel, 'purchaseOrder');
            this._loadPurchaseOrderDataFromService(sPurchaseOrder).then(
              resolve
            );
          } else {
            const aItems = oPurchaseOrderModel.getProperty('/items') || [];
            if (Array.isArray(aItems) && aItems.length > 0) {
              this._bindDataToList(aItems);
              resolve();
            } else {
              this._loadPurchaseOrderDataFromService(sPurchaseOrder).then(
                resolve
              );
            }
          }
        });
      },

      _loadPurchaseOrderDataFromService: function (sPurchaseOrder) {
        const oModel = this.getView().getModel();
        const sPath = `/ZR_RF_PO_ITEM_MAIN_BETA(P_PurchaseOrderNo='${sPurchaseOrder.trim()}')/Set`;
        const oListBinding = oModel.bindList(sPath);

        return oListBinding.requestContexts().then(
          function (aContexts) {
            if (aContexts.length === 0) {
              MessageToast.show(
                `No data found for Purchase Order: ${sPurchaseOrder}`
              );
              return;
            }

            const oPurchaseOrderModel =
              this.getOwnerComponent().getModel('purchaseOrder');
            oPurchaseOrderModel.setProperty(
              '/purchaseOrderNumber',
              sPurchaseOrder
            );
            oPurchaseOrderModel.setProperty(
              '/items',
              aContexts.map(oContext => oContext.getObject())
            );

            this._bindDataToList(
              aContexts.map(oContext => oContext.getObject())
            );
          }.bind(this),
          function () {
            MessageToast.show(
              `Error retrieving data for Purchase Order: ${sPurchaseOrder}`
            );
          }.bind(this)
        );
      },

      _bindDataToList: function (aItems) {
        const oList = this.byId('orderList');
        oList.bindItems({
          path: 'purchaseOrder>/items',
          factory: this._createListItem.bind(this),
          templateShareable: false,
        });

        // Focus on the 'Quantity Receive' input for the first item after all items are rendered.
        oList.attachEventOnce('updateFinished', function () {
          setTimeout(() => {
            const oItems = oList.getItems();
            if (oItems.length > 0) {
              const oInput = oItems[0]
                .getContent()[0]
                .getItems()[4]
                .getItems()[1];
              if (oInput) {
                oInput.focus();
              }
            }
          }, 500);
        });
      },

      _createListItem: function (sId, oContext) {
        return new sap.m.CustomListItem(sId, {
          content: [
            new sap.m.HBox({
              items: [
                new sap.m.VBox({
                  items: [
                    new sap.m.Label({
                      text: 'Line No',
                      labelFor: `${sId}-purchaseOrderItemNoInput`,
                    }),
                    new sap.m.Input({
                      id: `${sId}-purchaseOrderItemNoInput`,
                      value: '{purchaseOrder>PurchaseOrderItemNo}',
                      editable: false,
                    }),
                  ],
                }).addStyleClass('sapUiSmallMargin'),
                new sap.m.VBox({
                  items: [
                    new sap.m.Label({
                      text: 'Material',
                      labelFor: `${sId}-materialInput`,
                    }),
                    new sap.m.Input({
                      id: `${sId}-materialInput`,
                      value: '{purchaseOrder>Material}',
                      editable: false,
                    }),
                  ],
                }).addStyleClass('sapUiSmallMargin'),
                new sap.m.VBox({
                  items: [
                    new sap.m.Label({
                      text: 'Material Desc',
                      labelFor: `${sId}-materialDescriptionInput`,
                    }),
                    new sap.m.Input({
                      id: `${sId}-materialDescriptionInput`,
                      value: '{purchaseOrder>MaterialDescription}',
                      editable: false,
                    }),
                  ],
                }).addStyleClass('sapUiSmallMargin'),
                ,
                new sap.m.VBox({
                  items: [
                    new sap.m.Label({
                      text: 'Quantity Suggest',
                      labelFor: `${sId}-quantitySuggestInput`,
                    }),
                    new sap.m.Input({
                      id: `${sId}-quantitySuggestInput`,
                      value: '{purchaseOrder>QuantitySuggest}',
                      editable: false,
                    }),
                  ],
                }).addStyleClass('sapUiSmallMargin'),
                ,
                new sap.m.VBox({
                  items: [
                    new sap.m.Label({
                      text: 'Quantity Receive',
                      labelFor: `${sId}-quantityReceiveInput`,
                    }),
                    new sap.m.Input({
                      id: `${sId}-quantityReceiveInput`,
                      value: '',
                    }),
                  ],
                }).addStyleClass('sapUiSmallMargin'),
                ,
                new sap.m.VBox({
                  items: [
                    new sap.m.Label({
                      text: 'Plant',
                      labelFor: `${sId}-plantInput`,
                    }),
                    new sap.m.Input({
                      id: `${sId}-plantInput`,
                      value: '{purchaseOrder>Plant}',
                    }),
                  ],
                }).addStyleClass('sapUiSmallMargin'),
                ,
                new sap.m.VBox({
                  items: [
                    new sap.m.Label({
                      text: 'Storage Location',
                      labelFor: `${sId}-storageLocationInput`,
                    }),
                    new sap.m.Input({
                      id: `${sId}-storageLocationInput`,
                      value: '{purchaseOrder>StorageLocation}',
                    }),
                  ],
                }).addStyleClass('sapUiSmallMargin'),
                ,
                new sap.m.VBox({
                  items: [
                    new sap.m.Label({
                      text: 'Confirm Status',
                      labelFor: `${sId}-confirmStatusButton`,
                    }),
                    new sap.m.Button({
                      id: `${sId}-confirmStatusButton`,
                      text: 'OK',
                      width: '100%',
                    }),
                  ],
                }).addStyleClass('sapUiSmallMargin'),
                ,
              ],
            }),
          ],
        });
      },
    });
  }
);
