sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
  ],
  (Controller, MessageToast, History) => {
    "use strict";

    return Controller.extend("rfgundemo.controller.DataDetail", {
      onInit() {
        const oRouter = this.getOwnerComponent().getRouter();
        const oModel = this.getOwnerComponent().getModel();
        oRouter.attachRouteMatched(
          function (oEvent) {
            const oArgs = oEvent.getParameter("arguments");
            if (oArgs && oArgs.purchaseOrderNumber) {
              const sPurchaseOrder = oArgs.purchaseOrderNumber;
            }
            oModel.refresh();
          }.bind(this)
        );
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
    });
  }
);
