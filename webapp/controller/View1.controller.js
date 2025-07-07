sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/m/MessageToast', 'sap/m/SelectDialog'],
  (Controller, MessageToast, SelectDialog) => {
    'use strict';

    return Controller.extend('rfgundemo.controller.View1', {
      onInit() {
        this._currentFocusedField = null;

        // Add event delegate to handle keyup events
        // This ensures the keyup event is handled after the view is rendered
        this.getView().addEventDelegate({
          onAfterRendering: () => {
            // Attach delegates to track focused input
            this.byId('plantInput').addEventDelegate({
              onfocusin: () => {
                this._currentFocusedField = 'plantInput';
              },
            });

            this.byId('warehouseTypeInput').addEventDelegate({
              onfocusin: () => {
                this._currentFocusedField = 'warehouseTypeInput';
              },
            });
            // Attach keyup event to the view
            this.getView().$().on('keydown', this.handleKeyDown.bind(this));
          },
        });
      },

      handleKeyDown: function (oEvent) {
        if (oEvent.which === 118 || oEvent.key === 'F7') {
          this._showContextHelp();
        } else if (oEvent.which === 13 || oEvent.key === 'Enter') {
          MessageToast.show('Enter pressed by user!');
        }
      },

      _showContextHelp: function () {
        console.log('F7 Press:', this._currentFocusedField);
        if (this._currentFocusedField === 'plantInput') {
          this.onPlantValueHelp();
        } else if (this._currentFocusedField === 'warehouseTypeInput') {
          this.onWarehouseTypeValueHelp();
        } else {
          MessageToast.show('Please select a field first');
        }
      },

      onPlantValueHelp: function (oEvent) {
        this._openPlantSelectDialog();
      },

      // Value help handler for Warehouse Type input
      onWarehouseTypeValueHelp: function (oEvent) {
        this._openWarehouseTypeSelectDialog();
      },

      _openPlantSelectDialog: function () {
        if (!this._oSelectPlantDialog) {
          this._oSelectPlantDialog = new SelectDialog({
            noDataText: 'No plants available',
            title: 'Select Plant',
            items: {
              path: '/ZC_EWM_PLANT',
              template: new sap.m.StandardListItem({
                title: '{Plant}',
                description: '{PlantName}',
              }),
            },
            confirm: oEvent => {
              const oSelectedItem = oEvent.getParameter('selectedItem');
              if (oSelectedItem) {
                this.byId('plantInput').setValue(oSelectedItem.getTitle());
              } else {
                MessageToast.show('No plant selected');
              }
            },
          });
        }
        this.getView().addDependent(this._oSelectPlantDialog);
        this._oSelectPlantDialog.open();
      },

      _openWarehouseTypeSelectDialog: function () {
        if (!this._oSelectWarehouseTypeSelectDialog) {
          this._oSelectWarehouseTypeSelectDialog = new SelectDialog({
            noDataText: 'No warehouse type available',
            title: 'Select Warehouse Type',
            items: {
              path: '/ZC_EWM_WAREHOUSE_TYPE',
              template: new sap.m.StandardListItem({
                title: '{warehouse_type}',
                description: '{warehouse_type}',
              }),
            },
            confirm: oEvent => {
              const oSelectedItem = oEvent.getParameter('selectedItem');
              if (oSelectedItem) {
                this.byId('warehouseTypeInput').setValue(
                  oSelectedItem.getTitle()
                );
              } else {
                MessageToast.show('No warehouse type selected');
              }
            },
          });
        }
        this.getView().addDependent(this._oSelectWarehouseTypeSelectDialog);
        this._oSelectWarehouseTypeSelectDialog.open();
      },
    });
  }
);
