import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { PartialRescue } from '../client-types';
import { View } from './Themed';

export default function RescueCard({
  rescue,
  additional: Additional,
  onPress,
  onLongPress,
  ...rest
}: {
  rescue: PartialRescue;
  onPress?: () => void;
  onLongPress?: () => void;
  additional?: React.ComponentType<any>;
}) {
  // Use a TouchableOpacity wrapper, only if the component is clickable
  // (The advantage of using such a wrapper is to change the cursor on hover on web, and for semantics, although a Card can be provided an onPress directly)
  const Wrapper = onPress || onLongPress ? TouchableOpacity : View;
  const allSites = useGetAllSitesQuery().data?.allSites;
  return (
    <Wrapper style={styles.wrapper} onPress={onPress} onLongPress={onLongPress}>
      <Card style={styles.card} {...rest}>
        <Title>
          {rescue.site.fullName} at {rescue.date}
        </Title>
        {Additional && (
          <Card.Actions>
            <Additional />
          </Card.Actions>
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
