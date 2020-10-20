import { LOG_DELTA_ENRICH } from './config.js';
import { querySudo as query } from '@lblod/mu-auth-sudo';

/**
 * Rewrites the incoming delta to a delta relevant for the mandatee export
 */
export async function enrichDeltaFile(deltaFile) {
  const enrichedDelta = [];
  for (let changeSet of deltaFile.delta) {

    const updated = {inserts: [], deletes: []};

    if (LOG_DELTA_ENRICH)
      console.log(`Enriching inserted changeSet containing ${changeSet.inserts.length} triples`);
    updated.inserts.push(...await enrichTriples(changeSet.inserts));

    if (updated.inserts.length)
      enrichedDelta.push(updated);
  }
  deltaFile.delta = enrichedDelta;
}



async function enrichTriples(triples) {
  let enriched = [];
  for (let triple of triples) {
    const result = await query(`
      SELECT * WHERE {
        <${triple.subject.value}> a <http://mu.semte.ch/vocabularies/ext/signing/PublishedResource> ;
          ?p ?o .
      }
    `)
    const bindings = result.results.bindings
    enriched = enriched.concat(bindings)
  }
  return enriched;
}