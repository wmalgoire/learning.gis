/**
* Date: 08.12.2014
* Author: YM
* Class: CampaignBrowser
*
* This class is used to let the user browser for campaign. This will refresh the mapservice with a querydefinition filtering for the given campaign
*/
define(
  ["dojo/_base/declare", "widgets/_BaseWidget"],

  function (declare, BaseWidget) {

      return declare(BaseWidget, {
          allCampaigns: null,
          currentCampaignId: -1,
          isLast:false,
          isFirst:false,


          /**
          * Initialize the tool
          **/
          initialize: function () {
              var _this = this;
              this.dynamicLayer.suspend();
              $("#campaignPrevImg").click(function () {
                  _this.gotoPrev();
              });

              $("#campaignNextImg").click(function () {
                  _this.gotoNext();
              });

              this.loadCampaignList();
          },


          /**
          * Loads the list of campaign through an Ajax call
          **/
          loadCampaignList: function () {
              var _this = this;
              $.get('/Nav/GetAllCampaigns', null, function (data) {
                  _this.allCampaigns = data;
                  var campaignParam = _this.getParameterByName("campaignId");

                  _this.displayCampaignWithId(campaignParam);

                  $('#CampaignBrowseTool').show();
                  _this.dynamicLayer.resume();
              });
          },


          /**
          * Displays a campaign
          * PARAMS:
          *     - campaignId: the id of the campaign to be displayed
          **/
          displayCampaignWithId: function (campaignId) {

              var campaign = this.getCampaign(campaignId);

              this.displayCampaign(campaign);
          },



          /**
          * Displays a campaign
          * PARAMS:
          *     - campaign: the campaign to be displayed
          **/
          displayCampaign: function (campaign) {

              if (campaign) {
                  this.currentCampaignId = campaign.Id;
                  $('#campaignTxt').text(campaign.Name);

                  if (campaign.Id == this.allCampaigns[this.allCampaigns.length - 1].Id) {
                      this.isLast = true;
                      $("#campaignNextImg").addClass("campaigndisabled");
                  }
                  else {
                      this.isLast = false;
                      $("#campaignNextImg").removeClass("campaigndisabled");
                  }

                  if (campaign.Id == this.allCampaigns[0].Id) {
                      this.isFirst = true;
                      $("#campaignPrevImg").addClass("campaigndisabled");
                  }
                  else {
                      this.isFirst = false;
                      $("#campaignPrevImg").removeClass("campaigndisabled");
                  }

                  this.updateLayerDefs();

              }
              else {
                  $('#campaignTxt').text("Unknown campaign " + campaignId)
              }
          },



          /**
          * Updates the layer definitions to set the campaign reference
          **/
          updateLayerDefs:function(){
              if (this.dynamicLayer) {
                  var layerDefs = [];
                  layerDefs[0] = "CampaignID=" + this.currentCampaignId;

                  this.dynamicLayer.setLayerDefinitions(layerDefs);
              }
          },



          /**
          * Loads the next Campaign
          **/
          gotoNext: function () {
              if (!this.isLast && this.currentCampaignId != -1) {
                  var nextCampaign = null;

                  for (var index = 0; index < this.allCampaigns.length; index++) {
                      if (this.allCampaigns[index].Id + "" == this.currentCampaignId + "") {
                          nextCampaign = this.allCampaigns[index + 1];
                          break;
                      }
                  }

                  this.displayCampaign(nextCampaign);
              }

          },


          /**
          * Loads the next Campaign
          **/
          gotoPrev: function () {
              if (!this.isFirst && this.currentCampaignId != -1) {
                  var prevCampaign = null;

                  for (var index = 0; index < this.allCampaigns.length; index++) {
                      if (this.allCampaigns[index].Id + "" == this.currentCampaignId + "") {
                          prevCampaign = this.allCampaigns[index - 1];
                          break;
                      }
                  }

                  this.displayCampaign(prevCampaign);
              }

          },



          /**
          * Returns a campaign from its Id
          * PARAMS:
          *    - campaignId: the id of the campaign to get
          **/
          getCampaign: function (campaignId) {
              for (var index = 0; index < this.allCampaigns.length; index++) {
                  if (this.allCampaigns[index].Id+"" == campaignId+"") {
                      return this.allCampaigns[index];
                  }
              }
              return null;
          }
      });
  }
);
