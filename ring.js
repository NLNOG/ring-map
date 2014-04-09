var nlnogRing = {};

nlnogRing.map = null;
nlnogRing.markerClusterer = null;
nlnogRing.markers = [];
nlnogRing.infoWindow = null;
nlnogRing.nodes = {};
nlnogRing.participants = {};

/***************************************************/
nlnogRing.init = function() {
  /* read list of nodes */
  $.ajax({
    url: "nodes.cgi",
    dataType: 'json',
    async: false,
    data: "",
    success: function(data) {
      for (var i = 0, node ; node = data.results.nodes[i]; i++) {
        nlnogRing.nodes[node.id] = node;
        splt = node.geo.split(',');
        var lat = splt.shift();
        var lon = splt.shift();
        var latLng = new google.maps.LatLng(lat, lon);
        nlnogRing.nodes[node.id].latLng = latLng;
      }
    },
  });
  /* read list of participants */
  $.ajax({
    url: "participants.cgi",
    dataType: 'json',
    async: false,
    data: "",
    success: function(data) {
      for (var i = 0, part ; part = data.results.participants[i]; i++) {
        nlnogRing.participants[part.id] = part;
      }
    },
  });

  var useGmm = document.getElementById('usegmm');
  google.maps.event.addDomListener(useGmm, 'click', nlnogRing.change);

  var options = {
    'zoom': 2,
    'center': new google.maps.LatLng(+30, 0),
    'mapTypeId': google.maps.MapTypeId.TERRAIN,
    'panControl': true,
    'zoomControl': true,
    'scaleControl': true

  };
  nlnogRing.map = new google.maps.Map(document.getElementById('map'), options);
  nlnogRing.infoWindow = new google.maps.InfoWindow();
  nlnogRing.showMarkers();
}

/***************************************************/
nlnogRing.change = function() {
  for (var i = 0, marker; marker = nlnogRing.markers[i]; i++) {
    marker.setMap(null);
  }
  nlnogRing.showMarkers();
}

/***************************************************/
nlnogRing.showMarkers = function() {
  nlnogRing.markers = [];
  nlnogRing.items = [];

  var nodelist = document.getElementById('nodelist');
  nodelist.innerHTML = '';

  if (nlnogRing.markerClusterer) {
    nlnogRing.markerClusterer.clearMarkers();
  }

  for (var id in nlnogRing.nodes) {
    var node = nlnogRing.nodes[id];
    var titleText = node.hostname;

    var item = document.createElement('OPTION');
    var title = document.createElement('A');
    title.href = '#';
    title.className = 'title';
    title.innerHTML = titleText + " - AS" + node.asn + 
        " - " + node.countrycode;
    item.value = node.id;

    item.appendChild(title);
    nodelist.appendChild(item);

    if (node.active == 0) {
        icon = "images/offline.png";
    } else {
        icon = "images/available.png";
    }
    var marker = new google.maps.Marker({
      'position': node.latLng,
      'icon': icon,
    });

    google.maps.event.addListener(marker, 'click', nlnogRing.markerClickFunction(node));
    nlnogRing.markers.push(marker);
  }

  window.setTimeout(nlnogRing.time, 0);
  var mcOptions = {gridSize: 40, maxZoom: 13};
  if (document.getElementById('usegmm').checked) {
      nlnogRing.markerClusterer = new MarkerClusterer(nlnogRing.map, nlnogRing.markers, mcOptions);
  } else {
    for (var i = 0, marker; marker = nlnogRing.markers[i]; i++) {
      marker.setMap(nlnogRing.map);
    }
  }
};

/***************************************************/
nlnogRing.markerClickFunction = function(node) {
  return function(e) {
    e.cancelBubble = true;
    e.returnValue = false;
    if (e.stopPropagation) {
      e.stopPropagation();
      e.preventDefault();
    }
    var flag = '<img src="images/flags/' + node.countrycode.toLowerCase() + '.png"' +
        'title=' + countries[node.countrycode] + '>';

    var infoHtml = '<div class="info"><h3>' + node.hostname + 
          '</h3><table><tr><td class=head>Member:</td><td><a href="' + 
          nlnogRing.participants[node.participant].url+ '">' +
          nlnogRing.participants[node.participant].company + '</a></td></tr>' +
          '<tr><td class=head>ASN:</td><td><a href="http://as' + 
          node.asn + '.peeringdb.com">'+node.asn+'</a></td></tr>' +
          '<tr><td class=head>IPv4:</td><td>' + node.ipv4 + '</td></tr>' +
          '<tr><td class=head>IPv6:</td><td>' + node.ipv6 + '</td></tr>' + 
          '<tr><td class=head>Datacenter:</td><td>';
    if ((node.datacenter != null) && (node.datacenter != ''))
        infoHtml += node.datacenter;
    else
        infoHtml += 'unspecified';
    infoHtml += '</td></tr><tr><td class=head>Country:</td><td>' +
        flag + '&nbsp;' + countries[node.countrycode] + '</td></tr>' + 
        '<tr><td class=head>Status:</td><td>';
    if (node.active == 0)
        infoHtml += "<span class=inactive>inactive</span>";
    else
        infoHtml += "<span class=active>active</span>";
    infoHtml += "</td></tr><tr><td class=head>About:</td><td>";
    if (nlnogRing.participants[node.participant].description != null) {
        infoHtml += nlnogRing.participants[node.participant].description;
    } else {
        infoHtml += "No description available.";
    }
infoHtml +="</td></tr></table></div>";

nlnogRing.infoWindow.setContent(infoHtml);
    nlnogRing.infoWindow.setPosition(node.latLng);
    nlnogRing.infoWindow.open(nlnogRing.map);
  };
};

/***************************************************/
nlnogRing.time = function() {
  if ($('usegmm').checked) {
    nlnogRing.markerClusterer = new MarkerClusterer(nlnogRing.map, nlnogRing.markers);
  } else {
    for (var i = 0, marker; marker = nlnogRing.markers[i]; i++) {
      marker.setMap(nlnogRing.map);
    }
  }
}

/***************************************************/
nlnogRing.select_changed = function() {
    id = document.getElementById('nodelist').value;
    nlnogRing.map.setZoom(6);
    f = nlnogRing.markerClickFunction(nlnogRing.nodes[id]);
    f(nlnogRing.nodes[id])
    nlnogRing.map.setZoom(5);
}

