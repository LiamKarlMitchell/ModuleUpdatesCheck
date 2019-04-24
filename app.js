require('dotenv').config();
const marketplaceMagentoParser = require('./WebsiteParsers/marketplace.magento.js');
const fs = require('fs');
const diffObject = require("can-util/js/diff-object/diff-object");

const marketplaceJsonFilename = './marketplace.magento.products.json';
const marketplaceMagentoProducts = require(marketplaceJsonFilename);

const nodemailer = require("nodemailer");

async function run() {

	var textOutput = '';
	var htmlOutput = '';

	var magentoProductUris = Object.keys(marketplaceMagentoProducts).sort();

	var changes = [];
	for(var i=0; i<magentoProductUris.length; i++) {
		var uri = magentoProductUris[i];
		var oldInfo = Object.assign({}, marketplaceMagentoProducts[uri]);
		var url = 'https://marketplace.magento.com/'+uri+'.html';
		var newInfo = await marketplaceMagentoParser(url);
		var differences = diffObject(oldInfo, newInfo);
		if (differences.length === 0) {
			console.log(`No Change ${uri}`);
			continue;
		}

		textOutput += `URI: ${uri}
Web: ${url}
`;

		htmlOutput += `<h1><a href="${url}">${uri}</a></h1>`

		// Differences would contain
		// property, type, value
		for (var j=0; j<differences.length; j++) {
			if (differences[j].type === 'set') {
				textOutput += `${differences[j].property}: previous "${oldInfo[differences[j].property]}" now "${newInfo[differences[j].property]}"
`;

				htmlOutput += `<b>${differences[j].property}:</b> <strike>${oldInfo[differences[j].property]}</strike> ${newInfo[differences[j].property]}<br>`;
			}
			else if (differences[j].type === 'add') {
				textOutput += `${differences[j].property}: ${newInfo[differences[j].property]}
`;
				
				htmlOutput += `<b>${differences[j].property}:</b> ${newInfo[differences[j].property]}<br>`;
			}
		}

textOutput += '\n\n';
htmlOutput += `<a href="${url}#product.info.details.release_notes">Release Notes</a><br><hr>`;

		console.log(`Change ${uri}`);

		marketplaceMagentoProducts[uri] = newInfo;
		changes.push([oldInfo, newInfo]);
	}

	var mailInfo = {
	    from: process.env.MAIL_FROM, // sender address
	    to: process.env.MAIL_TO, // list of receivers
	    subject: "Module Updates", // Subject line
	    text: textOutput,
	    html: htmlOutput
	}

	if (changes.length) {
		console.log(`There are ${changes.length} changed module infos.`);
		console.log(textOutput);
		await fs.promises.writeFile(marketplaceJsonFilename, JSON.stringify(marketplaceMagentoProducts, true, 4));
		await mail(mailInfo);
	}

}

// async..await is not allowed in global scope, must use a wrapper
async function mail(mailInfo){

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail(mailInfo);

  console.log("Message sent: %s", info.messageId);
}


run().then((result)=>{
	console.log('Finished');
}).catch((err)=>{
	throw err;
});
