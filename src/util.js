function parseFitment(product){
    const yearRegex = {
      name: 'yearRe',
      // re: /^\d{4}-\d{4}|^\d{4}|^\d{4}|^\d{2}-\d{2}|^\d{2}/g
      re: /^\d{4}\.5-\d{4}\.5|^\d{4}-\d{4}\.5|^\d{4}\.5-\d{4}|^\d{4}\.5|^\d{4}-\d{4}|^\d{4}|^\d{4}|^\d{2}-\d{2}|^\d{2}/g
    };
    const driveRegex = {
      name: 'driveRe',
      re: /\dWD\/\dWD|\dWD/g
    };
    const makeRegex = {
      name: 'makeRe',
      re: /Nissan|Chevrolet|GMC|Jeep|Ford|Toyota|Dodge|Hummer|Cadillac|Plymouth|Mitsubishi|Mazda|Chevy|International|Isuzu|Suzuki/g
    }
  
    const modelRegex =  {
      name: 'modelRe',
      re: /^(?:(^\d{4}\.5-\d{4}\.5|^\d{4}-\d{4}\.5|^\d{4}\.5-\d{4}|^\d{4}\.5|^\d{4}-\d{4}|^\d{4}|^\d{4}|^\d{2}-\d{2}|^\d{2})(?:\s)(\dWD\/\dWD|\dWD)(?:\s)(Nissan|Chevrolet|GMC|Jeep|Ford|Toyota|Dodge|Hummer|Cadillac|Plymouth|Mitsubishi|Mazda|Chevy|International|Isuzu|Suzuki)(?:\s))(\S+$|\S+\s\d{4}$|(?:\S+\s).+)$/g
    }
    
    let processedItem = {
      sku: product.sku,
      fitment: [],
      notes: [],
    }
    let fitmentArray = '';
    if (product.combinedFitment){
      fitmentArray = product.combinedFitment.replace(/;\s/g, ';').replace(/\n/g, ';').split(';');
      fitmentArray.forEach(fitment => {
        let m;
        let fit = {
          years: null,
          drive: null,
          make: null,
          model: null,
          notes: null,
          minAcesRecords: null
        };
          
        [yearRegex, driveRegex, makeRegex, modelRegex].forEach(re => {  
          while ((m = re.re.exec(fitment)) !== null){
            if (m.index === re.re.lastIndex){
              re.re.lastIndex++;
            }
  
            switch (re.name){
              case 'yearRe':
                fit.years = getYearRange(m[0]);
                break;
              case 'driveRe':
                fit.drive = splitDrives(m[0]);
                break;
              case 'makeRe':
                fit.make = m[0];
                break;
              case 'modelRe':
                fit.model = m[4];
                break;
              default:
                console.log('Invalid re name');
            }
          }
        })
        if (!fit.model || !fit.make || !fit.years){
          Object.keys(fit).forEach(k => delete fit[k])
          fit.notes = fitment.replace(/\n/, '');
        }
        else {
          delete fit.notes;
        }
  
        Object.values(fit).every(x => (x === null || x === ''))
          ? null
          : fit.notes
          ? processedItem.notes.push(fit.notes)
          : processedItem.fitment.push(fit)
  
            if (Array.isArray(fit.drive)){
              if (Array.isArray(fit.years)){
                fit.minAcesRecords = fit.years.length * fit.drive.length;
              }
              else {
                fit.minAcesRecords = 2;
              }
            }
            else if (Array.isArray(fit.years)){
              fit.minAcesRecords = fit.years.length;
            }
            else {
              fit.minAcesRecords = 1;
            }
  
      })
    }
    else {
      processedItem.fitment = ['Universal Fitment'];
    }
    processedItem.notes.length === 0 && delete processedItem.notes;
    return processedItem;
  }
  
  function getYearRange(yearString){
    if (!yearString.includes('-'))
      return [yearString];
  
    let splits = yearString.split('-');
    let baseYear = splits[0];
    splits = splits.map(s => parseInt(s));
    let rng = Math.abs(splits[1] - splits[0]);
    let nextYear = parseFloat(baseYear);
  
    let years = [];
    years.push(nextYear.toString());
    for (let i = 0; i < rng; i++){
      nextYear += 1;
      years.push(Math.floor(nextYear).toString());
    }
    return years;
  }
  
  function splitDrives(driveString){
    if (!driveString.includes('/'))
      return [driveString];
    return driveString.split('/')
  }

  module.exports = {
      parseFitment
  }