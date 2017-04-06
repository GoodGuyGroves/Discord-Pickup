"use strict";

/**
* TODO: Apparently I should replace MUH ITERATORS with higher-order functions
* TODO: Separate pickup logic into it's own repo? Remove team format and stuff
*/

class Pickup {
  constructor (settings = {}) {
    // Just constructor doing constructor things.
    // settings is a dict of params.
    this.game_on = false;
    this.max_teams = settings.max_teams;
    this.team_size = settings.team_size;
    this.teams = this.reset_teams(this.max_teams, this.team_size, this.team_filler);
    this.player_count = 0;
  }

  // Helper functions I guess? But not really?
   isAdded(nick) {
    /**
    * Checks each element of each array of this.teams and checks
    * if it is the same as the nickname given.
    * Returns true or false.
    */
    return this.teams.some(element => element.includes(nick));
  }

  _open_spot(team) {
    /**
    * Returns the index of the first open spot ("?") in a given
    * team (this.teams[team] array) for adding purposes.
    * Returns -1 if the team is full.
    */
    return this.teams[team].indexOf("?");
  }

  _sort_arr(arr) {
  // Does some magic to sort an array
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  let mapped = arr.map((element, index) => {
    return { index: index, value: element}
  });
  mapped.sort((a, b) => {
    return +(a.value < b.value) || +(a.value === b.value) - 1;
  });
  let result = mapped.map((element) => {
    return arr[element.index];
  });
    return result;
  }

  // Big boy functions

  start_game(max_teams = this.max_teams, team_size = this.team_size) {
    /**
    * Starts a game, duh!
    * Can create pickups with varying number of teams and team sizes.
    */
    this.game_on = true;
    this.max_teams = max_teams;
    this.team_size = team_size;
    this.teams = this.reset_teams(this.max_teams, this.team_size, this.team_filler);
    return true;
  }

  cancel_game() {
    // Cancels a game and resets the teams arrays.
    this.game_on = false;
    this.teams = this.reset_teams(this.max_teams, this.team_size, this.team_filler); // Redundancy?
    this.player_count = 0;
    return true;
  }

  add(team, nick) {
    /**
    * Adds a player to a particular team (this.teams[team]).
    * Returns false if already added, 0 if there is no space
    * and true if added successfully.
    * My returns are weird but they are exactly that, MY returns.
    */
    if (!this.isAdded(nick)) {
      if (this._open_spot(team) != -1) {
        this.teams[team][this._open_spot(team)] = nick;
        this.teams[team] = this._sort_arr(this.teams[team]);
        this.player_count += 1;
        return true;
      } else
      if (this._open_spot(team) == -1) {
        return 0;
      }
    } else
    if (this.isAdded(nick)) {
      return false;
    }
  }

  random_add(nick) {
    /**
    * This, uhhh... adds a player to a random team?
    * Returns true or false.
    * TODO: Rewrite sometime ¯\_(ツ)_/¯
    */
    let arr = []
    for (let i = 0; i < this.teams.length; i++) {
      if (this._open_spot(i) > -1) {
        arr.push(i);
      }
    }

    if (arr[0] == undefined) {
      return false;
    }
    let team = Math.round(Math.random() * (arr.length - 1))
    if (team > -1) {
      this.add(arr[team], nick);
      return true;
    } else {
      // Redundant, I know.
      console.log("All teams are full?");
      return false;
    }
  }

  remove(nick) {
    // Removes a player from any team. Returns a new 2D array
    if (isAdded(nick)) {
      return arr.map((x) => {
        return x.map((y) => {
          return y === nick ? '?' : y
        })
      })
    }
  }

  /**
  * Returns a dynamically sized 2-D array (sized based on input)
  * but makes each element equal to "?" to denote a fresh pickup.
  */
  reset_teams = (width, depth, filler) => new Array(width).fill(undefined).map(() => new Array(depth).fill(filler));

  get display_teams() {
    /**
    * Uses the array "this.teams" and returns a string of
    * all players added to every team in the format:
    * Team A: (Russ), (?), (?), (?), (?) Team B: (Gryph), (Zoid), (?), (?), (?) - etc
    */
    let alphabet = ["A", "B", "C", "D", "E", "F", "G" ,"H", "I",
    "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U",
    "V", "W", "X", "Y", "Z"];
    let fence = '\`\`\`'
    let teams = "";
    for (let i = 0; i < this.teams.length; i++) {
      teams += `${fence}Team ${alphabet[i]}: (${this.teams[i].join("), (")})${fence}`
    }
    return teams;
  }
};

module.exports = {
  Pickup: Pickup
};
