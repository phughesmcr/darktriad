/**
 * darkTriad
 * v3.1.1
 *
 * Analyse the dark triad (narcissism, Machiavellianism, and psychopathy) of a
 * string.
 *
 * Help me make this better:
 * https://github.com/phugh/darktriad
 *
 * Based on this publication:
 * darktriad2016cikm:
 *  Studying the Dark Triad of Personality using Twitter Behavior,
 *  Preotiuc-Pietro, Daniel and Carpenter, Jordan and Giorgi, Salvatore and
 *  Ungar, Lyle, {CIKM},
 *  Proceedings of the 25th {ACM} Conference on Information and Knowledge
 *  Management, 2016
 *
 * Using the data lexicon data from:
 * https://sites.sas.upenn.edu/danielpr/pages/resources
 * Used under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0
 * Unported licence
 *
 * (C) 2017 P. Hughes
 * Licence : Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 * Usage example:
 * const darktriad = require('darktriad');
 * const opts = {
 *  'encoding': 'freq',
 *  'locale': 'US',
 *  'logs': 2,
 *  'max': Number.POSITIVE_INFINITY,
 *  'min': Number.NEGATIVE_INFINITY,
 *  'nGrams': '[2, 3],
 *  'noInt: false,
 *  'output': 'lex',
 *  'places': 9,
 *  'sortBy': 'lex',
 *  'wcGrams': false,
 * }
 * const str = 'A big long string of text...';
 * const triad = darktriad(str, opts);
 * console.log(triad)
 *
 * See README.md for help.
 *
 * @param {string} str  input string
 * @param {Object} opts options object
 * @return {Object}
 */

(function() {
  'use strict';

  // Lexicon data
  const lexicon = require('./data/lexicon.json');

  // External modules
  const async = require('async');
  const trans = require('british_american_translate');
  const simplengrams = require('simplengrams');
  const tokenizer = require('happynodetokenizer');
  const lexHelpers = require('lex-helpers');
  const arr2string = lexHelpers.arr2string;
  const doLex = lexHelpers.doLex;
  const doMatches = lexHelpers.doMatches;
  const getMatches = lexHelpers.getMatches;
  const itemCount = lexHelpers.itemCount;

  /**
  * Analyse the dark triad of a string
  * @function darkTriad
  * @param  {string} str    input string
  * @param  {Object} opts   options object
  * @return {Object} 'triad', 'narcissism', 'machiavellianism', 'psychopathy' keys
  */
  const darkTriad = (str, opts = {}) => {
    // default options
    opts.encoding = (typeof opts.encoding !== 'undefined') ? opts.encoding : 'freq';
    opts.locale = (typeof opts.locale !== 'undefined') ? opts.locale : 'US';
    opts.logs = (typeof opts.logs !== 'undefined') ? opts.logs : 2;
    if (opts.suppressLog) opts.logs = 0;
    opts.max = (typeof opts.max !== 'undefined') ? opts.max : Number.POSITIVE_INFINITY;
    opts.min = (typeof opts.min !== 'undefined') ? opts.min : Number.NEGATIVE_INFINITY;
    if (typeof opts.max !== 'number' || typeof opts.min !== 'number') {
      // try to convert to a number
      opts.min = Number(opts.min);
      opts.max = Number(opts.max);
      // check it worked, or else default to infinity
      opts.max = (typeof opts.max !== 'number') ? opts.max : Number.POSITIVE_INFINITY;
      opts.min = (typeof opts.min !== 'number') ? opts.min : Number.NEGATIVE_INFINITY;
    }
    opts.nGrams = (typeof opts.nGrams !== 'undefined') ? opts.nGrams : [2, 3];
    if (!Array.isArray(opts.nGrams)) {
      if (opts.nGrams === 0 || opts.nGrams === '0') {
        opts.nGrams = [0];
      } else if (opts.logs > 1) {
        console.warn('darkTriad: nGrams option must be an array! ' + 
            'Defaulting to [2, 3].');
        opts.nGrams = [2, 3];
      }
    }
    opts.noInt = (typeof opts.noInt !== 'undefined') ? opts.noInt : false;
    opts.output = (typeof opts.output !== 'undefined') ? opts.output : 'lex';
    opts.places = (typeof opts.places !== 'undefined') ? opts.places : 9;
    opts.sortBy = (typeof opts.sortBy !== 'undefined') ? opts.sortBy : 'lex';
    opts.wcGrams = (typeof opts.wcGrams !== 'undefined') ? opts.wcGrams : false;
    // cache frequently used options
    const encoding = opts.encoding;
    const logs = opts.logs;
    const nGrams = opts.nGrams;
    const output = opts.output;
    const places = opts.places;
    const sortBy = opts.sortBy;
    // no string return null
    if (!str) {
      if (logs > 1) console.warn('darkTriad: no string found. Returning null.');
      return null;
    }
    // if str isn't a string, make it into one
    if (typeof str !== 'string') str = str.toString();
    // convert to lowercase and trim whitespace 
    str = str.toLowerCase().trim();
    // translalte US English to UK English if selected
    if (opts.locale.match(/gb/gi)) str = trans.uk2us(str);
    // convert our string to tokens
    let tokens = tokenizer(str, {logs: opts.logs});
    // if there are no tokens return null
    if (!tokens) {
      if (logs > 1) console.warn('darkTriad: no tokens found. Returned null.');
      return null;
    }
    // get wordcount before we add n-grams
    let wordcount = tokens.length;
    // get n-grams
    if (nGrams && nGrams[0] !== 0) {
      async.each(nGrams, function(n, callback) {
        if (wordcount < n) {
          callback(`wordcount (${wordcount}) less than n-gram value (${n}). Ignoring.`);
        } else {
          tokens = [...arr2string(simplengrams(str, n, {logs: logs})), ...tokens];
          callback();
        }
      }, function(err) {
        if (err && logs > 0) console.error('darkTriad: nGram error: ', err);        
      });
    }
    // recalculate wordcount if wcGrams is true
    if (opts.wcGrams === true) wordcount = tokens.length;
    // get matches from array
    const matches = getMatches(itemCount(tokens), lexicon, opts.min, opts.max);
    // define intercept values
    let ints = {
      darktriad: 0.632024388686,
      machiavellianism: 0.596743883684,
      narcissism: 0.714881303759,
      psychopathy: 0.48892463341,
    };
    if (opts.noInt == true) {
      ints = {
        darktriad: 0,
        machiavellianism: 0,
        narcissism: 0,
        psychopathy: 0,
      };
    }
    // calculate lexical useage
    if (output.match(/matches/gi)) {
      // return matches
      return doMatches(matches, sortBy, wordcount, places, encoding);
    } else if (output.match(/full/gi)) {
      // return matches and values in one object
      let results;
      async.parallel({
        matches: function(callback) {
          callback(null, doMatches(matches, sortBy, wordcount, places, 
              encoding));
        },
        values: function(callback) {
          callback(null, doLex(matches, ints, places, encoding, wordcount));
        },
      }, function(err, res) {
        if (err && logs > 0) console.error('darkTriad: ' + err);
        results = res;
      });
      return results;
    } else {
      if (!output.match(/lex/gi) && logs > 1) {
        console.warn('darkTriad: output option ("' + output +
            '") is invalid, defaulting to "lex".');
      }
      // default to lexical values
      return doLex(matches, ints, places, encoding, wordcount);
    }
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = darkTriad;
    }
    exports.darkTriad = darkTriad;
  } else {
    global.darkTriad = darkTriad;
  }
})();
