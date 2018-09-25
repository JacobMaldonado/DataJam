
// Initialize the default app
var admin = require('firebase-admin');
var app = admin.initializeApp({databaseURL: "https://botfuncionarios.firebaseio.com"});
//database
var db = admin.database();
var ref = db.ref("sancionados");

const functions = require('firebase-functions');
const {
    WebhookClient
} = require('dialogflow-fulfillment');
const {
    Card,
    Suggestion
} = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({
        request,
        response
    });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    // // Uncomment and edit to make your own intent handler
    // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    function intentFuncionario(agent) {
        var name = "";
        var params = request.body.queryResult.parameters;
        name += params["given-name"];
        if(params["given-name1"]){
            name += " " + params["given-name1"];
        }
        name += " " + params["last-name"];
        /*for(var text in request.body.queryResult.parameters){
            name += request.body.queryResult.parameters[text] + " ";
        }*/
        //name = "DESSIRE GUTIERREZ MARTINEZ";
        
        agent.add(`Para ` + name + "");
        return ref.once("value", function(snapshot) {
            var log = "No se encontro casos de sancion";
            var n = 1;
            var info = snapshot.val();
            for(var data in info){
                /*if( n == 1){
                    log = info[data].ServidorPublico;
                    n = 0;
                }*/
                if(info[data].ServidorPublico == name){
                    log = "Se encontro un caso de sancion \n"
                    + JSON.stringify(info[data]);
                }
            }
            console.log("log " + log);
            agent.add(name + " " +log);
            return Promise.resolve(console.log("finish"));
        })
    }

    // // Uncomment and edit to make your own Google Assistant intent handler
    // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function googleAssistantHandler(agent) {
    //   let conv = agent.conv(); // Get Actions on Google library conv instance
    //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
    //   agent.add(conv); // Add Actions on Google library responses to your agent's response
    // }
    // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
    // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set('Funcionario', intentFuncionario);
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);
});