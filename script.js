// var isGithubDemo = isGithubDemo || false;  // This is for GitHub demo only. Remove it in your project

void function(window, document, undefined) {

  // ES5 strict mode
  "user strict";

  var MIN_COLUMN_COUNT = 3; // minimal column count
  var COLUMN_WIDTH = 220;   // cell width: 190, padding: 14 * 2, border: 1 * 2
  var CELL_PADDING = 26;    // cell padding: 14 + 10, border: 1 * 2
  var GAP_HEIGHT = 15;      // vertical gap between cells
  var GAP_WIDTH = 15;       // horizontal gap between cells
  var THRESHOLD = 2000;     // determines whether a cell is too far away from viewport (px)

  var totalCount = 0;       //*001
  var columnHeights;        // array of every column's height
  var columnCount;          // number of columns
  var noticeDelay;          // popup notice timer
  var resizeDelay;          // resize throttle timer
  var scrollDelay;          // scroll throttle timer
  var managing = false;     // flag for managing cells state
  var loading = false;      // flag for loading cells state

  var noticeContainer = document.getElementById('notice');
  var cellsContainer = document.getElementById('cells');
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

  // Pop notice tag after user liked or marked an item.
  var updateNotice = function(event) {
    clearTimeout(noticeDelay);
    var e = event || window.event;
    var target = e.target || e.srcElement;
    if(target.tagName == 'SPAN') {
      var targetTitle = target.parentNode.tagLine;
      noticeContainer.innerHTML = (target.className == 'like' ? 'Liked ' : 'Marked ') + '<strong>' + targetTitle + '</strong>';
      noticeContainer.className = 'on';
      noticeDelay = setTimeout(function() {
        noticeContainer.className = 'off';
      }, 2000);
    }
  };

  // Calculate column count from current page width.
  var getColumnCount = function() {
    return Math.max(MIN_COLUMN_COUNT, Math.floor((document.body.offsetWidth + GAP_WIDTH) / (COLUMN_WIDTH + GAP_WIDTH)));
  };

  // Reset array of column heights and container width.
  var resetHeights = function(count) {
    columnHeights = [];
    for(var i = 0; i < count; i++) {
      columnHeights.push(0);
    }
    cellsContainer.style.width = (count * (COLUMN_WIDTH + GAP_WIDTH) - GAP_WIDTH) + 'px';
  };

  // Fetch JSON string via Ajax, parse to HTML and append to the container.
  var appendCells = function(num) {
    if(loading) {
      // Avoid sending too many requests to get new cells.
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
          cell.className = 'cell pending';
          cell.tagLine = images[j].title;
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

  // Fake mode, only for GitHub demo. Delete this function in your project.
  var appendCellsDemo = function(num) {
    if(loading) {
      // Avoid sending too many requests to get new cells.
      return;
    }
    var fragment = document.createDocumentFragment();
    var cells = [];
    var images = [0, 142, 126, 126, 142, 253, 142, 142, 142, 142, 142, 126, 337, 126, 126, 126, 253, 142, 126, 126, 141, 285, 126, 126, 126, 126, 126, 317, 337, 107, 106, 106, 106, 106, 106, 106, 106, 337, 106, 106, 126, 126, 253, 338, 338, 142, 106, 142, 106, 142, 142, 142, 126, 142, 253, 142, 126, 253, 285, 126, 126, 142, 142, 142, 142, 142, 142, 142, 142, 142, 142, 337, 337, 337, 337, 106, 106, 337, 337, 142, 142, 106, 106, 106, 142, 142, 106, 142, 337, 142, 106, 337, 253, 337, 337, 106, 106, 106, 106, 337, 106, 106, 337, 337, 337, 337, 337, 337, 337, 142, 142, 253, 142, 253, 253, 253, 253, 142, 253, 253, 253];
    // var images = [0, 142, 126, 126, 142, 253, 142, 142, 142, 142, 142, 126, 337, 126, 126, 126, 253, 142, 126, 126, 141, 253, 127, 190, 190, 225, 269, 264, 272, 126, 265, 287, 269, 125, 285, 190, 314, 141, 119, 274, 274, 285, 126, 279, 143, 266, 279, 600, 276, 285, 182, 143, 287, 126, 190, 285, 143, 241, 166, 240, 190];
    var texts = [" ", "2010-7 国泰电影院 第一束玫瑰", "2010-8 金山海边 比试脚", "2010-8 金山海边 太美了", "2010-9 初游西塘", "2010-9 初游西塘 夜游船", "2010-09 世博游", "2010-09 世博游2", "2010-09 世博游 丹麦馆骑车", "2010-09 世博游 排15分钟的石油馆", "2010-09 共同完成的拼图", "2010-09 一起制作老婆生日蛋糕", "2010-12 拍集体毕业照", "2010-12 厦门海边路", "2010-12 厦门海边路2", "2010-12 难忘厦门", "2010-12 难忘厦门2", "2010-12 难忘厦门3", "2010-12 厦门 学习革命先驱", "2010-12 厦门 学习革命先驱2", "2011-02 常州恐龙园 刺激的大摆锤", "2011-02 常州恐龙园 惊现人造人", "2011-02 世博源滑冰", "2011-02 情人节手工作坊", "2011-02 情人节手工作坊成品", "2011-02 自制爱心戒指", "2011-04 我的工作主页", "2011-05 浙东大峡谷穿越", "2011-07 千岛湖毕业旅行", "2011-07 千岛湖毕业旅行2", "2011-07 千岛湖毕业旅行 公主抱", "2011-07 毕业典礼", "2011-11 北京公园", "2011-11 北京公园2", "2011-11 一起爬长城", "2011-11 一起爬长城2", "2011-11 一起爬长城3", "2012-06 澳门", "2012-06 澳门玛祖门", "2012-06 香港星光大道", "2012-06-22 重要的日子", "2012-06-22 重要的日子 成功啦", "2012-06 第一次坐摩天轮", "2012-09 成都锦里", "2012-09 四川古镇", "2012-09 都江堰水渠", "2012-10 贡嘎神山", "2012-10 康定", "2012-10 海螺沟", "2012-10 海螺沟 高难度托举", "2012-12 老婆亲手在家做蛋糕", "2012-12 老婆亲手在家做蛋糕2", "2013-01 新的留言闹钟", "2013-01 自制咖啡小屋", "2013-02 情人节手折玫瑰花", "2013-03 同济的樱花", "2013-06-17 被国家所承认的夫妻", "2013-07 再游西塘", "为你生日做的T恤", "你亲手做的红灰太郎", "你写给一年后我的信，我被感动", "你的作品-家", "2013-10 泰国蜜月 大皇宫", "2013-10 泰国蜜月 曼谷大白鲨", "2013-10 泰国蜜月 出发去PP岛", "2013-10 泰国蜜月 沙滩爱心", "2013-10 泰国蜜月 人体爱心", "2013-10 泰国蜜月 甜美少女", "2013-10 泰国蜜月 前凸后翘", "2013-10 泰国蜜月 普吉岛私人别墅", "2013-11 初访夜间动物园", "2013-12 新加坡过圣诞夜", "2013-12 新加坡跨年", "2014-01 新加坡日常自拍", "2014-02 乌敏岛", "2014-03 Universal Studio", "2014-03 棒棒糖女孩", "2014-06 圣淘沙Luge", "2014-06 圣淘沙海洋馆", "2014-06 巴厘岛 沙滩秀", "2014-06 巴厘岛 沙滩秀2", "2014-06 happy anniversary honeymoon", "2014-06 巴厘岛 海边大餐", "2014-06 巴厘岛 沙滩看日落", "2014-06 巴厘岛 海神庙边午餐前", "2014-06 巴厘岛 AYANA索道", "2014-06 巴厘岛 AYANA无边泳池", "2014-06 巴厘岛 AYANA栈桥", "2014-09 丽江古镇", "2014-09 玉龙雪山", "2014-09 cosplay苗族妹子", "2014-09 花环美少女", "2015-08 清迈大象合影", "2015-08 再游大皇宫", "2015-09 出发去美帝", "2015-09 华盛顿中央公园", "2015-09 华盛顿中央公园 旅美好友合影", "2015-09 旅美好友合影2", "2015-09 安纳波利斯海军学院", "2015-09 波士顿 吃撑的的龙虾大餐", "2015-09 波士顿自由之路终点", "2015-09 波士顿纪念碑", "2015-09 华尔街入口", "2015-09 和自由女神像合影", "2015-09 自由女神前摆pose", "2015-09 自由女神前摆pose2", "2015-09 自由岛驳船", "2015-09 帝国大厦看夜景", "2015-09 帝国大厦白天风景", "2016-08 暖心的baby shower", "2016-08-26 可乐出生啦", "2016-08 一家三口第一次合影", "2016-08 可乐妈妈抱抱", "2016-09 可乐洗澡", "2016-09 可乐常用睡姿", "2016-09 可乐大头贴", "2016-09 可乐大头贴2", "2016-09 可爱的睡姿", "2016-09 睡着啦", "2016-09 半睡半醒", "2016-09 摆个pose"];
    for(var j = 0; j < num; j++) {
    //  var key = Math.floor(Math.random() * 20) + 1;
      var key = totalCount + j + 1; //*001
      if(key > 120) { //*001
        key = key - 120;
        totalCount = 0;
      }
      var cell = document.createElement('div');
      cell.className = 'cell pending';
      cell.tagLine = 'memory photo ' + key;
      cells.push(cell);
    //  front(cellTemplate, { 'title': 'our memory photo ' + key, 'src': key, 'height': images[key], 'width': 380 }, cell);
      front(cellTemplate, { 'title': texts[key], 'src': key, 'height': images[key], 'width': 190 }, cell);
      fragment.appendChild(cell);
    }
    totalCount = key; //*001
    // Faking network latency.
    setTimeout(function() {
      loading = false;
      cellsContainer.appendChild(fragment);
      adjustCells(cells);
    }, 2000);
  };

  // Position the newly appended cells and update array of column heights.
  var adjustCells = function(cells, reflow) {
    var columnIndex;
    var columnHeight;
    for(var j = 0, k = cells.length; j < k; j++) {
      // Place the cell to column with the minimal height.
      columnIndex = getMinKey(columnHeights);
      columnHeight = columnHeights[columnIndex];
      cells[j].style.height = (cells[j].offsetHeight - CELL_PADDING) + 'px';
      cells[j].style.left = columnIndex * (COLUMN_WIDTH + GAP_WIDTH) + 'px';
      cells[j].style.top = columnHeight + 'px';
      columnHeights[columnIndex] = columnHeight + GAP_HEIGHT + cells[j].offsetHeight;
      if(!reflow) {
        cells[j].className = 'cell ready';
      }
    }
    cellsContainer.style.height = getMaxVal(columnHeights) + 'px';
    manageCells();
  };

  // Calculate new column data if it's necessary after resize.
  var reflowCells = function() {
    // Calculate new column count after resize.
    columnCount = getColumnCount();
    if(columnHeights.length != columnCount) {
      // Reset array of column heights and container width.
      resetHeights(columnCount);
      adjustCells(cellsContainer.children, true);
    } else {
      manageCells();
    }
  };

  // Toggle old cells' contents from the DOM depending on their offset from the viewport, save memory.
  // Load and append new cells if there's space in viewport for a cell.
  var manageCells = function() {
    // Lock managing state to avoid another async call. See {Function} delayedScroll.
    managing = true;

    var cells = cellsContainer.children;
    var viewportTop = (document.body.scrollTop || document.documentElement.scrollTop) - cellsContainer.offsetTop;
    var viewportBottom = (window.innerHeight || document.documentElement.clientHeight) + viewportTop;

    // Remove cells' contents if they are too far away from the viewport. Get them back if they are near.
    // TODO: remove the cells from DOM should be better :<
    for(var i = 0, l = cells.length; i < l; i++) {
      if((cells[i].offsetTop - viewportBottom > THRESHOLD) || (viewportTop - cells[i].offsetTop - cells[i].offsetHeight > THRESHOLD)) {
        if(cells[i].className === 'cell ready') {
          cells[i].fragment = cells[i].innerHTML;
          cells[i].innerHTML = '';
          cells[i].className = 'cell shadow';
        }
      } else {
        if(cells[i].className === 'cell shadow') {
          cells[i].innerHTML = cells[i].fragment;
          cells[i].className = 'cell ready';
        }
      }
    }

    // If there's space in viewport for a cell, request new cells.
    if(viewportBottom > getMinVal(columnHeights)) {
      // Remove the if/else statement in your project, just call the appendCells function.
    //  if(isGithubDemo) {
        appendCellsDemo(columnCount);
    //  } else {
    //    appendCells(columnCount);
    //  }
    }

    // Unlock managing state.
    managing = false;
  };

  // Add 500ms throttle to window scroll.
  var delayedScroll = function() {
    clearTimeout(scrollDelay);
    if(!managing) {
      // Avoid managing cells for unnecessity.
      scrollDelay = setTimeout(manageCells, 500);
    }
  };

  // Add 500ms throttle to window resize.
  var delayedResize = function() {
    clearTimeout(resizeDelay);
    resizeDelay = setTimeout(reflowCells, 500);
  };

  // Initialize the layout.
  var init = function() {
    // Add other event listeners.
    addEvent(cellsContainer, 'click', updateNotice);
    addEvent(window, 'resize', delayedResize);
    addEvent(window, 'scroll', delayedScroll);

    // Initialize array of column heights and container width.
    columnCount = getColumnCount();
    resetHeights(columnCount);

    // Load cells for the first time.
    manageCells();
  };

  // Ready to go!
  addEvent(window, 'load', init);

}(window, document);
