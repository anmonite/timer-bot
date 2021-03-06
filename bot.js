var fs = require('fs');

var auth = require('./auth.json');

var Discord = require('discord.js');

var GIT_REPO = 'https://github.com/link00000000/timer-bot';

var bot = new Discord.Client();

bot.on("message", function(msg) {
  var command = msg.content;
  if(command.substring(0, 6) === '!timer') {

    log(msg, 'New timer requested');

    if(command === '!timer') {

      msg.channel.send('\n**Usage**\n!timer <minutes>:<seconds>\n!timer <minutes>m <seconds>s\n!timer <minutes>m\n!timer <seconds>s');

    } else {

      if(msg.content.charAt(6) === " ") {
        var params = command.substring(7, command.length);

          // M:S
        if(params.indexOf(':') !== -1) {

          var min = parseInt(params.substring(0, params.indexOf(':')));
          var sec = parseInt(params.substring(params.indexOf(':') + 1, params.length));

          timer(msg, toMilli(min, sec));

        }

          // Mm Ss
        if(params.indexOf('m') !== -1 && params.indexOf(' ') !== -1 && params.indexOf('s') !== -1) {

          var min = parseInt(params.substring(0, params.indexOf('m')));
          var sec = parseInt(params.substring(params.indexOf(' ') + 1, params.length));

          timer(msg, toMilli(min, sec));

          // Mm
        } else if(params.indexOf('m') !== -1) {

          var min = parseInt(params);
          var sec = 0;

          timer(msg, toMilli(min, sec));

          // Ss
        } else if(params.indexOf('s') !== -1) {

          var min = 0;
          var sec = parseInt(params);

          timer(msg, toMilli(min, sec));

          // Unknown Time
        } else {
          msg.channel.send('\n' + params + ' is not a valid time.\nType !timer for formatting.');
          log(msg, 'Invalid time format. ' + params);
        }
      } else {
          // Github Repo
        if(msg.content === "!timergit" || msg.content === "!timergithub") {
          msg.channel.send('\nGithub: ' + GIT_REPO);
          log(msg, 'Requested link to github repo.');

          // list Commands
        } else if (msg.content === '!timerhelp') {
          var commands =  '\n**Commands List**\n' +
                '  • !timer <length> | Sets a timer with the given length. Type !timer for time formatting.\n' +
                '  • !timerhelp | Shows this list.\n' +
                '  • !timergit | Links to the github repository.\n' +
                '  • !timergithub | Links to the github repository.';
          msg.channel.send(commands);
          log(msg, 'Commands List was requested');
        } else {

          // Default Unknown
          msg.channel.send('\nCommand Unknown\nType !bf4help for a list of commands.');
          log(msg, 'Unknown Command. ' + msg.content);
        }
      }

    }

  }
});

// Converts minutes and seconds into milliseconds
function toMilli(min, sec) {

  var milli = 0;

  milli += min * 60000;
  milli += sec * 1000;

  return milli;

}

// Converts milliseconds into minutes and seconds
function fromMilli(milli) {

  var min = 0;
  var sec = 0;

  sec = milli / 1000;
  min = Math.floor(sec / 60);
  sec -= min * 60;

  if(sec < 10) {
    sec = '0' + sec.toString();
  }
  if(min < 10) {
    min = '0' + min.toString();
  }

  return min + ':' + sec;

}

// Sets the timer
function timer(msg, duration) {

  bot.reply(msg,'Timer has been set for ' + fromMilli(duration));
  log(msg, 'Timer has been set for ' + fromMilli(duration));

	var remain_sec = duration;

	var ID = setInterval(function() {
		remain_sec -= 1000;

		if (remain_sec > 60000) {
			if (remain_sec % 60000 == 0) {
				msg.channel.send('Timer remain : '+fromMilli(remain_sec));
			}
		}
		if ((remain_sec > 10000) && (remain_sec <= 60000)) {
			if (remain_sec % 10000 == 0) {
				msg.channel.send('Timer remain : '+fromMilli(remain_sec));
			}
		}
		if (remain_sec <= 10000) {
			msg.channel.send('Timer remain : '+fromMilli(remain_sec));
		}
	}, 1000);

  setTimeout(function() {

	clearInterval(ID);
    bot.reply(msg, 'Timer has finished!');

  }, duration);
}

bot.login(auth.email, auth.password);

function log(msg, text) {

  var date = new Date();
  var timestamp;
    var hrs, mins, secs;
    if(date.getHours() < 10) {
      hrs = "0".toString() + date.getHours().toString();
    } else { hrs = date.getHours(); }
    if(date.getMinutes() < 10) {
      mins = "0".toString() + date.getMinutes().toString();
    } else { mins = date.getMinutes(); }
    if(date.getSeconds() < 10) {
      secs = "0".toString() + date.getSeconds().toString();
    } else { secs = date.getSeconds(); }
  timestamp = '[' + hrs +':' + mins + ':' + secs + ']';
  var author = '[' + msg.author.username + ']';
  var data = timestamp + ' ' + author + ' ' + text;

  var fileName = './logs/' + (date.getMonth() + 1).toString() + '-' + date.getDate().toString() + '-' + date.getFullYear().toString() + '.log';

  console.log(data);

  try {
    fs.accessSync(fileName, fs.F_OK);
    fs.appendFile(fileName, data + '\r');
  } catch (err) {
    fs.writeFile(fileName, data);
  }

}
