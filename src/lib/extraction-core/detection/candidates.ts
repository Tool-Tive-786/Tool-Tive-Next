import { ExtractedTable, SourceItem, VectorSegment } from "../model/types";
import { detectBorderedTables } from "./bordered";
import { detectBorderlessTables } from "./borderless";
import { getTableRegions, isInsideRegion } from "./regions";
import { detectTaggedTables } from "./tagged";
import { validateCanonicalTable } from "../validation";
import { getIoU } from "../geometry/coordinates";

export function detectTables(
    pageNumber: number,
    items: SourceItem[],
    segments: VectorSegment[],
    taggedStructure?: any
): ExtractedTable[] {
    const candidates: ExtractedTable[] = [];

    // Problem 2: Filter out known non-table text (document headers, footers, test lines)
    const ignoreRegex = /^(EXPECT:|TEST\s\d+|Priority\s?note|Page\s\d+)/i;
    const filteredItems = items.filter(i => !ignoreRegex.test(i.text.trim()));

    if (taggedStructure) {
        candidates.push(...detectTaggedTables(pageNumber, filteredItems, taggedStructure));
    }

    // Bordered detection works off grid lines
    candidates.push(...detectBorderedTables(pageNumber, filteredItems, segments));

    // Region isolation for borderless detection
    const regions = getTableRegions(filteredItems, segments);
    for (const region of regions) {
        // Find items in this region
        const regionItems = filteredItems.filter(i => isInsideRegion(i, region));
        candidates.push(...detectBorderlessTables(pageNumber, regionItems));
    }

    // Deduplicate candidates (Tagged > Bordered > Borderless)
    // We assume the array order above matches the priority.
    const finalTables: ExtractedTable[] = [];

    for (const candidate of candidates) {
        let isDuplicate = false;
        for (const existing of finalTables) {
            if (getIoU(candidate.bbox, existing.bbox) > 0.8) {
                // High overlap means they detect the same physical table
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate) {
            finalTables.push(candidate);
        }
    }

    // Canonical Validation Pass
    for (const table of finalTables) {
        try {
            validateCanonicalTable(table);
        } catch (e) {
            console.error(`Canonical validation failed for table ${table.id}:`, e);
            // Optionally, we could remove the invalid table here, or surface the issue.
            table.issues = table.issues || [];
            table.issues.push("unassigned_items_present"); // Generic issue fallback
        }
    }

    return finalTables;
}
