  
const config = require("../../config.js");
const jointocreatemap = require("quick.db");
module.exports = function (client) {
    const description = {
        name: "jointocreate",
        filename: "jointocreate.js",
        version: "3.2"
    }
     //SECURITY LOOP

    
//log that the module is loaded
    console.log(`Loaded join to create!`)
//voice state update event to check joining/leaving channels
    client.on("voiceStateUpdate", async (oldState, newState) => {
    let jfcID = await jointocreatemap.get(`jfc.${newState.guild.id}`);
    if (!jfcID) return;
      
  new Promise(resolve => {
      resolve(2);
        try{
          const guild = client.guilds.cache.get(newState.guild.id);
          const channels = guild.channels.cache.map(ch => ch.id)
          for (let i = 0; i < channels.length; i++) {
            const key = `tempvoicechannel_${guild.id}_${channels[i]}`;
            if (jointocreatemap.get(key)) {
              var vc = guild.channels.cache.get(jointocreatemap.get(key));
              if (vc.members.size < 1) {
                jointocreatemap.delete(key);
                return vc.delete();
              } else {}
            }
          }
      }catch{
        
      }
  })
  // JOINED V12
  if (!oldState.channelID && newState.channelID) {
    if(newState.channelID !== jfcID) return;  //if its not the jointocreatechannel skip
    jointocreatechannel(newState);   //load the function
  }
  // LEFT V12
  if (oldState.channelID && !newState.channelID) {
            //get the jointocreatechannel id from the map
          if (jointocreatemap.get(`tempvoicechannel_${oldState.guild.id}_${oldState.channelID}`)) {
            //fetch it from the guild
            var vc = oldState.guild.channels.cache.get(jointocreatemap.get(`tempvoicechannel_${oldState.guild.id}_${oldState.channelID}`));
            //if the channel size is below one
            if (vc.members.size < 1) { 
              //delete it from the map
              jointocreatemap.delete(`tempvoicechannel_${oldState.guild.id}_${oldState.channelID}`); 
              //delete the voice channel
              jointocreatemap.delete(`chl.${oldState.guild.id}.${oldState.channelID}`);
              // delete user
              jointocreatemap.delete(`jfc.${oldState.member.user.id}.voice`)
              jointocreatemap.set(`jfc.${oldState.member.user.id}.joined`, false)
              jointocreatemap.set(`lock.${oldState.channelID}`, false)
              
              return vc.delete(); 
          }
            else {
            }
          }
  }
  // Switch v12
  if (oldState.channelID && newState.channelID) {
  
    if (oldState.channelID !== newState.channelID) {
      //if its the join to create channel
      if(newState.channelID=== jfcID) 
      //make a new channel
      jointocreatechannel(oldState);  
      //BUT if its also a channel ín the map (temp voice channel)
      if (jointocreatemap.get(`tempvoicechannel_${oldState.guild.id}_${oldState.channelID}`)) {
        //fetch the channel
        var vc = oldState.guild.channels.cache.get(jointocreatemap.get(`tempvoicechannel_${oldState.guild.id}_${oldState.channelID}`));
        //if the size is under 1
        if (vc.members.size < 1) { 
          //delete it from the map
          jointocreatemap.delete(`tempvoicechannel_${oldState.guild.id}_${oldState.channelID}`); 
        //delete the room
          jointocreatemap.delete(`chl.${oldState.guild.id}.${oldState.channelID}`);
        // delete user
          jointocreatemap.delete(`jfc.${oldState.member.user.id}.voice`)
          jointocreatemap.set(`jfc.${oldState.member.user.id}.joined`, false)
          jointocreatemap.set(`lock.${oldState.channelID}`, false)
          
          return vc.delete(); 
      }
      else {
      }
      }
    }
}
  })
    async function jointocreatechannel(user) {
    let pad_zero = num => (num < 10 ? '0' : '') + num;
    let cooldown = 5000;
    let lastCreate = jointocreatemap.get(`lastcvc.${user.member.user.id}`);
    let ms = require("parse-ms");  
      
        if (lastCreate !== null && cooldown - (Date.now() - lastCreate) > 0) {
            let timeObj = ms(cooldown - (Date.now() - lastCreate));

       
                let mins = pad_zero(timeObj.minutes).padStart(2, "0"),
                secs = pad_zero(timeObj.seconds).padStart(2, "0");

            let finalTime = `**${mins}:${secs}**`;
            let findUser1 = await client.users.fetch(user.member.user.id);
          
            user.member.voice.kick()
          
            return client.users.cache.get(findUser1.id).send(`You are too fast to create a voice channel, please wait for ${finalTime}\n\nspam protection`);
          
        } else { 
      
      let jfcID;
      let jtcChannel = await jointocreatemap.get(`jfc.${user.guild.id}`);
      let userChlName = jointocreatemap.get(`jfc.${user.member.user.id}.name`);
      if (!userChlName) userChlName = `🔊 - ${user.member.user.username} Voice`
      
      let findJTC = await client.channels.fetch(`${jtcChannel}`);
          
      await user.guild.channels.create(userChlName, {
        type: 'voice',
        parent: findJTC.parent.id, //or set it as a category id
      }).then(async vc => {
        //move user to the new channel
        user.setChannel(vc); 
        
        //set the new channel to the map
        jointocreatemap.set(`tempvoicechannel_${vc.guild.id}_${vc.id}`, vc.id);
        jointocreatemap.set(`jfc.${user.member.user.id}.joined`, true)
        jointocreatemap.set(`jfc.${user.member.user.id}.voice`, vc);
        jointocreatemap.set(`ownerJFC.${vc.id}`, user.member.user)
        jointocreatemap.set(`lock.${vc.id}`, false)
        //change the permissions of the channel
        await vc.overwritePermissions([
          {
            id: user.id,
            allow: ['MANAGE_CHANNELS', 'CONNECT'],
          },
          {
            id: user.guild.id,
            allow: ['VIEW_CHANNEL', 'CONNECT'],
          },
        ]);
      })
          
          jointocreatemap.set(`lastcvc.${user.member.user.id}`, Date.now())
        }      
    }
}