exports.run = async (message, client, args, config) => {
  
  const helpE = new client.embed()
  .setAuthor(client.user.username + "", client.user.displayAvatarURL())
  .setDescription("Holla!")
  .setColor(config.embed)
  .setFooter(`${config.prefix}help [category]`)
  
  client.modules.forEach(cat => {
    helpE.addField(`${cat.emoji} - ${cat.name}`, `**${cat.description}**`, true)
  });
  
  message.channel.send(helpE)
  
}

exports.config = {
  name: "help",
  description: "",
  aliases: ["h", "cmds", "cmdslist"],
  cooldown: 10
}