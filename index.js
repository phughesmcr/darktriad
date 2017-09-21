/**
 * darkTriad
 * v1.0.0
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
 *  Ungar, Lyle, CIKM,
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
 *  'nGrams': 'true',
 *  'output': 'lex',
 *  'places': 9,
 *  'sortBy': 'lex',
 *  'wcGrams': 'false',
 * }
 * const str = 'A big long string of text...';
 * const triad = darktriad(str, opts);
 * console.log(triad)
 *
 * See README.md for help.
 *
 * @param {string} str input string
 * @param {Object} opts options object
 * @return {Object} object with 'triad', 'narcissism', 'machiavelli', and
 *                  'psychopathy' keys
 */

'use strict'
;(function() {
  const global = this;
  const previous = global.darkTriad;

  let triad = global.triad;
  let narcissism = global.narcissism;
  let machiavelli = global.machiavelli;
  let psychopathy = global.psychopathy;

  let lexHelpers = global.lexHelpers;
  let simplengrams = global.simplengrams;
  let tokenizer = global.tokenizer;

  if (typeof lexicon === 'undefined') {
    if (typeof require !== 'undefined') {
      triad = require('./data/darktriad.json');
      narcissism = require('./data/narcissism.json');
      machiavelli = require('./data/machiavellianism.json');
      psychopathy = require('./data/psychopathy.json');
      lexHelpers = require('lex-helpers');
      simplengrams = require('simplengrams');
      tokenizer = require('happynodetokenizer');
    } else throw new Error('darkTriad required modules not found!');
  }

  const arr2string = lexHelpers.arr2string;
  const calcLex = lexHelpers.calcLex;
  const getMatches = lexHelpers.getMatches;
  const prepareMatches = lexHelpers.prepareMatches;

  /**
   * @function doLex
   * @param  {Object} matches   lexical matches object
   * @param  {number} places    decimal places limit
   * @param  {string} encoding  type of lexical encoding
   * @param  {number} wordcount total word count
   * @return {Object} lexical values object
   */
  const doLex = (matches, places, encoding, wordcount) => {
    const lex = {};
    lex.triad = calcLex(matches.triad, 0.632024388686, places, encoding,
        wordcount);
    lex.machiavellianism = calcLex(matches.machiavellianism, 0.596743883684,
        places, encoding, wordcount);
    lex.narcissism = calcLex(matches.narcissism, 0.714881303759, places,
        encoding, wordcount);
    lex.psychopathy = calcLex(matches.psychopathy, 0.48892463341, places,
        encoding, wordcount);
    return lex;
  };

  /**
   * @function doMatches
   * @param  {Object} matches   lexical matches object
   * @param  {string} sortBy    how to sort arrays
   * @param  {number} wordcount total word count
   * @param  {number} places    decimal places limit
   * @param  {string} encoding  type of lexical encoding
   * @return {Object} sorted matches object
   */
  const doMatches = (matches, sortBy, wordcount, places, encoding) => {
    const match = {};
    match.triad = prepareMatches(matches.triad, sortBy, wordcount, places,
        encoding);
    match.machiavellianism = prepareMatches(matches.machiavellianism, sortBy,
        wordcount, places, encoding);
    match.narcissism = prepareMatches(matches.narcissism, sortBy, wordcount,
        places, encoding);
    match.psychopathy = prepareMatches(matches.psychopathy, sortBy, wordcount,
        places, encoding);
    return match;
  };

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
      opts = {
        'encoding': 'freq',
        'max': Number.POSITIVE_INFINITY,
        'min': Number.NEGATIVE_INFINITY,
        'nGrams': 'true',
        'output': 'lex',
        'places': 9,
        'sortBy': 'lex',
        'wcGrams': 'false',
      };
    }
    opts.encoding = opts.encoding || 'freq';
    opts.max = opts.max || Number.POSITIVE_INFINITY;
    opts.min = opts.min || Number.NEGATIVE_INFINITY;
    opts.nGrams = opts.nGrams || 'true';
    opts.output = opts.output || 'lex';
    opts.places = opts.places || 9;
    opts.sortBy = opts.sortBy || 'lex';
    opts.wcGrams = opts.wcGrams || 'false';
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
    if (opts.nGrams.toLowerCase() === 'true') {
      const bigrams = arr2string(simplengrams(str, 2));
      const trigrams = arr2string(simplengrams(str, 3));
      tokens = tokens.concat(bigrams, trigrams);
    }
    // recalculate wordcount if wcGrams is true
    if (opts.wcGrams.toLowerCase === 'true') wordcount = tokens.length;
    // get matches from array
    const matches = {
      triad: getMatches(tokens, triad, opts.min, opts.max).darktriad,
      narcissism: getMatches(tokens, narcissism, opts.min, opts.max).narcissism,
      machiavellianism: getMatches(tokens, machiavelli, opts.min,
          opts.max).machiavellianism,
      psychopathy: getMatches(tokens, psychopathy, opts.min,
          opts.max).psychopathy,
    };
    // calculate lexical useage
    if (output === 'matches') {
      // return matches
      return doMatches(matches, sortBy, wordcount, places, encoding);
    } else if (output === 'full') {
      // return full
      const full = {};
      full.matches = doMatches(matches, sortBy, wordcount, places, encoding);
      full.values = doLex(matches, places, encoding, wordcount);
      return full;
    } else {
      if (output !== 'lex') {
        console.warn('darkTriad: output option ("' + output +
            '") is invalid, defaulting to "lex".');
      }
      // default to lexical values
      return doLex(matches, places, encoding, wordcount);
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
