"use strict";
/**
* TODO: Optimise using: http://paste2.org/tJEOmns0
* TODO: Remove lots of repeated code with: http://paste2.org/MHEsg77I
*/

const Discord = require("discord.js");
const Pickup = require('./pickup');
const config = require("./config.json");

const bot = new Discord.Client();
const pickup = new Pickup.Pickup({max_teams: config.max_teams, team_size: config.team_size, config.team_filler});

// Small helper things
const _game_on = function isGameOn() {
  return pickup.game_on;
};

const _clean = function cleanText(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
};

const _shuffle = function teamShuffle(array) {
  // Fisher-Yates shuffle
  // Taken verbatim from the second answer on this question:
  // http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
};

bot.on("ready", () => {
  console.log("Bot running...");
});

bot.on("message", message => {

  const _has_perms = function userHasPerms(req_perm) {
    let required_role = message.guild.roles.find("name", req_perm);
    if (message.member.roles.has(required_role.id)) {
      return true;
    } else return false;
  };

  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  let cmd = message.content.split(" ")[0].slice(config.prefix.length);
  let args = message.content.split(" ").slice(1);
  let user = message.member.user.username;

  console.log(`[${message.member.user.username}] ${message.content}`);

  if (cmd === "sg" || cmd === "start") {
    if (!_game_on()) {
      if (_has_perms("@")) {
        if (args.length > 0) {
          pickup.start_game(args[0], args[1]);
          message.channel.sendMessage(pickup.display_teams);
          return;
        } else {
          pickup.start_game();
          message.channel.sendMessage(pickup.display_teams);
          return;
        }
        message.channel.sendMessage(pickup.display_teams);
      } else {
        message.reply("You don't have access to this command.");
        return;
      }
    } else {
      message.reply("There is already a game on.");
      return;
    }
  }

  if (cmd == "rg" || cmd == "reset") {
    // Yes, yes, I know, DRY.
    if (_game_on()) {
      if (_has_perms("@")) {
        if (args.length > 0) {
          pickup.start_game(args[0], args[1]);
          message.channel.sendMessage(pickup.display_teams);
        } else {
          pickup.start_game();
          message.channel.sendMessage(pickup.display_teams);
        }
      } else {
        message.reply("You don't have access to this command.");
      }
    } else {
      message.reply("There is no game on.");
    }
  }

  if (cmd == "cg" || cmd == "cancel") {
    if (_game_on()) {
      if (_has_perms("@")) {
        pickup.cancel_game();
        message.channel.sendMessage("The game has been cancelled.");
      } else {
        message.reply("You don't have access to this command.");
      }
    } else {
      message.reply("There is no game on.");
    }
  }

  if (cmd == "add") {
    let alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k",
    "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    if (_game_on()) {
    //   message.reply(`Usage: "${config.prefix}add ([1|a])" - Specifying a team is optional and can be specified by number or character.`);
      if (!pickup.isAdded(user)) {
        if (args.length > 0) {
          if (isNaN(parseInt(args[0]))) {
            args[0] = alphabet.indexOf(args[0]);
          } else {
            args[0] = parseInt(args[0]) - 1;
          }
          pickup.add(args[0], user);
          if (pickup.player_count == pickup.max_teams * pickup.team_size) {
            message.channel.sendMessage("All teams are full, the game will commence. Please be in the lobby within 5 minutes.");
            message.channel.sendMessage(pickup.display_teams);
            pickup.cancel_game();
          } else {
            message.channel.sendMessage(pickup.display_teams);
          }
        } else {
          pickup.random_add(user);
          if (pickup.player_count == pickup.max_teams * pickup.team_size) {
            message.channel.sendMessage("All teams are full, the game will commence. Please be in the lobby within 5 minutes.");
            message.channel.sendMessage(pickup.display_teams);
            pickup.cancel_game();
          } else {
            message.channel.sendMessage(pickup.display_teams);
          }
        }
      } else {
        message.reply("You are already added.");
      }
    } else {
      message.reply("There is no game on.");
    }
  }

  if (cmd == "rm" || cmd == "rem" || cmd == "remove") {
    if (_game_on()) {
      if (pickup.isAdded(user)) {
        pickup.teams = pickup.remove(user);
        message.channel.sendMessage(pickup.display_teams);
      } else {
        message.reply("You are not added to the game.");
      }
    } else {
      message.reply("There is no game on.");
    }
  }

  if (cmd === "teams" || cmd === "status") {
    if (_game_on()) {
      return message.channel.sendMessage(pickup.display_teams)
    } else
    if (!_game_on()) {
      return message.channel.sendMessage("There is no game on.")
    }
  }

  // Non-critial stuff below here

  if (cmd == "shuffle") {
    if (_game_on()) {
      if (_has_perms("@")) {
        let temp_arr = [];
        for (let i = 0; i < pickup.teams.length; i++) {
          for (let j = 0; j < pickup.teams[i].length; j++) {
            temp_arr.push(pickup.teams[i][j]);
          }
        }
        temp = _shuffle(temp_arr);
        for (let i = 0; i < pickup.teams.length; i++) {
          for (let j = 0; j < pickup.teams[i].length; j++) {
            pickup.teams[i][j] = temp_arr.pop();
          }
        }
        for (let i = 0; i < pickup.teams.length; i++) {
          pickup.teams[i] = pickup._sort_arr(pickup.teams[i]);
        }
        return message.channel.sendMessage(pickup.display_teams);
      } else {
        return message.reply("You don't have access to this command.");
      }
    } else {
      return message.reply("There is no game on.");
    }
  }

  if (cmd == "fr" || cmd == "forceremove") {
    if (_game_on()) {
      if (_has_perms("@")) {
        if (pickup.isAdded(args[0])) {
          pickup.teams = pickup.remove(args[0]);
          return message.channel.sendMessage(pickup.display_teams);
        } else {
          return message.reply("Player not added to the pickup.");
        }
      } else {
        return message.reply("You don't have access to this command.");
      }
    } else {
      return message.reply("There is no game on.");
    }
  }

  // if (cmd == "reserve") {
  //   if (_game_on()) {
  //     if (_has_perms("@")) {
  //
  //     }
  //   }
  // }

  if (cmd === "eval") {
    if(message.author.id !== "<redacted>") return;
    try {
      var code = args.join(" ");
      var evaled = eval(code);

      if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);

      message.channel.sendCode("xl", _clean(evaled));
    } catch(err) {
      message.channel.sendMessage(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  }

});

bot.login(config.token);
