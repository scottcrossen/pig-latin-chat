amount_of_messages=25;
angular.module('app', ['angularModalService'])
.config(function($httpProvider) {
    $httpProvider.defaults.transformRequest = function(data) {        
        if (data === undefined) { return data; } 
        return $.param(data);
    };
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'; 
}).controller('mainCtrl', ['$scope', '$http', '$interval', 'ModalService', function($scope, $http, $interval, ModalService) {
    update_messages=function($scope, $http){
	$http({
	    method : "GET",
	    url : "http://ec2-35-161-98-124.us-west-2.compute.amazonaws.com:8080/messages",
	    port: 8080
	}).then(function(response) {
	    console.log("Get request suceeded");
            console.log("Get request finished with response:");
	    console.log(response.data);
	    $scope.messages=response.data;
	}, function(response){
	    console.log("Get request failed");
            console.log("Get request finished with response:");
	    console.log(response.data);
	});
	return $scope.messages;
    }
    new_message=function($scope, $http, txt){
	if($scope.messages[0].text == "Error in retrieving messages") $scope.messages.shift();
	if($scope.messages.length>=amount_of_messages) $scope.messages.shift();
	if(!contains($scope.messages, txt)) $scope.messages.push({name: convert_name($scope.name), text: txt});
	// It turns out that there is a problem with angular's http poster so we'll use ajax.
	$.ajax({
	    dataType: undefined,
	    type: "POST",
	    url : "http://ec2-35-161-98-124.us-west-2.compute.amazonaws.com:8080/messages",
	    port: 8080,
	    data: {
		name: convert_name($scope.name),
		text: txt
	    },
	}).done(function(response) {
	    console.log("Post request suceeded");
	    $scope.messages=response;
	}).fail(function(response) {
	    console.log("Post request failed")
	}).always(function(response){
	    console.log("Post request finished with response:");
	    console.log(response);
	    update_messages($scope, $http);
	});
	/*
	  $http({
	  method : "POST",
	  url : "http://ec2-35-161-98-124.us-west-2.compute.amazonaws.com:8080/messages",
	  port: 8080,
	  data: {
	  message: text
	  },
	  headers: {
          "Content-Type": undefined
	  }
	  }).then(function(response) {
	  console.log(response);
	  $scope.messages=response.data;
	  }, function(response){
	  console.log(response);
	  });*/
	return $scope.messages;
    };
    $scope.toggle_pig1=function(){
	$scope.pig1=($scope.pig1=="./pig-curly-ears.png" ? "./pig-pointy-ears.png" : "./pig-curly-ears.png")
    };
    $scope.toggle_pig2=function(){
	$scope.pig2=($scope.pig2=="./pig-side-face.png" ? "./pig-straight-face.png" : "./pig-side-face.png")
    };
    $scope.show = function() {
        ModalService.showModal({
            templateUrl: 'modal.html',
            controller: "ModalController"
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
		if(result != undefined && result.first != undefined && result.first.length > 0){
		    $scope.name.first=capitalize_first(result.first);
		    $scope.name.last=capitalize_first(result.last);
		    $scope.name.handle=find_handle(result.first.toLowerCase());
		}
		else{
		    $scope.name= {
			first: "Anonymous",
			Last:"",
			handle:"Unknown Pig"
		    }
		    $scope.show();
		}
            });
        });
    };
    $scope.translate = function(input) {
	translate=function(text){
	    if (text=="" || text==null || text == undefined) return "";
	    english_array=text.replace(/[^\w\s]|_/g, function ($1) { return ' ' + $1 + ' ';}).replace(/[ ]+/g, ' ').split(' ');
	    translate_word=function(word){
		switch (word.toLowerCase().search(/[aeiuo]/)){
		case 0: return word.toLowerCase()+"way"; break;
		case -1: return word.toLowerCase()+"ay"; break;
		default: return word.toLowerCase().replace(/([^aeiou]*)([aeiou])(\w*)/, "$2$3$1ay"); break;
		}
	    }
	    latin_array=[];
	    for (i in english_array){
		if(!(/[^\w\s]|_/g.test(english_array[i])) && !(english_array[i]==""))
		    latin_array.push(translate_word(english_array[i]));
		else latin_array.push(english_array[i]);
	    }
	    return latin_array.join(" ").replace(/\s[^\w\s]|_/g, function($1){return $1.substring(1)});
	};
	console.log("Translate button clicked");
	if (input != null && input != undefined){
	    new_message($scope, $http, translate(input.text));
	}
    };
    $scope.refresh = function(){
	console.log("Refresh button clicked");
	update_messages($scope, $http);
    };
    find_handle=function(name){
	pig_names=[
	    "Ace",
	    "Babe",
	    "Gouger",
	    "Snouter",
	    "Rooter",
	    "Tusker",
	    "Gryllus",
	    "Hamilton",
	    "Henry the Pig",
	    "Hercules",
	    "Jodie",
	    "Little Pig Robinson",
	    "Old Major",
	    "Olivia",
	    "Piglet",
	    "Positive Pig",
	    "Toby the Lear,ned Pig",
	    "The Transcendent Pig",
	    "Napoleon",
	    "Wilbur",
	    "Mandachuva",
	    "Leaf-eater",
	    "Star-looker",
	    "Planter",
	    "Snowball",
	    "Squealer"
	];
	return pig_names[name.charCodeAt(0)-97];
    };
    convert_name=function(name){
	return name.handle+" ("+name.first+" "+name.last+")";
    };
    console.log("Angular initialized!");
    $scope.messages = [{text:"Error in retrieving messages"}];
    $scope.name={first: "Anonymous", last: "", handle: "Unknown Pig"}
    $scope.pig1="./pig-curly-ears.png";
    $scope.pig2="./pig-side-face.png";
    $scope.show();
    $interval($scope.refresh, 3000);
    $interval($scope.toggle_pig1, 5000);
    $interval($scope.toggle_pig2, 4000);
}]).controller('ModalController', function($scope, close) {
    $scope.close = function(result) {
 	close(result, 500);
    };
});
contains=function(array, object) {
    for (var i = 0; i < array.length; i++)
        if (array[i].text === object)
            return true;
    return false;
};
capitalize_first=function (string) {
    if(string != undefined && string.length >0)
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    else
	return "";
}
