import { LOG_DELTA_ENRICH } from "./config.js";
import { querySudo as query } from "@lblod/mu-auth-sudo";
import { sparqlEscapeUri } from "mu";

/**
 * Rewrites the incoming delta to a delta relevant for the mandatee export
 */
export async function enrichDeltaFile(deltaFile) {
  const enrichedDelta = [];
  for (let changeSet of deltaFile.delta) {
    const updated = { inserts: [], deletes: [] };

    if (LOG_DELTA_ENRICH)
      console.log(
        `Enriching inserted changeSet containing ${changeSet.inserts.length} triples`
      );
    updated.inserts.push(...(await enrichTriples(changeSet.inserts)));

    if (updated.inserts.length) enrichedDelta.push(updated);
  }
  deltaFile.delta = enrichedDelta;
}

async function enrichTriples(triples) {
  let enriched = [];
  let seenSubjects = new Set();
  for (let triple of triples) {
    if (!seenSubjects.has(triple.subject.value)) {
      const result = await query(`

      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
      PREFIX prov: <http://www.w3.org/ns/prov#>
      CONSTRUCT {
        ?subject ?pred ?obj.
        ?virtualFile ?virtPred ?virtObj.
        ?physicalFile ?physPred ?physObj.
        ?attVirtFile ?attVirtPred ?attVirtObj.
        ?attPhysFile ?attPhysPred ?attPhysObj.
      }
      WHERE {
        VALUES ?subject { ${sparqlEscapeUri(triple.subject.value)} }
        { ?subject ?pred ?obj. }
        UNION
        {?subject prov:generated ?virtualFile.
          ?virtualFile ?virtPred ?virtObj.
          ?physicalFile nie:dataSource ?virtualFile.
          ?physicalFile ?physPred ?physObj.
        }
        UNION
        {
          ?subject ext:hasAttachments ?attachment.
          ?attachment ext:hasFile ?attVirtFile.
          ?attVirtFile ?attVirtPred ?attVirtObj.
          ?attPhysFile nie:dataSource ?attVirtFile.
          ?attPhysFile ?attPhysPred ?attPhysObj.

        }

      }
    `);
      const bindings = result.results.bindings;
      const bindingsWithDeltaFormat = bindings.map((binding) => ({
        subject: binding.s,
        predicate: binding.p,
        object: binding.o,
      }));

      enriched = enriched.concat(bindingsWithDeltaFormat);
      seenSubjects.add(triple.subject.value);
    }
  }

  return enriched;
}

