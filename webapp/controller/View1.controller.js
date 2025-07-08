sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/SelectDialog",
    "sap/m/StandardListItem",
  ],
  (Controller, MessageToast, SelectDialog, StandardListItem) => {
    "use strict";

    return Controller.extend("rfgundemo.controller.View1", {
      onInit() {
        this._attachInputEventDelegates();
      },

      _attachInputEventDelegates: function () {
        // Attach event delegates to the input fields F7 key handling
        const oPlantInput = this.byId("plantInput");
        const oWarehouseInput = this.byId("warehouseTypeInput");

        if (oPlantInput) {
          oPlantInput.addEventDelegate({
            onkeydown: (oEvent) => {
              if (oEvent.key === "F7") {
                // Prevent default action for F7 and Enter keys
                oEvent.preventDefault();
                this.onPlantValueHelp();
              }
            },
          });
        }

        if (oWarehouseInput) {
          oWarehouseInput.addEventDelegate({
            onkeydown: (oEvent) => {
              if (oEvent.key === "F7") {
                // Prevent default action for F7 and Enter keys
                oEvent.preventDefault();
                this.onWarehouseTypeValueHelp();
              }
            },
          });
        }
      },

      onPlantValueHelp: function () {
        this._openPlantSelectDialog();
      },

      onWarehouseTypeValueHelp: function () {
        this._openWarehouseTypeSelectDialog();
      },

      onInputLiveChange: function (oEvent) {
        const oInput = oEvent.getSource();
        // this._validateInput(oInput);
      },

      onPlantSubmit: function (oEvent) {
        const bAllValid = this._validateAllInputs();
        if (bAllValid) {
          const oSelect = this.byId("countingMethodSelect");
          oSelect.setVisible(true);

          setTimeout(() => {
            oSelect.focus();
          }, 0);
        }
        // const oInput = oEvent.getSource();
        // this._validateInput(oInput);
        // if (oInput.getValueState() === "None") {
        //   MessageToast.show("Plant submitted: " + oInput.getValue());
        // } else {
        //   MessageToast.show("Please correct the input before submitting.");
        // }
      },

      onWarehouseTypeSubmit: function (oEvent) {
        const bAllValid = this._validateAllInputs();
        if (bAllValid) {
          const oSelect = this.byId("countingMethodSelect");
          oSelect.setVisible(true);

          setTimeout(() => {
            oSelect.focus();
          }, 0);
        }
      },

      //   _validateInput: function (oInput) {
      //     const sValue = oInput.getValue();
      //     console.log("Validating input:", sValue);
      //     // Reset value state
      //     oInput.setValueState("None");
      //     if (sValue.length === 0) {
      //       oInput.setValueState("Error");
      //       oInput.setValueStateText("This field cannot be empty!");
      //     } else {
      //       oInput.setValueState("None");
      //     }
      //   },

      _validateAllInputs: function () {
        const aInputs = [
          this.byId("plantInput"),
          this.byId("warehouseTypeInput"),
        ];
        let bAllValid = true;
        let sMessages = "";

        aInputs.forEach((oInput) => {
          const sValue = oInput.getValue();
          if (sValue.length === 0) {
            oInput.setValueState("Error");
            sMessages += `${oInput.getPlaceholder()} is required. `;
            bAllValid = false;
            setTimeout(() => {
              oInput.focus();
            }, 0);
          } else {
            oInput.setValueState("None");
          }
        });

        const oMessageStrip = this.byId("validationMessageStrip");
        if (!bAllValid) {
          oMessageStrip.setText(sMessages);
          oMessageStrip.setType("Error");
          oMessageStrip.setVisible(true);
          aInputs[0].focus();
        } else {
          oMessageStrip.setVisible(false);
        }

        return bAllValid;
      },

      _openPlantSelectDialog: function () {
        if (!this._oSelectPlantDialog) {
          this._oSelectPlantDialog = new SelectDialog({
            noDataText: "No plants available",
            title: "Select Plant",
            items: {
              path: "/ZC_EWM_PLANT",
              template: new StandardListItem({
                title: "{Plant}",
                description: "{PlantName}",
              }),
            },
            confirm: (oEvent) => {
              const oSelectedItem = oEvent.getParameter("selectedItem");
              const oInput = this.byId("plantInput");
              if (oSelectedItem) {
                this.byId("plantInput").setValue(oSelectedItem.getTitle());
                this._validateInput(oInput);
              } else {
                MessageToast.show("No plant selected");
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
            noDataText: "No warehouse type available",
            title: "Select Warehouse Type",
            items: {
              path: "/ZC_EWM_WAREHOUSE_TYPE",
              template: new StandardListItem({
                title: "{warehouse_type}",
                description: "{warehouse_type}",
              }),
            },
            confirm: (oEvent) => {
              const oSelectedItem = oEvent.getParameter("selectedItem");
              const oInput = this.byId("warehouseTypeInput");
              if (oSelectedItem) {
                this.byId("warehouseTypeInput").setValue(
                  oSelectedItem.getTitle()
                );
                this._validateInput(oInput);
              } else {
                MessageToast.show("No warehouse type selected");
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
