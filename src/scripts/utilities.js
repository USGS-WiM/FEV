/**
 * Created by bdraper on 4/17/2015.
 */
//utility function for formatting numbers with commas every 3 digits
function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function translateToDisplayValue(value, idProperty, displayProperty, sourceArray) {
    var displayValue;
    if (value === null || sourceArray === undefined) {
      displayValue = '';
    } else {
      for (let i = 0; i < sourceArray.length; i++) {
        if (sourceArray[i][idProperty] === parseInt(value, 10)) {
          displayValue = sourceArray[i][displayProperty];
        }
      }
    }
    return displayValue;
  }