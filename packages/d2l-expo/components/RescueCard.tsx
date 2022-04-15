import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { getSite } from '../data/site-data';
import { Rescue, RescueLite, Site } from '../graphql';
import { niceDate } from '../screens/RescuesScreen';
import { LoadingSpinner, Text, View } from './Themed';

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
            <Title style={styles.title}>{site.fullName}</Title>
            <Text>
              {niceDate(rescue.date)}, {site.collectionTime}
            </Text>
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
    backgroundColor: '#e8e8e8',
    padding: 10,
  },
  title: {
    fontWeight: 'bold',
  },
});
