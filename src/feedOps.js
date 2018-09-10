const request = require('request-promise-native');
const parseString = require('xml2js').parseString;
const parseFitment = require('./util.js').parseFitment;
const csvWriter = require('csv-write-stream');
const fs = require('fs');

function getFeed(){
  return request.get('https://www.roughcountry.com/media/feeds/prodaf_3.xml')
    .then(response => {
      return response;
    })
};

function retrieveFitment (){
    let fitmentData = [];
    console.log('This process may take some time.......')

    getFeed().then(res => {
      parseString(res, (err, result) => {
        const products = result.rss.channel[0].items[0].item;
        console.log(products.length);
        const parsedProducts = products.map(product => {
          return parseFitment({
            sku: product.childIds[0].id[0],
            combinedFitment: product.parentattributes[0].attribute[17].value &&product.parentattributes[0].attribute[17].value[0].replace(/:/g, ' '),
          })
        });
        fitmentData = parsedProducts.map(p => {
          let fRecord = {
            sku: p.sku,
          };

          if (p.fitment[0] && typeof p.fitment[0] !== 'string') {
            p.fitment.forEach(fit => {
              fit.drive.forEach(d => {
                fit.years.forEach(year => {
                  fRecord.year = year;
                  fRecord.make = fit.make;
                  fRecord.model = fit.model;
                  fRecord.drive = d;
                  fRecord.notes =  p.notes && p.notes.join('; ');
                })
              })
            })
          }
          return fRecord;
        })
        const writer = csvWriter({ headers: ['sku', 'year', 'make', 'model', 'drive', 'notes']});
        writer.pipe(fs.createWriteStream('out.csv'));
        fitmentData.forEach(record => {
          writer.write(record);
        });
        writer.end();
      });
      
  });

  
};

module.exports = {
    getFeed, retrieveFitment
}