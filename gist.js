let gistURL = process.env.INPUT_GISTURL;
let token = process.env.INPUT_TOKEN;
let file = process.env.INPUT_FILE;
let suffix = process.env.INPUT_SUFFIX;
let fs = require('fs');
let https = require('https');

console.log('Gist URL:', gistURL);
let gistID = gistURL.split('/')[4]
console.log('Gist ID is:', gistID);

let fileData = fs.readFileSync(file, 'utf-8');
let fileSplit = file.split('/');
let fileName = fileSplit[fileSplit.length-1] + (suffix || '');

let options = {
    'host': 'api.github.com',
    'port': '443',
    'path': `/gists/${gistID}`,
    'method': 'PATCH',
    'headers': {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'actions/get-gist-action'
    }
}

let data = {
  "files": {
    [fileName]: {
      "content": fileData,
      "filename": fileName
    }
  }
}

let req = https.request(options, (resp) => {
  if (resp.statusCode !== 200) {
    console.log(`Got an error: ${resp.statusCode}`);
    process.exit(1)
  }
 
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });
  
  resp.on('end', () => {
    console.log(`Gist updated, written: ${fileName}`);
  });

}).on("error", (err) => {
  console.log(`Error getting gist: ${err.message}`);
});

req.write(JSON.stringify(data));
req.end();
