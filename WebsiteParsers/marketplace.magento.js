const rp = require('request-promise');
const $ = require('cheerio');

const magentoMarketplaceProductParse = function(url) {
  return rp(url)
    .then(function(html) {
		var left = $('#product-info .box-left-title', html);
		var right = $('#product-info .box-right-view', html);

		var count = Math.min(left.length, right.length);
		var output = {};
		for (var i=0; i<count; i++) {
			var key = $(left[i]).text().trim().replace(/:$/,'').replace(/\s+/g, ' ');
			var value = $(right[i]).text().trim().replace(/\s+/g, ' ').replace(/\n\s/g, '\n');
			output[key] = value;
		}
      return output;
    });
};

module.exports = magentoMarketplaceProductParse;
