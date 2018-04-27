require('dotenv').config();

var restify = require('restify');
var builder = require('botbuilder');

//Server
var server = restify.createServer();
server.listen(process.env.PORT, function(){
    console.log("%s listening to %s", server.name,server.url)
})

//Connector
var connector = new builder.ChatConnector({
    appId : process.env.MICROSOFT_APP_ID,
    appPassword : process.env.MICROSOFT_APP_PWD,
});

server.post('/api/messages',connector.listen());
var inMemoryStorage = new builder.MemoryBotStorage();


//Universal bot
var bot = new builder.UniversalBot(connector, [
    function(session){
    session.send("Hello");
    // session.beginDialog('greetings',session.userData.profile)},
    session.beginDialog('menu',session.userData.profile)},

    /*function(session,results){
       if(!session.userData.profile){
            session.userData.profile = results.response;
        }
        session.send(`hello ${session.userData.profile.name}`);
    },*/
    ]).set('storage',inMemoryStorage);


var menuItems={
    "Nom du bot":{
        item:'dialog1'
    },
    "Date du jour":{
        item:'dialog2'
    },
    "Heure":{
        item:'dialog3'
    }
}
bot.dialog('menu', [
    function(session){
        builder.Prompts.choice(session, 'select an option', menuItems , {listStyle: 3});
    },
    function(session,results){
        var choice = results.response.entity;
        var item=menuItems[choice].item;
        session.beginDialog(item);
    }
]);

//Fonction pour la date du jour
var jours = new Array("Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi");
var mois = new Array("Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre");
var date = new Date();
var message = jours[date.getDay()] + " ";   // nom du jour
message += date.getDate() + " ";   // numero du jour
message += mois[date.getMonth()] + " ";   // mois
message += date.getFullYear();

//Fonction pour avoir le nombre de minute
var heure = date.getHours();
var minutes = date.getMinutes();
     if(minutes < 10)
          minutes = "0" + minutes;

bot.dialog('dialog1', [
    function(session){
        session.send('Dylan Settbon');
    }
]);

bot.dialog('dialog2', [
    function(session){
        session.send("On est "+message) ;
    }
]);
bot.dialog('dialog3', [
    function(session){
        session.send("L'heure est "+heure+":"+minutes);
    }
]);


bot.dialog('greetings',[
    //Step 1
    function(session,results,skip){
            session.dialogData.profile = results || {};
            if(!session.dialogData.profile.name){
                builder.Prompts.text(session,'What is your name?')
            } else{
                skip();
            }
        },

    //Step 2
    function(session,results){
        if(results.response){
            session.dialogData.profile.name = results.response
        }
        session.endDialogWithResult({response : session.dialogData.profile});
    }
    ]);