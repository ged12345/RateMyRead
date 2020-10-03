export default class GoodreadsParser {
  parseXML(response) {
    var parsedData = {title: '', author: ''};
    var XMLParser = require('react-xml-parser');
    var xml = new XMLParser().parseFromString(response.data);

    // Move this to goodreads - we'll create a parser with checks, which defaults back to google books or world cat.
    parsedData['title'] = xml.getElementsByTagName('best_book')[0][
      'children'
    ][1]['value'];
    parsedData['author'] = xml.getElementsByTagName('best_book')[0][
      'children'
    ][2]['children'][1]['value'];

    return parsedData;
  }
}
