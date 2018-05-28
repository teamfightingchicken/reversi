/* functions for general use */

/* This function returns the value associated with 'whichParam' on the URL */

function getURLParameters(whichParam) {
  var pageURL = window.location.search.substring(1);
  var pageURLVariables = pageURL.split('&');
  for (var i = 0; i < pageURLVariables.length; i++) {
    var paramaterName = pageURLVariables[i].split('=');
    if (paramaterName[0] == whichParam) {
      return paramaterName[1];
    }
  }
}

var username = getURLParameters('username'); // Get username info from the url
if ('undefined' == typeof username || !username) {
  username = 'Anonymous_' + Math.random();
}

var chat_room = getURLParameters('game_id'); // Get chat_room info from the url
if ('undefined' == typeof chat_room || !chat_room) {
  chat_room = 'lobby';
}

/* Connect to the socket server */
var socket = io.connect();

/* What to do when the server sends me a log message */
socket.on('log', function (array) {
  console.log.apply(console, array);
});

/* What to do when the server responds that someone joined a room */
socket.on('join_room_response', function (payload) { // Join room response
  if (payload.result === 'fail') {
    alert(payload.message);
    return;
  }
  /* If we are being notified that we joined the room, then ignore it */
  if (payload.socket_id === socket.id) {
    return;
  }

  /* If somone joined the new room then add a new row to the lobby table */
  var dom_element = $('.socket_' + payload.socket_id);
  /* If we don't already have an entry for this person */
  if (dom_element.length === 0) {
    var nodeA = $('<div></div>');
    nodeA.addClass('socket_' + payload.socket_id);

    var nodeB = $('<div></div>');
    nodeB.addClass('socket_' + payload.socket_id);

    var nodeC = $('<div></div>');
    nodeC.addClass('socket_' + payload.socket_id);

    nodeA.addClass('w-100');

    nodeB.addClass('col-9 text-right');
    nodeB.append('<h4>' + payload.username + '</h4>');

    nodeC.addClass('cold-3 text-left');
    var buttonC = makeInviteButton(payload.socket_id);
    nodeC.append(buttonC);

    nodeA.hide();
    nodeB.hide();
    nodeC.hide();
    $('#players').append(nodeA, nodeB, nodeC);
    nodeA.slideDown(1000);
    nodeB.slideDown(1000);
    nodeC.slideDown(1000);

  }
  else {
    var buttonC = makeInviteButton(payload.socket_id);
    $('.socket_' + payload.socket_id + ' button').replaceWith(buttonC);
    dom_element.slideDown(1000);
  }

  /* Manage the message that a new player has joined */
  var newHTML = '<p>' + payload.username + ' just entered the lobby</p>';
  var newNode = $(newHTML);
  newNode.hide();
  $('#messages').append(newNode);
  newNode.slideDown(1000);

});

/* What to do when the server says someone has left a room */
socket.on('player_disconnected', function (payload) { 
  if (payload.result == 'fail') { 
    alert(payload.message);
    return;
  }

  /* If we are being notified that we joined the room, then ignore it */
  if (payload.socket_id === socket.id) {
    return;
  }

  /* If somone left then animate out all of their content */
  var dom_elements = $('.socket_' +payload.socket_id);

  /* If something exists */
  if (dom_elements.length != 0) {
    dom_elements.slideUp(1000);
  }


  /* Manage the message that a new player has left */
  var newHTML = '<p>'+payload.username+ ' has left the lobby</p>';
  var newNode = $(newHTML);
  newNode.hide();
  $('#messages').append(newNode);
  newNode.slideDown(1000);
});

function invite(who){
  var payload = {};
  payload.requested_user = who;

  console.log('*** Client Log Message: \'invite \' payload: '+JSON.stringify(payload));
  socket.emit('invite',payload);
}

socket.on('invite_response',function(payload) { 
  if (payload.result == 'fail') {
    alert(payload.message);
    return;
  }

  //console.log ('I am here')
  var newNode = makeInvitedButton();
  $('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});


socket.on('invited',function(payload) { 
  if (payload.result == 'fail') {
    alert(payload.message);
    return;
  }
  var newNode = makePlayButton();
  $('.socket_' + payload.socket_id +' button').replaceWith(newNode);
});

socket.on('send_message_response', function(payload) { 
  if (payload.result == 'fail') {
    alert(payload.message);
    return;
  }
  $('#messages').append('<p><b>' + payload.username + ' says:</b> ' + payload.message + '</p>');
});


function send_message() { // setting up the message variable with content
  var payload = {};
  payload.room = chat_room;
  payload.username = username;
  payload.message = $('#send_message_holder').val();
  console.log('*** Client Log Message: \'send_message\' payload: ' + JSON.stringify(payload));
  socket.emit('send_message', payload);
}

//added a bunch of socket_id maybe bad?
function makeInviteButton(socket_id){
  var newHTML = '<button type=\'button\' class=\'btn btn-outline-primary\'>Invite</button>';
  var newNode = $(newHTML);

  newNode.click(function(){
    invite(socket_id);
  });
  return (newNode);
}

function makeInvitedButton() {
  var newHTML = '<button type=\'button\' class=\'btn btn-primary\'>Invited!</button>';
  var newNode = $(newHTML);
  return (newNode);
}

function makePlayButton() {
  var newHTML = '<button type=\'button\' class=\'btn btn-success\'>Play</button>';
  var newNode = $(newHTML);
  return (newNode);
}

function makeEngageButton() {
  var newHTML = '<button type=\'button\' class=\'btn btn-danger\'>Engaged</button>';
  var newNode = $(newHTML);
  return (newNode);
}

$(function () {
  var payload = {};
  payload.room = chat_room;
  payload.username = username;

  console.log('*** Client Log Message: \'join_room\ payload: ' + JSON.stringify(payload));
  socket.emit('join_room', payload);
});
















