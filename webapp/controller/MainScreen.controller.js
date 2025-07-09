sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/m/MessageToast',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/json/JSONModel',
  ],
  (Controller, MessageToast, Filter, FilterOperator, JSONModel) => {
    'use strict';

    return Controller.extend('rfgundemo.controller.MainScreen', {
      onInit() {
        const oPurchaseOrderModel = new JSONModel({
          purchaseOrderNumber: '',
          items: [],
        });

        this.getOwnerComponent().setModel(oPurchaseOrderModel, 'purchaseOrder');
        const oRouter = this.getOwnerComponent().getRouter();
        const oModel = this.getOwnerComponent().getModel();
        oRouter.attachRouteMatched(
          function (oEvent) {
            oModel.refresh();
          }.bind(this)
        );
      },

      onPurchaseOrderSubmit: function () {
        const oPurchaseOrderInput = this.byId('purchaseOrderNumber');
        const sPurchaseOrder = oPurchaseOrderInput.getValue();

        if (!sPurchaseOrder) {
          oPurchaseOrderInput.setValueState('Error');
          oPurchaseOrderInput.setValueStateText(
            'Purchase Order number is required.'
          );
          oPurchaseOrderInput.focus();
          return;
        }
        oPurchaseOrderInput.setValueState('None');
        oPurchaseOrderInput.setValueStateText('');

        this.getView().setBusy(true);
        this._checkPurchaseOrder(sPurchaseOrder);
      },

      _checkPurchaseOrder: function (sPurchaseOrder) {
        const oModel = this.getView().getModel();
        const sPath =
          "/ZR_RF_PO_ITEM_MAIN_BETA(P_PurchaseOrderNo='" +
          sPurchaseOrder.trim() +
          "')/Set";
        const oListBinding = oModel.bindList(sPath);

        oListBinding.requestContexts().then(
          function (aContexts) {
            this.getView().setBusy(false);
            if (aContexts.length === 0) {
              MessageToast.show(
                'No data found for Purchase Order: ' + sPurchaseOrder
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

            this._navigateToDetail(sPurchaseOrder);
          }.bind(this),
          function () {
            this.getView().setBusy(false);
            MessageToast.show(
              'Error retrieving data for Purchase Order: ' + sPurchaseOrder
            );
          }.bind(this)
        );
      },

      _navigateToDetail: function (sPurchaseOrder) {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo('RouteDataDetail', {
          purchaseOrderNumber: sPurchaseOrder,
        });
      },
    });
  }
);
