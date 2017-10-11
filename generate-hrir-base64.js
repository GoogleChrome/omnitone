const fs = require('fs');

const FOAHrirData = {
  variableName: 'OmnitoneFOAHrirBase64',
  outputPath: ['src/resources', 'test/resources'],
  filename: 'omnitone-foa-hrir-base64.js',
  sources: [
    'src/resources/omnitone-foa-1.wav',
    'src/resources/omnitone-foa-2.wav'
  ]
};

const SOAHrirData = {
  variableName: 'OmnitoneSOAHrirBase64',
  outputPath: ['src/resources', 'test/resources'],
  filename: 'omnitone-soa-hrir-base64.js',
  sources: [
    'src/resources/omnitone-soa-1.wav',
    'src/resources/omnitone-soa-2.wav',
    'src/resources/omnitone-soa-3.wav',
    'src/resources/omnitone-soa-4.wav',
    'src/resources/omnitone-soa-5.wav',
  ]
};

const TOAHrirData = {
  variableName: 'OmnitoneTOAHrirBase64',
  outputPath: ['src/resources', 'test/resources'],
  filename: 'omnitone-toa-hrir-base64.js',
  sources: [
    'src/resources/omnitone-toa-1.wav',
    'src/resources/omnitone-toa-2.wav',
    'src/resources/omnitone-toa-3.wav',
    'src/resources/omnitone-toa-4.wav',
    'src/resources/omnitone-toa-5.wav',
    'src/resources/omnitone-toa-6.wav',
    'src/resources/omnitone-toa-7.wav',
    'src/resources/omnitone-toa-8.wav',
  ]
};

[FOAHrirData, SOAHrirData, TOAHrirData].forEach((hrirData) => {
  let content = 'const ' + hrirData.variableName + ' = [\n';
  hrirData.sources.forEach((path) => {
    let file = fs.readFileSync(path);
    let encodedData = new Buffer(file).toString('base64');
    content += '"' + encodedData + '",\n';
  });
  content += '];\n\n';
  content += 'module.exports = ' + hrirData.variableName + ';\n'

  hrirData.outputPath.forEach((path) => {
    fs.writeFileSync(path + '/' + hrirData.filename, content);
  });
});
