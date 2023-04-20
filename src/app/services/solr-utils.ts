import { SearchParameters } from "../shared";

export function buildSolrQuery(searchParams: SearchParameters) {
    const ret = [];

    if (searchParams.company) {
        ret.push(`+current_company_l:"${searchParams.company}"`);
    }

    if (searchParams.sector) {
        ret.push(`+merged_sector_l:"${searchParams.sector}"`);
    }

    if (searchParams.jobTitle) {
        ret.push(`+title_l:"${searchParams.jobTitle}"`);
    }

    if (searchParams.skill) {
        ret.push(`+skills_l:"${searchParams.skill}"`);
    }

    return ret.join(' AND ');
}

export function buildSolrJobAndQuery(searchParams: SearchParameters) {
    const ret = [];

    if (searchParams.keySkills) {
        searchParams.keySkills.forEach(function(value) {
            ret.push(`+skills_l:"${value}"`);
        });
    }

    return ret.join(' AND ');
}
export function buildSolrJobOrQuery(searchParams: SearchParameters) {
    const ret = [];

    if (searchParams.keySkills) {
        searchParams.keySkills.forEach(function(value) {
            ret.push(`+skills_l:"${value}"`);
        });
    }

    return ret.join(' OR ');
}
