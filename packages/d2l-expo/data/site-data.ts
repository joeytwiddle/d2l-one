import { Site, useGetAllSitesQuery } from '../graphql';

let sitesById = null as Record<string, Site> | null;
let allAreas = null as string[] | null;

// Although we invoke this as a React use hook, it's actually just used to load the data on startup, after which we cache it globally, and can grab it directly from getSite()
export function useSiteDataQuery() {
  const allSitesQuery = useGetAllSitesQuery();
  const allSites = allSitesQuery.data?.allSites;

  if (sitesById == null && allSites) {
    sitesById = {};
    for (const site of allSites) {
      sitesById[site.id] = site;
    }

    allAreas = uniqueArray(
      Object.values(sitesById)
        .map(site => site.area)
        .filter(area => area !== '')
        .sort(),
    );
  }

  //return sitesById;
  return allSitesQuery;
}

export function useSiteDataCached() {
  const cached = sitesById && allAreas;
  return {
    loading: !cached,
    sitesById: sitesById || {},
    allAreas: allAreas || [],
  };
}

export function getSite(siteId: string) {
  const site = sitesById?.[siteId];
  if (!site) {
    return {
      id: siteId,
      //fullName: `SITE_${siteId}_IS_MISSING_FROM_SITE_DATA`,
      fullName: siteId,
      collectionTime: 'UNKNOWN',
      area: 'UNKNOWN',
      geoLocation: 'UNKNOWN',
    } as Site;
  }
  return site;
}

export function uniqueArray<T>(array: T[]) {
  return [...new Set(array)];
}
