import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { Rescue, RescueLite, Site } from '../graphql';
import { useGetAllSitesQuery } from '../graphql';
import { LoadingSpinner, Text, View } from './Themed';

export function getSite(siteId: string) {
  const allSites = useGetAllSitesQuery().data?.allSites;
  if (!allSites) return null;

  // TODO: Inefficient.  We really shoudl cache this, either in Apollo's cache, or independently.
  const sitesById = {} as Record<string, Site>;
  for (const site of allSites) {
    sitesById[site.id] = site;
  }

  const site = sitesById[siteId];
  if (!site) {
    return {
      id: siteId,
      //fullName: `SITE_${siteId}_IS_MISSING_FROM_SITE_DATA`,
      fullName: siteId,
      collectionTime: 'UNKNOWN',
      geoLocation: 'UNKNOWN',
    } as Site;
  }
  return site;
}

export default function RescueCard({
  rescue,
  additional: Additional,
  onPress,
  onLongPress,
  ...rest
}: {
  rescue: Rescue | RescueLite;
  onPress?: () => void;
  onLongPress?: () => void;
  additional?: React.ComponentType<any>;
}) {
  // Use a TouchableOpacity wrapper, only if the component is clickable
  // (The advantage of using such a wrapper is to change the cursor on hover on web, and for semantics, although a Card can be provided an onPress directly)
  const Wrapper = onPress || onLongPress ? TouchableOpacity : View;
  const siteId = (rescue as RescueLite).siteId || (rescue as Rescue).site.id;
  const site = getSite(siteId);
  return (
    <Wrapper style={styles.wrapper} onPress={onPress} onLongPress={onLongPress}>
      <Card style={styles.card} {...rest}>
        {!site && <LoadingSpinner />}
        {site && (
          <>
            <Title>
              {site.fullName} at {rescue.date}
            </Title>
            <Text>{site.collectionTime}</Text>
            {Additional && (
              <Card.Actions>
                <Additional />
              </Card.Actions>
            )}
          </>
        )}
      </Card>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    margin: 10,
    // Leaves room for scrollbar(s) on web
    width: '90%',
    maxWidth: 600,
  },
  card: {
    padding: 10,
  },
});
