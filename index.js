/**
 * darkTriad
 * v2.0.1
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
 *  'max': Number.POSITIVE_INFINITY,
 *  'min': Number.NEGATIVE_INFINITY,
 *  'nGrams': '[2, 3],
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
  const global = this;
  const previous = global.darkTriad;

  let async = global.async;
  let lexicon = global.lexicon;
  let lexHelpers = global.lexHelpers;
  let simplengrams = global.simplengrams;
  let tokenizer = global.tokenizer;

  if (typeof lexicon === 'undefined') {
    if (typeof require !== 'undefined') {
      async = require('async');
      lexHelpers = require('lex-helpers');
      lexicon = require('./data/lexicon.json');
      simplengrams = require('simplengrams');
      tokenizer = require('happynodetokenizer');
    } else throw new Error('darkTriad: required modules not found!');
  }

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
  * @return {Object} 'triad' 'narcissism' 'machiavellianism' 'psychopathy' keys
  */
  const darkTriad = (str, opts) => {
    // no string return null
    if (!str) {
      console.error('darkTriad: no string found. Returning null.');
      return null;
    }
    // if str isn't a string, make it into one
    if (typeof str !== 'string') str = str.toString();
    // trim whitespace and convert to lowercase
    str = str.toLowerCase().trim();
    // options defaults
    if (!opts || typeof opts !== 'object') {
      console.warn('darkTriad: using default options.');
      opts = {
        'encoding': 'freq',
        'max': Number.POSITIVE_INFINITY,
        'min': Number.NEGATIVE_INFINITY,
        'nGrams': [2, 3],
        'output': 'lex',
        'places': 9,
        'sortBy': 'lex',
        'wcGrams': false,
      };
    }
    opts.encoding = opts.encoding || 'freq';
    opts.max = opts.max || Number.POSITIVE_INFINITY;
    opts.min = opts.min || Number.NEGATIVE_INFINITY;
    opts.nGrams = opts.nGrams || [2, 3];
    opts.output = opts.output || 'lex';
    opts.places = opts.places || 9;
    opts.sortBy = opts.sortBy || 'lex';
    opts.wcGrams = opts.wcGrams || false;
    const encoding = opts.encoding;
    const output = opts.output;
    const places = opts.places;
    const sortBy = opts.sortBy;
    // convert our string to tokens
    let tokens = tokenizer(str);
    // if there are no tokens return null
    if (!tokens) {
      console.warn('darkTriad: no tokens found. Returned null.');
      return null;
    }
    // get wordcount before we add ngrams
    let wordcount = tokens.length;
    // get n-grams
    if (opts.nGrams && wordcount > 2) {
      async.each(opts.nGrams, function(n, callback) {
        if (n < wordcount) {
          tokens = tokens.concat(
            arr2string(simplengrams(str, n))
          );
        } else {
          console.warn(`nGram option "${n}" is greter than the word count. Ignoring.`);
        }
        callback();
      }, function(err) {
        if (err) console.error(err);
      });
    }
    // recalculate wordcount if wcGrams is true
    if (opts.wcGrams) wordcount = tokens.length;
    // reduce tokens to count item
    tokens = itemCount(tokens);
    // get matches from array
    const matches = getMatches(tokens, lexicon, opts.min, opts.max);
    // define intercept values
    const ints = {
      darktriad: 0.632024388686,
      machiavellianism: 0.596743883684,
      narcissism: 0.714881303759,
      psychopathy: 0.48892463341,
    };
    // calculate lexical useage
    if (output === 'matches') {
      // return matches
      return doMatches(matches, sortBy, wordcount, places, encoding);
    } else if (output === 'full') {
      // return full
      let full = {};
      async.parallel([
        function(callback) {
          full.matches = doMatches(matches, sortBy, wordcount, places, 
              encoding);
          callback();
        },
        function(callback) { 
          full.values = doLex(matches, ints, places, encoding, wordcount);
          callback();
        },
      ], function(err) {
          if (err) console.error(err);
          return full;
      });
    } else {
      if (output !== 'lex') {
        console.warn('darkTriad: output option ("' + output +
            '") is invalid, defaulting to "lex".');
      }
      // default to lexical values
      return doLex(matches, ints, places, encoding, wordcount);
    }
  };

  darkTriad.noConflict = function() {
    global.darkTriad = previous;
    return darkTriad;
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = darkTriad;
    }
    exports.darkTriad = darkTriad;
  } else {
    global.darkTriad = darkTriad;
  }
}).call(this);
