const fs = require('fs');
const { argv, exit } = require('process');

const file = argv[2];

if (!file) {
  console.warn('Parameter filename required.');
  exit(1);
}
console.log('Patching the file %s ...', file);

let src = fs.readFileSync(file, 'utf8');

const i = src.indexOf('})(function (require, exports) {');

if (i < 0) {
  console.warn('File is wrong format.');
  exit(1);
}

src = src.substr(0, i) + `    else {
        var e = {};
        factory(null, e);
        window.FancyTimer = e.FancyTimer;
    }
` + src.substr(i);

fs.writeFileSync(file, src);

console.log('Success.');
exit(0);
