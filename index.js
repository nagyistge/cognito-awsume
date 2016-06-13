var AWS = require('aws-sdk');
var AWSCognito = require('./aws-cognito/index');

// Hard coded constants because life is hard coded
var AWS_REGION = 'us-east-1';
var IDENTITY_POOL_ID = 'us-east-1:aaaaaaa-11111-aaaa-1111-aaaaaaaa';
var USER_POOL_ID = 'us-east-1_aaaa11111';
var USER_POOL_CLIENT_ID = 'a1a1a1a1a1a1a1a1a1a1a1a1';
var AWS_ACCOUNT_ID = '1234567891012';
var AUTH_IAM_ROLE_ARN = 'arn:aws:iam::1234567891012:role/avengers';


// AWS configured twice with different namespaces
//   because if anything is worth doing, it's worth doing twice
// (Seriously though, this is a direct result of aws user pools using a namespaced AWSCognito interface in their cognitouser lib)

AWS.config.region = AWS_REGION; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
   IdentityPoolId: IDENTITY_POOL_ID // your identity pool id here
});

AWSCognito.config.region = AWS_REGION; // Region
AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
   IdentityPoolId: IDENTITY_POOL_ID // your identity pool id here
});

// Need to provide placeholder keys unless unauthorised user access is enabled for user pool
AWSCognito.config.update({accessKeyId: 'anything', secretAccessKey: 'anything'})

/* Example calls */

// Uncomment and run node index.js (super hack, too lazy to fix)

// signUp('BruceBanner', 'GetAngry@P4nts', [{Name: 'email', Value: 'hulkup@example.com'}, {Name: 'phone_number', Value: '+15555555'}])
// confirmUser('BruceBanner', '390378');
// signIn('BruceBanner', 'GetAngry@P4nts');
// getCredsWithIdToken('biglong.jwt.idTokenHere');

function signUp(username, password, attributesArray){
    var poolData = {
        UserPoolId : USER_POOL_ID,
        ClientId : USER_POOL_CLIENT_ID
    };

    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

    var attributeList = [];
    attributesArray.map(function(attrib){
        attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(attrib));
    });

    userPool.signUp(username, password, attributeList, null, function(err, result){
        if (err) {
            console.log(err);
            return;
        }
        cognitoUser = result.user;
        console.log('user name is ' + cognitoUser.getUsername());
        console.log(JSON.stringify(cognitoUser));
    });
}

function confirmUser(username, code){
  var poolData = {
      UserPoolId : USER_POOL_ID,
      ClientId : USER_POOL_CLIENT_ID
  };

  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
  var userData = {
      Username : username,
      Pool : userPool
  };

  var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
  cognitoUser.confirmRegistration(code, true, function(err, result) {
      if (err) {
          console.log(err);
          return;
      }
      console.log('call result: ' + result);
  });
}

function signIn(username, password) {
  var authenticationData = {
      Username: username,
      Password: password
  };

  var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
  var poolData = {
      UserPoolId : USER_POOL_ID,
      ClientId : USER_POOL_CLIENT_ID
  };

  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
  var userData = {
      Username : username,
      Pool : userPool
  };
  var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
          console.log('access token + ' + result.getAccessToken().getJwtToken());
          console.log('id token + ' + result.getIdToken().getJwtToken());

          getCredsWithIdToken(result.getIdToken().getJwtToken());
      },

      onFailure: function(err) {
          console.log("Sign in failed...");
          console.log(err);
      },

  });
}


function getCredsWithIdToken(idToken){
  logins = {};
  logins['cognito-idp.us-east-1.amazonaws.com/'+USER_POOL_ID] = idToken;
  // Trade token for temp creds
  //Params for making the API call
  var params = {
      // AccountId: AWS_ACCOUNT_ID, // AWS account Id
      // RoleArn: AUTH_IAM_ROLE_ARN, // IAM role that will be used by authentication
      IdentityPoolId: IDENTITY_POOL_ID, //ID of the identity pool
      Logins: logins
  };

  //Initialize the Credentials object
  AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);
  AWS.config.credentials.get(function(err) {
      if (err) {
          console.log("Error: "+err);
          return;
      }
      console.log("Cognito Identity Id: " + JSON.stringify(AWS.config.credentials.data.IdentityId));
      console.log("AWS_ACCESS_KEY_ID: " + JSON.stringify(AWS.config.credentials.data.Credentials.AccessKeyId));
      console.log("AWS_SECRET_ACCESS_KEY: " + JSON.stringify(AWS.config.credentials.data.Credentials.SecretKey));
      console.log("AWS_SESSION_TOKEN: " + JSON.stringify(AWS.config.credentials.data.Credentials.SessionToken));
  });
}
