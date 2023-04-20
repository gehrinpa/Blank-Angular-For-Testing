import { HttpParams } from "@angular/common/http";

import { sectorToAdzunaCategory } from "./adzuna-mapping";
import { AuthService } from "./auth.service";

import { SearchParameters, RegionType } from "../shared";

export function getHttpParams(authService: AuthService, searchParams: SearchParameters, titles?: string[]) {
    let params = new HttpParams();

    if (searchParams.regionType) {
        let regionTypeStr = RegionType[searchParams.regionType].toLowerCase();

        if (regionTypeStr == 'lau') {
            regionTypeStr = 'la';
        }

        params = params.set('region_type', regionTypeStr);
        // We don't set region here as some endpoint don't use it
    }

    if (titles) {
        // prevent empty array from querying everything
        if (!titles.length) {
            return null;
        }

        for (const title of titles) {
            params = params.append('title', title);
        }
    // searchParams only allows a single title
    } else if (searchParams.jobTitle) {
        params = params.set('title', searchParams.jobTitle);
    }

    // sector/category
    if (searchParams.sector) {
        // Not allowed
        if (!authService.canViewSector(searchParams.sector)) {
            return null;
        }

        const cat = sectorToAdzunaCategory(searchParams.sector);
        if (cat) {
            params = params.set("category", cat);
        }
    }

    if (searchParams.startDate) {
        params = params.set('start_date', searchParams.startDate.toISOString().split('T')[0]);
    }
    if (searchParams.endDate) {
        params = params.set('end_date', searchParams.endDate.toISOString().split('T')[0]);
    }

    return params;
}
