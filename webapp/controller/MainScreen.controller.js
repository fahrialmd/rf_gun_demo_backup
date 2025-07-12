sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/m/MessageToast',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
  ],
  (Controller, MessageToast, Filter, FilterOperator) => {
    'use strict';

    /**
     * Controller for the Main Screen view.
     * Handles user input for purchase order and navigation.
     * @namespace rfgundemo.controller
     */
    return Controller.extend('rfgundemo.controller.MainScreen', {
      /**
       * Lifecycle hook that is called when the controller is initialized.
       * Sets up router event handler and keyboard shortcut listeners.
       */
      onInit() {
        // Get the application's router instance
        const oRouter = this.getOwnerComponent().getRouter();

        // Get the default model attached to the component
        const oModel = this.getOwnerComponent().getModel();

        // Refresh model data every time this route is matched
        oRouter.attachRouteMatched(
          function (oEvent) {
            oModel.refresh();
          }.bind(this)
        );

        // Set up keyboard shortcuts like F4
        this._attachInputEventDelegates();
      },

      /**
       * Handler for the "Submit" button or F4 key.
       * Validates input and proceeds to check purchase order data.
       */
      onPurchaseOrderSubmit: function () {
        // Get input field control by ID
        const oPurchaseOrderInput = this.byId('purchaseOrderNumber');

        // Get the user-entered PO number
        const sPurchaseOrder = oPurchaseOrderInput.getValue();

        // Show error if field is empty
        if (!sPurchaseOrder) {
          oPurchaseOrderInput.setValueState('Error');
          oPurchaseOrderInput.setValueStateText(
            'Purchase Order number is required.'
          );
          oPurchaseOrderInput.focus();
          return;
        }

        // Clear error state
        oPurchaseOrderInput.setValueState('None');
        oPurchaseOrderInput.setValueStateText('');

        // Continue to backend validation
        this._checkPurchaseOrder(sPurchaseOrder);
      },

      /**
       * Adds a keyboard event listener for the page.
       * Pressing F4 will trigger PO submission.
       * @private
       */
      _attachInputEventDelegates: function () {
        const oMainScreenPage = this.byId('mainScreenPage');

        if (oMainScreenPage) {
          oMainScreenPage.addEventDelegate({
            onkeydown: oEvent => {
              if (oEvent.key === 'F4') {
                oEvent.preventDefault(); // prevent browser behavior
                this.onPurchaseOrderSubmit(); // call submit
              }
            },
          });
        }
      },

      /**
       * Validates the given Purchase Order number by checking data in the backend.
       * @param {string} sPurchaseOrder - The purchase order number entered by the user
       * @private
       */
      _checkPurchaseOrder: function (sPurchaseOrder) {
        const oModel = this.getView().getModel();

        // Backend entity path to check PO data
        const sPath = '/ZR_RF_PO_ITEM_MAIN_BETA';

        // Create filter to search for matching PO number
        const aFilters = [
          new Filter('PurchaseOrderNo', FilterOperator.EQ, sPurchaseOrder),
        ];

        // Create a binding for the list with the applied filter
        const oTableBinding = oModel.bindList(sPath, null, null, aFilters);

        // Show busy indicator while data is being fetched
        this.getView().setBusy(true);

        // Request data for the filtered binding
        oTableBinding.requestContexts().then(
          function (aContexts) {
            this.getView().setBusy(false);

            // Show message if no data was found
            if (aContexts.length === 0) {
              MessageToast.show(
                'No data found for Purchase Order: ' + sPurchaseOrder
              );
              return;
            }

            // Navigate to the detail screen with the PO number
            this._navigateToDetail(sPurchaseOrder);
          }.bind(this),
          function () {
            // Handle request failure
            this.getView().setBusy(false);
            MessageToast.show(
              'Error retrieving data for Purchase Order: ' + sPurchaseOrder
            );
          }.bind(this)
        );
      },

      /**
       * Navigates to the Data Detail screen with the given Purchase Order number.
       * @param {string} sPurchaseOrder - Purchase order number
       * @private
       */
      _navigateToDetail: function (sPurchaseOrder) {
        const oRouter = this.getOwnerComponent().getRouter();

        // Navigate to detail route and pass the PO number as a parameter
        oRouter.navTo('RouteDataDetail', {
          purchaseOrderNumber: sPurchaseOrder,
        });
      },
    });
  }
);
