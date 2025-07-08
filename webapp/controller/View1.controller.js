sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/SelectDialog",
    "sap/m/StandardListItem",
    "sap/m/Dialog",
    "sap/ui/core/HTML",
    "sap/ui/model/json/JSONModel",
  ],
  (
    Controller,
    MessageToast,
    SelectDialog,
    StandardListItem,
    Dialog,
    HTML,
    JSONModel
  ) => {
    "use strict";

    return Controller.extend("rfgundemo.controller.View1", {
      onInit() {
        this._attachInputEventDelegates();

        // Initialize a JSON model to handle image data
        const oImageModel = new JSONModel({
          capturedImage: "",
        });
        this.getView().setModel(oImageModel, "imageData");
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

      onCameraPress: function () {
        if (!this._oCameraDialog) {
          this._oCameraDialog = new Dialog({
            title: "Live Camera",
            content: [
              new HTML({
                content:
                  '<video id="cameraVideo" autoplay playsinline style="width: 100%;"></video>' +
                  '<canvas id="photoCanvas" style="display:none;"></canvas>',
              }),
            ],
            buttons: [
              {
                text: "Capture",
                press: this._captureImage.bind(this),
              },
              {
                text: "Close",
                press: () => {
                  this._stopCamera();
                  this._oCameraDialog.close();
                },
              },
            ],
            afterOpen: () => {
              this._startCamera();
            },
          });

          this.getView().addDependent(this._oCameraDialog);
        }
        this._oCameraDialog.open();
      },

      _captureImage: function () {
        const video = document.getElementById("cameraVideo");
        const canvas = document.getElementById("photoCanvas");

        if (
          video instanceof HTMLVideoElement &&
          canvas instanceof HTMLCanvasElement
        ) {
          const context = canvas.getContext("2d");

          // Set the canvas size to match the video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw the video frame to the canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert the canvas to an image data URL
          const imageDataUrl = canvas.toDataURL("image/png");

          // Update the model with the new image data URL
          const oModel = this.getView().getModel("imageData");
          oModel.setProperty("/capturedImage", imageDataUrl);

          // Stop the camera and close the dialog
          this._stopCamera();
          if (this._oCameraDialog) {
            this._oCameraDialog.close();
          }
        } else {
          MessageToast.show(
            "Error capturing image. Video or canvas element not found."
          );
        }
      },

      _startCamera: function () {
        const video = document.getElementById("cameraVideo");

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
              // Cast the video element to HTMLVideoElement
              if (video instanceof HTMLVideoElement) {
                video.srcObject = stream;
              }
              this._stream = stream; // Save stream for stopping later
            })
            .catch((error) => {
              MessageToast.show("Error accessing camera: " + error.message);
            });
        } else {
          MessageToast.show("Camera access is not supported.");
        }
      },

      _stopCamera: function () {
        if (this._stream) {
          this._stream.getTracks().forEach((track) => track.stop());
          this._stream = null;
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
              path: "/ZC_EWM_RF_GUN",
              template: new StandardListItem({
                title: "{scan_hu}",
                description: "{site}",
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

      onPostDataToBackend: function () {
        const oModel = this.getView().getModel();
        const oInputPlant = this.byId("plantPost");
        const oWarehouseType = this.byId("warehouseTypePost");
        const sInputPlantValue = oInputPlant.getValue();
        const sWarehouseTypeValue = oWarehouseType.getValue();

        console.log("oModel:", oModel);
        console.log(
          "Input Plant Value:",
          sInputPlantValue,
          "Warehouse Type Value:",
          sWarehouseTypeValue
        );
        const body = {
          scan_hu: sInputPlantValue,
          site: sWarehouseTypeValue,
        };

        const oModelBinding = oModel.bindList("/ZC_EWM_RF_GUN");
        oModelBinding
          .create(body)
          .created()
          .then(() => {
            MessageToast.show("Data posted successfully");
            oInputPlant.setValue("");
            oWarehouseType.setValue("");
          })
          .catch((oError) => {
            console.error("Error posting data:", oError);
            MessageToast.show("Error posting data: " + oError.message);
          });
      },
    });
  }
);
