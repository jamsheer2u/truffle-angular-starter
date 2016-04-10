var exec = require('child_process').exec;

module.exports = {
//   build: {
//     "index.html": "index.html",
//     "app.js": [
//       "javascripts/app.js"
//     ],
//     "app.css": [
//       "stylesheets/app.css"
//     ],
//     "images/": "images/"
//   },
  build: function(options, callback) {
      console.log(options);
      var contractNames = getContractNames(options);
      var distDir = options.destination_directory;
      var contractFiles = getContractFiles(options);
      var web3 = getWeb3Provider(options);
      var commandOptions = getCommandLineParams(contractNames, distDir, contractFiles, web3);
      
      exec('grunt build' + commandOptions, 
      {
        cwd: './app/'
      },
      function(error, stdout, stderr){
          console.log('Completed the tasks', stdout);
          console.log(stderr);
          if (error !== null) {
              console.error(error);
          }
          callback();
      });
      
      function getContractNames(options) {
          return options.contracts.map(function(value){
              return 'window.' + value.name;
          }).join(', ');
      }
      
      function getWeb3Provider(options) {
          var web3 = 'http://';
          web3 += options.rpc.host + ':' + options.rpc.port;
          return web3;
      }
      
      function getContractFiles(options) {
          var contractFiles = '';
          contractFiles += options.contracts_directory + '/*.sol.js';
          return contractFiles;
      }
      
      function getCommandLineParams(contractNames, distDir, contractFiles, web3) {
          var options = '';
          options += " --contracts='" + contractNames + "'";
          options += " --dist='" + distDir + "'";
          options += " --contractFiles='" + contractFiles + "'";
          options += " --web3='" + web3 + "'";
          return options;
      }
  },
  deploy: [
    "MetaCoin",
    "ConvertLib"
  ],
  rpc: {
    host: "localhost",
    port: 8545
  }
};
