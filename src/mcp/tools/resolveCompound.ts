import { z } from "zod";
import { CompoundResolver } from "../../services/compoundResolver.js";

export const resolveCompoundSchema = {
  query: z.string().describe("Chemical query to resolve (name, common name, IUPAC, SMILES, InChI, or PubChem CID)")
};

export async function handleResolveCompound(
  args: z.infer<z.ZodObject<typeof resolveCompoundSchema>>,
  resolver: CompoundResolver
) {
  const query = args.query.trim();
  const res = await resolver.resolve(query);

  if (res.status === "ambiguous") {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            status: "ambiguous",
            query,
            message: res.ambiguity.message,
            candidates: res.ambiguity.candidates
          }, null, 2)
        }
      ]
    };
  }

  if (res.status === "not_found") {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            status: "not_found",
            error: {
              code: "COMPOUND_NOT_FOUND",
              message: res.message,
              query,
              suggestions: res.suggestions || []
            }
          }, null, 2)
        }
      ]
    };
  }

  const c = res.compound;
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          status: "success",
          compound: {
            name: c.name,
            iupac_name: c.iupacName || null,
            formula: c.formula,
            molecular_weight: c.molecularWeight,
            canonical_smiles: c.canonicalSmiles,
            isomeric_smiles: c.isomericSmiles || c.canonicalSmiles,
            inchi: c.inchi || null,
            inchikey: c.inchikey || null,
            pubchem_cid: c.pubchemCid || null,
            source: c.source
          }
        }, null, 2)
      }
    ]
  };
}
