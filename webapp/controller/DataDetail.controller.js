sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  (Controller, MessageToast, History, JSONModel, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("rfgundemo.controller.DataDetail", {
      onInit() {
        const oRouter = this.getOwnerComponent().getRouter();
        const oModel = this.getOwnerComponent().getModel();

        const oPurchaseOrderModel = new JSONModel({
          purchaseOrderNumber: "",
        });

        this.getView().setModel(oPurchaseOrderModel, "purchaseOrder");

        oRouter.attachRouteMatched(function (oEvent) {
          const oArgs = oEvent.getParameter("arguments");
          if (oArgs && oArgs.purchaseOrderNumber) {
            const sPurchaseOrder = oArgs.purchaseOrderNumber;
            oPurchaseOrderModel.setProperty(
              "/purchaseOrderNumber",
              sPurchaseOrder
            );
          }
          oModel.refresh();
        });

        const oList = this.byId("orderList");
        console.log("Order List:", oList);

        const oBinding = oList.getBinding("items");
        const sPONumber = oPurchaseOrderModel.getProperty(
          "/purchaseOrderNumber"
        );

        if (oBinding) {
          // Create a filter object
          const oFilter = new Filter(
            "PurchaseOrderNo",
            FilterOperator.EQ,
            sPONumber
          );

          // Apply the filter to the list binding
          oBinding.filter([oFilter]);
        }
      },

      onNavBack: function () {
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("RouteMainScreen", {}, true);
        }
      },

      _applyPurchaseOrderFilter: function (sPurchaseOrder) {
        const oList = this.byId("orderList");
        const oBinding = oList.getBinding("items");

        if (oBinding) {
          // Create a filter object
          const oFilter = new Filter(
            "PurchaseOrderNo",
            FilterOperator.EQ,
            sPurchaseOrder
          );

          // Apply the filter to the list binding
          oBinding.filter([oFilter]);
        }
      },
    });
  }
);
