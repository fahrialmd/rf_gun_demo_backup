sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/m/MessageToast',
    'sap/ui/core/routing/History',
  ],
  function (Controller, MessageToast, History) {
    'use strict';

    return Controller.extend('rfgundemo.controller.DataDetail', {
      onInit: function () {
        var that = this;
        var oRouter = this.getOwnerComponent().getRouter();

        oRouter.attachRouteMatched(function (oEvent) {
          var oArgs = oEvent.getParameter('arguments');
          if (oArgs && oArgs.purchaseOrderNumber) {
            that.getView().setBusy(true);
            that._loadPurchaseOrderData(oArgs.purchaseOrderNumber);
            that._setOrderDetailsTitle(oArgs.purchaseOrderNumber);
          }
        });

        this._attachInputEventDelegates();
      },

      onNavBack: function () {
        var oHistory = History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo('RouteMainScreen', {}, true);
        }
      },

      onSaveAndPostButtonPress: function () {
        MessageToast.show('Save and Post logic to be implemented.');
      },

      _attachInputEventDelegates: function () {
        var oDataDetailPage = this.byId('dataDetailPage');
        if (oDataDetailPage) {
          oDataDetailPage.addEventDelegate({
            onkeydown: function (oEvent) {
              if (oEvent.key === 'F3') {
                oEvent.preventDefault();
                this.onNavBack();
              } else if (oEvent.key === 'F8') {
                oEvent.preventDefault();
                this.onSaveAndPostButtonPress();
              }
            }.bind(this),
          });
        }
      },

      _loadPurchaseOrderData: function (sPurchaseOrder) {
        var sPath =
          "/ZR_RF_PO_ITEM_MAIN_BETA(P_PurchaseOrderNo='" +
          sPurchaseOrder.trim() +
          "')/Set";

        var oList = this.byId('orderList');
        oList.bindItems({
          path: sPath,
          template: this.byId('orderList').getItems()[0].clone(),
          events: {
            dataReceived: function (oEvent) {
              this.getView().setBusy(false);
              if (!oEvent.getParameters().data) {
                MessageToast.show(
                  'No data found for Purchase Order: ' + sPurchaseOrder
                );
              } else {
                // Use setTimeout to ensure the DOM is rendered
                setTimeout(() => {
                  var oFirstItem = oList.getItems()[0];
                  if (oFirstItem) {
                    // Assuming a standard way to find the input
                    var oInput = oFirstItem
                      .getContent()[0]
                      ?.getItems()[4]
                      ?.getItems()[1];

                    if (oInput) {
                      oInput.focus();
                    } else {
                      console.warn('Quantity Receive Input not found');
                    }
                  } else {
                    console.warn('First item not found');
                  }
                }, 100); // Adjust delay as needed
              }
            }.bind(this),
            dataRequested: function () {},
          },
        });
      },

      _setOrderDetailsTitle: function (sPurchaseOrder) {
        var oTitle = this.byId('orderDetailsTitle');
        if (oTitle) {
          oTitle.setText('Order Details for ' + sPurchaseOrder);
        }
      },
    });
  }
);
