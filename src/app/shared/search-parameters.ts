import { RegionType } from "./region-type";

export interface SearchParameters {
  company?: string;
  sector?: string;

  regionType?: RegionType;
  regionCode?: string;

  // geo data only
  skill?: string;
  jobTitle?: string;

  // job cloud only
  keySkills?: string[];

  // local jobs only
  startDate?: Date;
  endDate?: Date;

  sicCode?: boolean;
  categories?: string[];
}
