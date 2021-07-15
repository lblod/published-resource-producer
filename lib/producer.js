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
          ?predicate ?object .
      }
    `);
    const bindings = result.results.bindings;
    const bindingsWithDeltaFormat = bindings.map((binding)=> ({
      subject: {
        type: 'uri',
        value: triple.subject.value
      },
      predicate: binding.predicate,
      object: binding.object
    }));

    enriched = enriched.concat(bindingsWithDeltaFormat);
    enriched = enriched.concat((await enrichWithFiles(triple.subject.value)));
  }
  return enriched;
}

async function enrichWithFiles(publishedResourceUri) {
  const result = await query(`
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      PREFIX nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX dbpedia: <http://dbpedia.org/ontology/>
      PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
      SELECT * WHERE {
        <${publishedResourceUri}> ext:hasAttachments ?attachment.
        ?attachment ext:hasFile ?file.
        ?file a ?fileType;
          nfo:fileName ?filename;
          mu:uuid ?fileUuid;
          dct:format ?fileFormat;
          nfo:fileSize ?fileSize;
          dbpedia:fileExtension ?fileExtension;
          dct:created ?created.
        ?physicalFile 
          a ?physicalFileType;
          nfo:fileName ?physicalFilename;
          mu:uuid ?physicalFileUuid;
          dct:format ?physicalFileFormat;
          nfo:fileSize ?physicalFileSize;
          dbpedia:fileExtension ?physicalFileExtension;
          dct:created ?physicalFileCreated ;
          nie:dataSource ?file.
      }
  `);
  const bindings = result.results.bindings;
  const bindingsWithDeltaFormat = bindings.map((binding)=> ([
    {
      subject: {
        type: 'uri',
        value: binding.attachment.value
      },
      predicate: {
        type: 'uri',
        value: 'http://mu.semte.ch/vocabularies/ext/hasFile'
      },
      object: binding.file
    },
    {
      subject: {
        type: 'uri',
        value: binding.file.value
      },
      predicate: {
        type: 'uri',
        value: 'a'
      },
      object: binding.fileType
    },
    {
      subject: {
        type: 'uri',
        value: binding.file.value
      },
      predicate: {
        type: 'uri',
        value: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#fileName'
      },
      object: binding.filename
    },
    {
      subject: {
        type: 'uri',
        value: binding.file.value
      },
      predicate: {
        type: 'uri',
        value: 'http://mu.semte.ch/vocabularies/core/uuid'
      },
      object: binding.fileUuid
    },
    {
      subject: {
        type: 'uri',
        value: binding.file.value
      },
      predicate: {
        type: 'uri',
        value: 'http://purl.org/dc/terms/format'
      },
      object: binding.fileFormat
    },
    {
      subject: {
        type: 'uri',
        value: binding.file.value
      },
      predicate: {
        type: 'uri',
        value: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#fileSize'
      },
      object: binding.fileSize
    },
    {
      subject: {
        type: 'uri',
        value: binding.file.value
      },
      predicate: {
        type: 'uri',
        value: 'http://dbpedia.org/resource/fileExtension'
      },
      object: binding.fileExtension
    },
    {
      subject: {
        type: 'uri',
        value: binding.file.value
      },
      predicate: {
        type: 'uri',
        value: 'http://purl.org/dc/terms/created'
      },
      object: binding.created
    },
    {
      subject: {
        type: 'uri',
        value: binding.physicalFile.value
      },
      predicate: {
        type: 'uri',
        value: 'a'
      },
      object: binding.physicalFileType
    },
    {
      subject: {
        type: 'uri',
        value: binding.physicalFile.value
      },
      predicate: {
        type: 'uri',
        value: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#fileName'
      },
      object: binding.physicalFilename
    },
    {
      subject: {
        type: 'uri',
        value: binding.physicalFile.value
      },
      predicate: {
        type: 'uri',
        value: 'http://mu.semte.ch/vocabularies/core/uuid'
      },
      object: binding.physicalFileUuid
    },
    {
      subject: {
        type: 'uri',
        value: binding.physicalFile.value
      },
      predicate: {
        type: 'uri',
        value: 'http://purl.org/dc/terms/format'
      },
      object: binding.physicalFileFormat
    },
    {
      subject: {
        type: 'uri',
        value: binding.physicalFile.value
      },
      predicate: {
        type: 'uri',
        value: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#fileSize'
      },
      object: binding.physicalFileSize
    },
    {
      subject: {
        type: 'uri',
        value: binding.physicalFile.value
      },
      predicate: {
        type: 'uri',
        value: 'http://dbpedia.org/resource/fileExtension'
      },
      object: binding.physicalFileExtension
    },
    {
      subject: {
        type: 'uri',
        value: binding.physicalFile.value
      },
      predicate: {
        type: 'uri',
        value: 'http://purl.org/dc/terms/created'
      },
      object: binding.physicalFileCreated
    },
    {
      subject: {
        type: 'uri',
        value: binding.physicalFile.value
      },
      predicate: {
        type: 'uri',
        value: 'http://www.semanticdesktop.org/ontologies/2007/01/19/nie#dataSource'
      },
      object: binding.file
    },
  ]));
  const flatBindings = [];
  for(let bindingsGroup of bindingsWithDeltaFormat) {
    flatBindings.push(...bindingsGroup);
  }
  return flatBindings;
}