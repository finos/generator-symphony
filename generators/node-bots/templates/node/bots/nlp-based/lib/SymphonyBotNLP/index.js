const nlp = require('compromise');
const Q = require('kew');
const SymphonyBotActions = require('../SymphonyBotActions')

var SymphonyBotNLP = {};

/* Request/Response patterns */
SymphonyBotNLP.dictionary = [
  {
    "verb": "(buy|purchase|b)",
    "nouns": [
      {
        "noun": "#Noun",
        "contextParameters": [
          { "name": "amount", "match": "#Value", "mandatory": true }
        ],
        "action": "buyShares"
      }
    ]
  },
  {
    "verb": "(sell|s)",
    "nouns": [
      {
        "noun": "#Noun",
        "contextParameters": [
          { "name": "amount", "match": "#Value", "mandatory": true }
        ],
        "action": "sellShares"
      }
    ]
  },
  {
    "verb": "(price)",
    "nouns": [
      {
        "noun": "#Noun",
        "contextParameters": [],
        "action": "getPrice"
      }
    ]
  }
];

/* Loop over the dictionary to find corresponding patterns */
SymphonyBotNLP.findPattern = (doc, message) => {

  let index = 0;
  /* Loop over the dictionary */
  for (index; index<SymphonyBotNLP.dictionary.length; index++) {
    let nouns_index = 0;

    /* Loop over the nouns */
    for (nouns_index=0; nouns_index<SymphonyBotNLP.dictionary[index].nouns.length; nouns_index++) {

      /* Try to identify a command: verb determiner noun */
      /* Pattern: Verb + Noun + Value */
      let doc_processed = doc.match( SymphonyBotNLP.dictionary[index].verb + ' ' + SymphonyBotNLP.dictionary[index].nouns[nouns_index].noun ).out('tags');
      let context_params_index = 0;
      var context_params = {};
      let missing_mandatory = false;

      /* Is matching successful? */
      if (doc_processed.length>0) {

          /* Test if some context parameters are defined for this command and can be identified */
          if (SymphonyBotNLP.dictionary[index].nouns[nouns_index].contextParameters.length>0) {

            /* Loop over context parameters */
            for (context_params_index=0; context_params_index<SymphonyBotNLP.dictionary[index].nouns[nouns_index].contextParameters.length; context_params_index++) {

              /* Try to match mandatory context parameters */
              var doc_context = doc.match( SymphonyBotNLP.dictionary[index].nouns[nouns_index].contextParameters[context_params_index].match ).out( 'tags' );
              if (doc_context.length>0) {
                context_params[SymphonyBotNLP.dictionary[index].nouns[nouns_index].contextParameters[context_params_index].name] = doc_context[0].normal;
              } else if (SymphonyBotNLP.dictionary[index].nouns[nouns_index].contextParameters[context_params_index].mandatory) {
                missing_mandatory = true;
              }
            }
          }

          /* Call the appropriate action */
          if (!missing_mandatory) {
            var dynamic_call = new Function('SymphonyBotActions', 'tags', 'context_params', 'message',
              'SymphonyBotActions.' + SymphonyBotNLP.dictionary[index].nouns[nouns_index].action +'(tags, context_params, message);'
            );
            dynamic_call(SymphonyBotActions, doc_processed, context_params, message);
          }
      }
    }
  }

}

module.exports = SymphonyBotNLP;
