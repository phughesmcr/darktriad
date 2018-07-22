# darkTriad

Analyse the dark triad (narcissism, Machiavellianism, and psychopathy) of a string.

## Disclaimer

darkTriad is provided for educational and entertainment purposes only.

darkTriad does not provide, nor is it a substitute for, medical or psychological advice or diagnosis.

## Usage
```javascript
const darktriad = require('darktriad');
const opts = {
  'encoding': 'freq',
  'locale': 'US',
  'logs': 2,
  'max': Number.POSITIVE_INFINITY,
  'min': Number.NEGATIVE_INFINITY,
  'nGrams': [2, 3],
  'noInt': false,
  'output': 'lex',
  'places': 9,
  'sortBy': 'lex',
  'wcGrams': false,
}
const str = 'A big long string of text...';
const triad = darktriad(str, opts);
console.log(triad)
```

## Default Output Example
The results are the natural logarithm for each trait.

```javascript
{
  darktriad: 0.632160368,
  machiavellianism: 0.596726179,
  narcissism: 0.715042033,
  psychopathy: 0.489276573
}
```

### Errors or No Matches
If there is no input string or no matches in the lexicon, darkTriad will return null.

## The Dark Triad

### Dark Triad Score
The 'darktriad' score represents a combined prediction for the three traits below.

### Machiavellianism
Named after the philosophy espoused by Niccolò Machiavelli in The Prince, people who score high on this trait are cynical (in an amoral self-interest sense, not in a doubtful or skeptical sense), unprincipled, believe in interpersonal manipulation as the key for life success, and behave accordingly. Scores on measures of Machiavellianism correlate negatively with agreeableness (r= -.47) and conscientiousness (r=-.34). Machiavellianism is also significantly correlated with psychopathy.

### Narcissism
Individuals who score high on narcissism display grandiosity, entitlement, dominance, and superiority. Narcissism has been found to correlate positively with extraversion (r = .42) and openness (r = .38) and negatively with agreeableness (r = -.36). Narcissism has also been found to have a significant correlation with psychopathy.

### Psychopathy
Considered the most malevolent of the dark triad, individuals who score high on psychopathy show low levels of empathy combined with high levels of impulsivity and thrill-seeking. The similarity between psychopathy and antisocial personality disorder have been noted by some researchers. Psychopathy has been found to correlate with all of the Big Five personality factors: extraversion (r = .34), agreeableness (r = -.25), conscientiousness (r = -.24), neuroticism (r = -.34) and openness (r = .24).

## The Options Object

The options object is optional and provides a number of controls to allow you to tailor the output to your needs. However, for general use it is recommended that all options are left to their defaults.

### 'encoding'

**String - valid options: 'freq' (default), 'binary', or 'percent'**

"binary" calculates the lexical value as simply a sum of weights, i.e. weight[1] + weight[2] + etc...

"frequency" calculates the lexical value as (word frequency / total wordcount) * word weight

"percent" calculates the percentage of matched tokens in the string for each category, returned as a decimal (i.e. 0.48 = 48%)

Unless you have a specific need for other encoding types, we recommend you use the default only.

### 'locale'

**String - valid options: 'US' (default), 'GB'**

The lexicon data is in American English (US), if the string(s) you want to analyse are in British English set the locale option to 'GB'.

### 'logs'

**Number - valid options: 0, 1, 2 (default), 3**

Used to control console.log, console.warn, and console.error outputs.
* 0 = suppress all logs
* 1 = print errors only
* 2 = print errors and warnings
* 3 = print all console logs

### 'max' and 'min'

**Float**

Exclude words that have weights above the max threshold or below the min threshold.

By default these are set to infinity, ensuring that no words from the lexicon are excluded.

### 'nGrams'

**Array - valid options: [ number, number, ...]**

n-Grams are contiguous pieces of text, bi-grams being chunks of 2, tri-grams being chunks of 3, etc.

Use the nGrams option to include n-gram chunks. For example if you want to include both bi-grams and tri-grams, use like so:

```javascript
{
  nGrams: [2, 3]
}
```

If you only want to include tri-grams:

```javascript
{
  nGrams: [3]
}
```

To disable n-gram inclusion, use the following:

```javascript
{
  nGrams: [0]
}
```

If the number of words in the string is less than the ngram number provided, the option will simply be ignored.

For accuracy it is recommended that n-grams are included, however including n-grams for very long strings can affect performance.

### 'noInt'

**Boolean - valid options: true or false (default)**

The lexica contain intercept values, set noInt to true to ignore these values.

Unless you have a specific need to ignore the intercepts, it is recommended you leave this set to false.

### 'output'

**String - valid options: 'lex' (default), 'matches', or 'full'**

'lex' returns the lexical values, i.e. the natural logarithm for each trait. See "default output example" above.

'matches' returns an array of matched words along with the number of times each word appears, its weight, and its final lexical value. See the output section below for an example.

'full' returns an object containing the lexical value and the matches array.

### 'places'

**Number - 9 (default)**

Number of decimal places to limit outputted values to.

The default is 9.

### 'sortBy'

**String - valid options: 'freq' (default), 'lex', 'weight'**

If 'output' = 'matches', this option can be used to control how the outputted array is sorted.

'lex' sorts by final lexical value, i.e. (word frequency * word count) / word weight.

'weight' sorts the array by the matched words initial weight.

'freq' (default) sorts by word frequency, i.e. the most used words appear first.

### 'wcGrams'

**Boolean - valid options: true or false (default)**

When set to true, the output from the nGrams option will be added to the word count.

For accuracy it is strongly recommended that this is set to false.

## {output: 'matches'} Output Example
(* weights and lexical values below are not representative of the actual lexicon data)

```javascript
{
  darktriad:
    [
      [ 'magnificent', 1, -192.0206116, -1.3914537072463768 ],
      [ 'capital', 1, -133.9311307, -0.9705154398550726 ],
      [ 'note', 3, -34.83417005, -0.7572645663043478 ],
      [ 'america', 2, -49.21227355, -0.7132213557971014 ],
      [ 'republic', 1, -75.5720402, -0.5476234797101449 ]
    ],
  narcissism:
    [
      ....
    ],
  ...
};
```

## Lexicon Weight Ranges and Intercept Values
|Aspect | Min | Max | Intercept |
|-------|:---:|:---:|----------:|
darktriad| -0.0176235193627| 0.0216849781847| 0.632024388686
machiavellianism| -0.036885259918| 0.0284069308808| 0.596743883684
narcissism| -0.0345080393802| 0.028262448375| 0.714881303759
psychopathy| -0.0124719098046| 0.0213553689264| 0.48892463341

## Acknowledgements

### References

Based on [Preotiuc-Pietro, Daniel and Carpenter, Jordan and Giorgi, Salvatore and Ungar, Lyle, {CIKM} (2016). Studying the Dark Triad of Personality using Twitter Behavior. Proceedings of the 25th {ACM} Conference on Information and Knowledge.](http://wwbp.org/papers/darktriad16cikm.pdf)

### Lexicon
Using the dark triad lexicon data by [Daniel Preotiuc-Pietro](https://sites.sas.upenn.edu/danielpr/pages/resources) under the [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/) licence.

## License
(C) 2017-18 [P. Hughes](https://www.phugh.es). All rights reserved.

Shared under the [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/) license.