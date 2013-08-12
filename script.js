var isGithubDemo = isGithubDemo || false;

void function(window, document, undefined) {

  // ES5 strict mode
  "user strict";

  var MIN_COLUMN_COUNT = 3; // minimal column count
  var COLUMN_WIDTH = 220;   // cell width: 190, padding: 14 * 2, border: 1 * 2
  var GAP_HEIGHT = 15;      // vertical gap between cells
  var GAP_WIDTH = 15;       // horizontal gap between cells

  var columnHeights;        // array of every column's height
  var columnCount;          // number of columns
  var delayer;              // resize throttle timer
  var noticer;              // popup notice timer
  var loading = false;      // flag for loading state

  var noticeTag = document.getElementById('notice');
  var cellsContainer = document.getElementById('container');
  var cellTemplate = document.getElementById('template').innerHTML;

  // Cross-browser compatible event handler.
  var addEvent = function(element, type, handler) {
    if(element.addEventListener) {
      addEvent = function(element, type, handler) {
        element.addEventListener(type, handler, false);
      };
    } else if(element.attachEvent) {
      addEvent = function(element, type, handler) {
        element.attachEvent('on' + type, handler);
      };
    } else {
      addEvent = function(element, type, handler) {
        element['on' + type] = handler;
      };
    }
    addEvent(element, type, handler);
  };

  // Get the minimal value within an array of numbers.
  var getMinVal = function(arr) {
    return Math.min.apply(Math, arr);
  };

  // Get the maximal value within an array of numbers.
  var getMaxVal = function(arr) {
    return Math.max.apply(Math, arr);
  };

  // Get index of the minimal value within an array of numbers.
  var getMinKey = function(arr) {
    var key = 0;
    var min = arr[0];
    for(var i = 1, len = arr.length; i < len; i++) {
      if(arr[i] < min) {
        key = i;
        min = arr[i];
      }
    }
    return key;
  };

  // Get index of the maximal value within an array of numbers.
  var getMaxKey = function(arr) {
    var key = 0;
    var max = arr[0];
    for(var i = 1, len = arr.length; i < len; i++) {
      if(arr[i] > max) {
        key = i;
        max = arr[i];
      }
    }
    return key;
  };

  // Calculate column count from current page width.
  var getColumnCount = function() {
    return Math.max(MIN_COLUMN_COUNT, Math.floor((document.body.offsetWidth + GAP_WIDTH) / (COLUMN_WIDTH + GAP_WIDTH)));
  };

  // Pop notice tag after user liked or marked an item.
  var updateNotice = function(event) {
    clearTimeout(noticer);
    var e = event || window.event;
    var target = e.target || e.srcElement;
    if(target.tagName == 'SPAN') {
      var targetTitle = target.parentNode.dataset.title;
      noticeTag.innerHTML = (target.className == 'like' ? 'Liked ' : 'Marked ') + '<strong>' + targetTitle + '</strong>';
      noticeTag.className = 'on';
      noticer = setTimeout(function() {
        noticeTag.className = 'off';
      }, 2000);
    }
  };

  // Position the newly appended cells and update array of column heights.
  var adjustCells = function(cells) {
    var columnIndex;
    var columnHeight;
    for(var j = 0, k = cells.length; j < k; j++) {
      // Append the cell to column with the minimal height.
      columnIndex = getMinKey(columnHeights);
      columnHeight = columnHeights[columnIndex];
      cells[j].style.left = columnIndex * (COLUMN_WIDTH + GAP_WIDTH) + 'px';
      cells[j].style.top = columnHeight + 'px';
      columnHeights[columnIndex] = columnHeight + GAP_HEIGHT + cells[j].offsetHeight;
      cells[j].className = 'cell ready';
    }
    cellsContainer.style.height = getMaxVal(columnHeights) + 'px';
    loadCells();
  };

  // Fetch JSON string via Ajax, parse to HTML and append to the container.
  var appendCells = function(num) {
    if(loading) {
      return;
    }
    var xhrRequest = new XMLHttpRequest();
    var fragment = document.createDocumentFragment();
    var cells = [];
    var images;
    xhrRequest.open('GET', 'json.php?n=' + num, true);
    xhrRequest.onreadystatechange = function() {
      if(xhrRequest.readyState == 4 && xhrRequest.status == 200) {
        images = JSON.parse(xhrRequest.responseText);
        for(var j = 0, k = images.length; j < k; j++) {
          var cell = document.createElement('div');
          cell.className = 'cell';
          cell.dataset = {};  // stupid IE
          cell.dataset.title = images[j][s];
          cells.push(cell);
          front(cellTemplate, images[j], cell);
          fragment.appendChild(cell);
        }
        cellsContainer.appendChild(fragment);
        loading = false;
        adjustCells(cells);
      }
    };
    loading = true;
    xhrRequest.send(null);
  };

  // Fake mode, only for GH demo
  var appendCellsDemo = function(num) {
    var fragment = document.createDocumentFragment();
    var cells = [];
    var images = [286, 143, 270, 143, 190, 285, 152, 275, 285, 285, 128, 281, 242, 339, 236, 157, 286, 259, 267, 137, 253, 127, 190, 190, 225, 269, 264, 272, 126, 265, 287, 269, 125, 285, 190, 314, 141, 119, 274, 274, 285, 126, 279, 143, 266, 279, 600, 276, 285, 182, 143, 287, 126, 190, 285, 143, 241, 166, 240, 190];
    for(var j = 0; j < num; j++) {
      var key = Math.floor(Math.random() * 60) + 1;
      var cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset = {};  // stupid IE
      cell.dataset.title = key;
      cells.push(cell);
      front(cellTemplate, { s: key, h: images[key], w: 190 }, cell);
      fragment.appendChild(cell);
    }
    cellsContainer.appendChild(fragment);
    adjustCells(cells);
  };

  // Calculate new column data if it's necessary after resize.
  var reflowCells = function() {
    // Calculate new column count after resize.
    columnCount = getColumnCount();
    if(columnHeights.length != columnCount) {
      columnHeights = [];
      cellsContainer.style.width = (columnCount * (COLUMN_WIDTH + GAP_WIDTH) - GAP_WIDTH) + 'px';
      for(var i = 0; i < columnCount; i++) {
        columnHeights.push(GAP_HEIGHT);
      }
      adjustCells(cellsContainer.children);
    } else {
      loadCells();
    }
  };

  // Load and append new cells if container is scrolled to the bottom.
  var loadCells = function() {
    var verticalOffset = (window.innerHeight || document.documentElement.clientHeight) + (document.body.scrollTop || document.documentElement.scrollTop);
    if(verticalOffset > getMinVal(columnHeights)) {
      if(isGithubDemo) {
        appendCellsDemo(columnCount);
      } else {
        appendCells(columnCount);
      }
    }
  };

  // Add 500ms throttle to window resize.
  var delayedReflow = function() {
    clearTimeout(delayer);
    delayer = setTimeout(reflowCells, 500);
  };

  // Initialize the layout.
  var init = function() {
    columnHeights = [];
    columnCount = getColumnCount();
    cellsContainer.style.width = (columnCount * (COLUMN_WIDTH + GAP_WIDTH) - GAP_WIDTH) + 'px';
    for(var i = 0; i < columnCount; i++) {
      columnHeights.push(GAP_HEIGHT);
    }
    loadCells();
  };

  addEvent(cellsContainer, 'click', updateNotice);
  addEvent(window, 'scroll', loadCells);
  addEvent(window, 'resize', delayedReflow);
  addEvent(window, 'load', init);

}(window, document);