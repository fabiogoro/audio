/**
 * Created by intelWorx on 19/11/2015.
 * adapted by Ariane Stolfi, 10/01/2017
 */
(function () {
  'use strict';
  angular.module('mdWavesurferApp', ['mdWavesurfer'])
    .config(function ($mdIconProvider) {
      //$mdIconProvider.fontSet('zmdi', 'fontawesome');
    })
    .controller('MainController', ['$scope',
      function ($scope) {

        //to change the name of the samples folder
        $scope.folder = "samples_3/";
        $scope.extension = ".mp3";
        $scope.longList = [];
        
        //to change the number of the files
        //for (var i = 32; i < 126; i++) {
        //special characteres
        //for (var i = 32; i < 64; i++) {
        //maiusculas
        //for (var i = 65; i < 96; i++) {
        //minusculas
        for (var i = 97; i < 126; i++) {

          $scope.longList.push({
            title: i,
            url: $scope.folder + i + $scope.extension,
            itemid: i,
          });
        }
      }])
})();
