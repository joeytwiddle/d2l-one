import { Rescue, Site } from './graphql';

// PartialBy is (I believe) equivalent to SetOptional, but with fewer dependencies
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type SetOptional<BaseType, Keys extends keyof BaseType> = PartialBy<BaseType, Keys>;

// Allow geoLocation to be optional
//export type PartialSite = SetOptional<Site, 'geoLocation'>;

/*
export interface PartialRescue extends SetOptional<Omit<Rescue, 'site'>, 'collectionTime'> {
  site: PartialSite;
}
*/

export type PartialRescue = Rescue;
