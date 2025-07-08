sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast"],
  (Controller, MessageToast) => {
    "use strict";

    return Controller.extend("rfgundemo.controller.MainScreen", {
      onInit() {
        const oRouter = this.getOwnerComponent().getRouter();
        const oModel = this.getOwnerComponent().getModel();
        oRouter.attachRouteMatched(
          function (oEvent) {
            oModel.refresh();
          }.bind(this)
        );
      },

      onPurchaseOrderSubmit: function () {
        const oPurchaseOrderInput = this.byId("purchaseOrderNumber");
        const sPurchaseOrder = oPurchaseOrderInput.getValue();

        if (!sPurchaseOrder) {
          oPurchaseOrderInput.setValueState("Error");
          oPurchaseOrderInput.setValueStateText(
            "Purchase Order number is required."
          );
          return;
        } else {
          oPurchaseOrderInput.setValueState("None");
          oPurchaseOrderInput.setValueStateText("");

          // TODO: Validate the input format
          // Check if the input is valid from the OData Service

          const oModel = this.getView().getModel();
          const sPath = `/ZR_RF_PO_ITEM(PurchaseOrderNo='4500000001')`;
          const oContext = oModel.bindContext(sPath);
          console.log("Binding context:", oContext);
          const oPurchaseOrderData = oContext.requestObject();
          console.log("Purchase Order Data:", oPurchaseOrderData);
          // const oBindingContext = oModel.bindList(
          //   "/ZR_RF_PO_ITEM",
          //   null,
          //   null,
          //   new sap.ui.model.Filter({
          //     path: "PurchaseOrder",
          //     operator: sap.ui.model.FilterOperator.EQ,
          //     value1: sPurchaseOrder,
          //   })
          // );
          // console.log("Binding context:", oBindingContext);
          // oBindingContext
          //   .requestContexts()
          //   .then(
          //     function (aContexts) {
          //       // Check if any contexts are returned
          //       if (aContexts.length > 0) {
          //         // Purchase Order found
          //         MessageToast.show(
          //           `Purchase Order ${sPurchaseOrder} found. Navigating to detail.`
          //         );
          //         this._navigateToDetail(sPurchaseOrder);
          //       } else {
          //         // Purchase Order not found
          //         MessageToast.show(
          //           `Purchase Order ${sPurchaseOrder} not found. Please check the number.`
          //         );
          //       }
          //     }.bind(this)
          //   )
          //   .catch(function (oError) {
          //     console.error("Error loading", oError);
          //     MessageToast.show("Error loading data. Please try again.");
          //   });

          this._navigateToDetail(sPurchaseOrder);
        }
      },

      _navigateToDetail: function (sPurchaseOrder) {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteDataDetail", {
          purchaseOrderNumber: sPurchaseOrder,
        });
      },
    });
  }
);
