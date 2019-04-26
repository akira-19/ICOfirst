App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
      // Modern dapp browsers...
  if (window.ethereum) {
    App.web3Provider = window.ethereum;
    try {
      // Request account access
      await window.ethereum.enable();
    } catch (error) {
      // User denied account access...
      console.error("User denied account access")
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    App.web3Provider = window.web3.currentProvider;
  }
  // If no injected web3 instance is detected, fall back to Ganache
  else {
    App.web3Provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/a0e6bae2d4be4f749b0525b8f300a214');
  }

  web3 = new Web3(App.web3Provider);
  return App.initContract();
  },

  initContract: function() {
      $.getJSON('MyCrowdsale.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var MyCrowdsaleArtifact = data;
    App.contracts.MyCrowdsale = TruffleContract(MyCrowdsaleArtifact);

    // Set the provider for our contract
    App.contracts.MyCrowdsale.setProvider(App.web3Provider);

  });
      $.getJSON('SimpleToken.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var SimpleTokenArtifact = data;
    App.contracts.SimpleToken = TruffleContract(SimpleTokenArtifact);

    // Set the provider for our contract
    App.contracts.SimpleToken.setProvider(App.web3Provider);
    return App.showToken();
  });
    return App.purchaseToken();
  },

  purchaseToken: function(){
      $(document).on('click', '#purchase_token', function(event){
          event.preventDefault();
          let fundAmount = $('#fundAmount').val();
          fundAmount = parseInt(fundAmount);
          fundAmount = window.web3.toWei(fundAmount, 'ether');
          web3.eth.getAccounts(function(error, accounts) {
              if (error) {
                  console.log(error);
              }
              var account = accounts[0];

              App.contracts.MyCrowdsale.deployed().then(instance => {
                  instance.buyTokens(account, {from: account, value: fundAmount});
              }).catch(function(err) {
                  console.log(err.message);
              });

          });
     });
 },

 showToken: function(){
     web3.eth.getAccounts(function(error, accounts) {
         if (error) {
             console.log(error);
         }
         var account = accounts[0];

         App.contracts.SimpleToken.deployed().then(instance => {
             return instance.balanceOf(account);
         }).then(balance => {
             let tokenBalance = balance / (10**18);
             $("#showAmountToken").text(tokenBalance + ' FMP');
         }).catch(function(err) {
             console.log(err.message);
         });

     });

 }

}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
